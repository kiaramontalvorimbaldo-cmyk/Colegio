'use strict';

/**
 * Conexion SQLite conservada como origen para migrar los datos locales.
 */

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

require('dotenv').config();

const rutaConfig = process.env.DB_PATH || './db/academico.db';
const rutaSchema = path.join(__dirname, '..', 'db', 'schema.sql');

let conexion = null;

function obtener() {
  if (conexion) return conexion;

  const ruta = path.isAbsolute(rutaConfig) ? rutaConfig : path.join(__dirname, '..', rutaConfig);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  conexion = new Database(ruta);
  conexion.pragma('foreign_keys = ON');
  return conexion;
}

function aplicarSchema() {
  obtener().exec(fs.readFileSync(rutaSchema, 'utf8'));
}

function cerrar() {
  if (conexion) {
    conexion.close();
    conexion = null;
  }
}

module.exports = { obtener, aplicarSchema, cerrar, rutaConfig, rutaSchema };
