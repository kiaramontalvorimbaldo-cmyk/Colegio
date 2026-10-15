'use strict';

process.env.SUPABASE_DB_URL = 'postgresql://user:password@localhost:5432/test';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { convertirConsulta } = require('../src/db-postgres');

test('convierte placeholders posicionales sin alterar literales SQL', () => {
  const resultado = convertirConsulta(
    "SELECT * FROM cursos WHERE id = ? AND estado <> '?' AND grado = ?",
    [12, '5to'],
  );

  assert.equal(
    resultado.consulta,
    "SELECT * FROM cursos WHERE id = $1 AND estado <> '?' AND grado = $2",
  );
  assert.deepEqual(resultado.valores, [12, '5to']);
});

test('convierte placeholders nombrados y mantiene referencias repetidas', () => {
  const resultado = convertirConsulta(
    'SELECT * FROM mensajes WHERE remitente_id = @id OR destinatario_id = @id',
    [{ id: 7 }],
  );

  assert.equal(resultado.consulta, 'SELECT * FROM mensajes WHERE remitente_id = $1 OR destinatario_id = $1');
  assert.deepEqual(resultado.valores, [7]);
});

test('traduce funciones de SQLite usadas por las consultas existentes', () => {
  const resultado = convertirConsulta("SELECT IFNULL(fecha, datetime('now')) AS fecha FROM mensajes", []);

  assert.equal(resultado.consulta, 'SELECT COALESCE(fecha, CURRENT_TIMESTAMP) AS fecha FROM mensajes');
  assert.deepEqual(resultado.valores, []);
});
