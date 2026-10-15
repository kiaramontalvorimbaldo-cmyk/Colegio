'use strict';

/** Pool PostgreSQL compartido por la API. */

const fs = require('node:fs');
const path = require('node:path');
const { Pool, types } = require('pg');

require('dotenv').config();

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('Falta SUPABASE_DB_URL en backend/.env');
}

types.setTypeParser(20, (valor) => {
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero)) {
    throw new Error(`El valor PostgreSQL excede el rango entero seguro de JavaScript: ${valor}`);
  }
  return numero;
});

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: true },
});

function preparar(sql, ejecutar = pool.query.bind(pool)) {
  return {
    async all(...argumentos) {
      const { consulta, valores } = convertirConsulta(sql, argumentos);
      const resultado = await ejecutar(consulta, valores);
      return resultado.rows;
    },
    async get(...argumentos) {
      const { consulta, valores } = convertirConsulta(sql, argumentos);
      const resultado = await ejecutar(consulta, valores);
      return resultado.rows[0];
    },
    async run(...argumentos) {
      let consultaSql = sql.trim().replace(/;$/, '');
      if (/^\s*INSERT\b/i.test(consultaSql) && !/\bRETURNING\b/i.test(consultaSql)) {
        consultaSql += ' RETURNING id';
      }
      const { consulta, valores } = convertirConsulta(consultaSql, argumentos);
      const resultado = await ejecutar(consulta, valores);
      return {
        lastInsertRowid: resultado.rows[0]?.id,
        changes: resultado.rowCount,
      };
    },
  };
}

function convertirConsulta(sql, argumentos) {
  const consulta = sql
    .replace(/datetime\(\s*'now'\s*\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bIFNULL\s*\(/gi, 'COALESCE(');
  const valoresEntrada = argumentos.length === 1 && argumentos[0] !== null
    && typeof argumentos[0] === 'object' && !Array.isArray(argumentos[0])
    ? argumentos[0]
    : argumentos;
  const valores = [];
  const posiciones = new Map();
  let indicePosicional = 0;
  const consultaSql = consulta.replace(/('[^']*')|(@[a-z_][a-z0-9_]*|\?)/gi, (parte, cadena, marcador) => {
    if (cadena) return cadena;
    const nombre = marcador.startsWith('@') ? marcador.slice(1) : null;
    const clave = nombre || `?${indicePosicional++}`;
    if (!posiciones.has(clave)) {
      posiciones.set(clave, valores.length + 1);
      valores.push(nombre ? valoresEntrada[nombre] : valoresEntrada[Number(clave.slice(1))]);
    }
    return `$${posiciones.get(clave)}`;
  });

  return { consulta: consultaSql, valores };
}

function obtener() {
  return {
    prepare: (sql) => preparar(sql),
    async transaction(operacion) {
      const cliente = await pool.connect();
      try {
        await cliente.query('BEGIN');
        const resultado = await operacion({
          prepare: (sql) => preparar(sql, cliente.query.bind(cliente)),
        });
        await cliente.query('COMMIT');
        return resultado;
      } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
      } finally {
        cliente.release();
      }
    },
  };
}

async function aplicarSchema() {
  const rutaSchema = path.join(__dirname, '..', 'db', 'schema.postgres.sql');
  await pool.query(fs.readFileSync(rutaSchema, 'utf8'));
}

async function cerrar() {
  await pool.end();
}

module.exports = { obtener, aplicarSchema, cerrar, pool, convertirConsulta };