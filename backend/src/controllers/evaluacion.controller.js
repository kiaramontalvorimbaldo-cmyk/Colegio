'use strict';

/** Evaluación de docentes: puntaje 1 a 5, observación obligatoria y promedios. */

const db = require('../db');
const respuesta = require('../respuesta');

const { fechaValida } = require('../validacion');

/** GET /api/evaluaciones?docente_id=N */
async function listar(req, res) {
  const docenteId = Number(req.query.docente_id || 0);

  let sql = `SELECT e.*, u.nombres, u.apellidos, d.especialidad
             FROM evaluaciones_docentes e
             INNER JOIN docentes d ON d.id = e.docente_id
             INNER JOIN usuarios  u ON u.id = d.usuario_id`;
  const params = [];

  if (docenteId > 0) {
    sql += ' WHERE e.docente_id = ?';
    params.push(docenteId);
  }
  sql += ' ORDER BY e.fecha DESC, e.id DESC';

  const evaluaciones = await db.obtener().prepare(sql).all(...params);

  const promedios = await db
    .obtener()
    .prepare(
      `SELECT d.id AS docente_id, u.nombres, u.apellidos,
              COUNT(e.id) AS evaluaciones, CAST(ROUND(AVG(e.puntaje), 2) AS DOUBLE PRECISION) AS promedio
       FROM docentes d
       INNER JOIN usuarios u ON u.id = d.usuario_id
       LEFT JOIN evaluaciones_docentes e ON e.docente_id = d.id
       GROUP BY d.id, u.nombres, u.apellidos
       ORDER BY promedio DESC, u.apellidos`,
    )
    .all();

  return respuesta.ok(res, { evaluaciones, promedios }, 'Evaluaciones de docentes');
}

/** POST /api/evaluaciones */
async function crear(req, res) {
  const { docente_id: docenteId, puntaje, observaciones, fecha } = req.body || {};
  const nota = Number(puntaje);

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return respuesta.error(res, 'El puntaje debe ser un numero entero entre 1 y 5');
  }
  if (!observaciones?.trim() || observaciones.trim().length < 10) {
    return respuesta.error(res, 'La observacion es obligatoria (minimo 10 caracteres)');
  }
  if (!fechaValida(fecha)) {
    return respuesta.error(res, 'La fecha debe tener el formato AAAA-MM-DD');
  }

  const docente = await db
    .obtener()
    .prepare('SELECT id FROM docentes WHERE id = ?')
    .get(Number(docenteId));
  if (!docente) {
    return respuesta.error(res, 'Debe seleccionar un docente valido');
  }

  const info = await db
    .obtener()
    .prepare(
      `INSERT INTO evaluaciones_docentes (docente_id, director_id, puntaje, observaciones, fecha)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(docente.id, req.usuario.id, nota, observaciones.trim(), fecha);

  const creada = await db
    .obtener()
    .prepare(
      `SELECT e.*, u.nombres, u.apellidos FROM evaluaciones_docentes e
       INNER JOIN docentes d ON d.id = e.docente_id
       INNER JOIN usuarios  u ON u.id = d.usuario_id
       WHERE e.id = ?`,
    )
    .get(info.lastInsertRowid);

  return respuesta.creado(res, creada, 'Evaluacion registrada');
}

module.exports = { listar, crear };