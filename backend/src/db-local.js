'use strict';
// Adaptador SQLite con el contrato asíncrono utilizado por los controladores.
const sqlite = require('./db-sqlite');
let cola = Promise.resolve();
function exclusivo(operacion) {
  const resultado = cola.then(operacion);
  cola = resultado.catch(() => {});
  return resultado;
}
function preparar(sql, directo = false) {
  const ejecutar = (metodo, args) => {
    const operacion = () => {
      const sentencia = sqlite.obtener().prepare(sql);
      // better-sqlite3 no acepta claves nombradas sobrantes.
      if (args.length === 1 && args[0] && !Array.isArray(args[0]) && typeof args[0] === 'object') {
        const nombres = new Set([...sql.matchAll(/@([a-z_][a-z0-9_]*)/gi)].map(m => m[1]));
        args = [Object.fromEntries(Object.entries(args[0]).filter(([k]) => nombres.has(k)))];
      }
      return sentencia[metodo](...args);
    };
    return directo ? operacion() : exclusivo(operacion);
  };
  return Object.fromEntries(['all', 'get', 'run'].map(m => [m, (...args) => ejecutar(m, args)]));
}
function obtener() {
  return {
    prepare: sql => preparar(sql),
    transaction: operacion => exclusivo(async () => {
      const bd = sqlite.obtener();
      bd.exec('BEGIN IMMEDIATE');
      try {
        const resultado = await operacion({ prepare: sql => preparar(sql, true) });
        bd.exec('COMMIT');
        return resultado;
      } catch (error) { bd.exec('ROLLBACK'); throw error; }
    }),
  };
}
module.exports = { obtener, aplicarSchema: sqlite.aplicarSchema, cerrar: () => exclusivo(sqlite.cerrar) };
