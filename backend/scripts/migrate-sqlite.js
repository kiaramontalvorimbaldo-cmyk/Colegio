'use strict';

/**
 * Copia los datos de SQLite a Supabase en una única transacción.
 * Requiere que las tablas del proyecto estén vacías en PostgreSQL.
 */

const fs = require('node:fs');
const path = require('node:path');
const sqlite = require('../src/db-sqlite');
const postgres = require('../src/db-postgres');

const TABLAS = [
  'roles',
  'usuarios',
  'docentes',
  'estudiantes',
  'cursos',
  'horarios',
  'asistencias',
  'incidencias',
  'evaluaciones_docentes',
  'ugel_contactos',
  'mensajes',
  'plantillas_ugel',
  'parametros_economicos',
  'pagos',
];

function rutaSqlite() {
  return path.isAbsolute(sqlite.rutaConfig)
    ? sqlite.rutaConfig
    : path.resolve(__dirname, '..', sqlite.rutaConfig);
}

async function migrar() {
  let cliente;
  let transaccionIniciada = false;
  try {
    const origen = rutaSqlite();
    if (!fs.existsSync(origen)) {
      throw new Error(`No existe la base SQLite de origen: ${origen}`);
    }

    const bdSqlite = sqlite.obtener();
    const tablasOrigen = new Set(
      bdSqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((fila) => fila.name),
    );
    const faltantes = TABLAS.filter((tabla) => !tablasOrigen.has(tabla));
    if (faltantes.length) {
      throw new Error(`La base SQLite no contiene las tablas requeridas: ${faltantes.join(', ')}`);
    }

    await postgres.aplicarSchema();
    cliente = await postgres.pool.connect();

    const conteos = await Promise.all(
      TABLAS.map(async (tabla) => {
        const resultado = await cliente.query(`SELECT COUNT(*) AS total FROM public.${tabla}`);
        return { tabla, total: Number(resultado.rows[0].total) };
      }),
    );
    const ocupadas = conteos.filter((fila) => fila.total > 0);
    if (ocupadas.length) {
      throw new Error(
        `La migración requiere las tablas del proyecto vacías en Supabase. Con datos: ${ocupadas.map((fila) => fila.tabla).join(', ')}`,
      );
    }

    await cliente.query('BEGIN');
    transaccionIniciada = true;
    for (const tabla of TABLAS) {
      const filas = bdSqlite.prepare(`SELECT * FROM ${tabla}`).all();
      if (filas.length === 0) {
        console.log(`${tabla}: 0 filas`);
        continue;
      }

      const columnas = Object.keys(filas[0]);
      const identificadores = columnas.map((columna) => `"${columna}"`).join(', ');
      const marcadores = columnas.map((_, indice) => `$${indice + 1}`).join(', ');
      const consulta = `INSERT INTO public.${tabla} (${identificadores}) VALUES (${marcadores})`;
      for (const fila of filas) {
        await cliente.query(consulta, columnas.map((columna) => fila[columna]));
      }

      if (tabla !== 'parametros_economicos') {
        await cliente.query(
          `SELECT setval(
             pg_get_serial_sequence('public.${tabla}', 'id'),
             COALESCE(MAX(id), 1),
             COUNT(*) > 0
           ) FROM public.${tabla}`,
        );
      }
      console.log(`${tabla}: ${filas.length} filas`);
    }
    await cliente.query('COMMIT');
    transaccionIniciada = false;
    console.log('Migración SQLite → Supabase completada.');
  } catch (error) {
    if (cliente && transaccionIniciada) await cliente.query('ROLLBACK');
    throw error;
  } finally {
    if (cliente) cliente.release();
    sqlite.cerrar();
    await postgres.cerrar();
  }
}

migrar().catch((error) => {
  console.error('No se pudo completar la migración:', error.message);
  process.exitCode = 1;
});
