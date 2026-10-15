'use strict';

/** Asistencia del docente por curso y fecha, con guardado masivo. */

const db = require('../db');
const respuesta = require('../respuesta');
const { idDocente } = require('./docente.controller');

const ESTADOS = ['presente', 'tardanza', 'falta', 'justificada'];

const { fechaValida } = require('../validacion');

/** Devuelve el curso si pertenece al docente de la sesiÃ³n. */
async function cursoDelDocente(cursoId, usuarioId) {
  const curso = await db
    .obtener()
    .prepare(
      `SELECT c.id, c.nombre, c.grado, c.seccion, c.docente_id
       FROM cursos c WHERE c.id = ?`,
    )
    .get(cursoId);

  if (!curso) return { error: { status: 404, mensaje: 'El curso no existe' } };
  if (curso.docente_id !== await idDocente(usuarioId)) {
    return { error: { status: 403, mensaje: 'El curso no esta asignado a su cuenta' } };
  }
  return { curso };
}

/** GET /api/asistencias?curso_id=1&fecha=2026-03-11 */
async function listar(req, res) {
  const cursoId = Number(req.query.curso_id);
  const fecha = String(req.query.fecha ?? '');

  if (!fechaValida(fecha)) {
    return respuesta.error(res, 'La fecha debe tener el formato AAAA-MM-DD');
  }

  const { curso, error } = await cursoDelDocente(cursoId, req.usuario.id);
  if (error) return respuesta.error(res, error.mensaje, error.status);

  const estudiantes = await db
    .obtener()
    .prepare(
      `SELECT e.id, e.dni, e.nombres, e.apellidos,
              a.id AS asistencia_id, IFNULL(a.estado, 'pendiente') AS estado
       FROM estudiantes e
       LEFT JOIN asistencias a
              ON a.estudiante_id = e.id AND a.curso_id = ? AND a.fecha = ?
       WHERE e.grado = ? AND e.seccion = ?
       ORDER BY e.apellidos, e.nombres`,
    )
    .all(curso.id, fecha, curso.grado, curso.seccion);

  return respuesta.ok(
    res,
    { curso: { id: curso.id, nombre: curso.nombre, grado: curso.grado, seccion: curso.seccion }, fecha, estudiantes },
    `Listado de ${estudiantes.length} estudiantes`,
  );
}

/** POST /api/asistencias - crea o actualiza los registros del dÃ­a. */
async function guardar(req, res) {
  const { curso_id: cursoId, fecha, registros } = req.body || {};

  if (!fechaValida(fecha)) {
    return respuesta.error(res, 'La fecha debe tener el formato AAAA-MM-DD');
  }
  if (!Array.isArray(registros) || registros.length === 0) {
    return respuesta.error(res, 'Envie al menos un registro de asistencia');
  }

  const { curso, error } = await cursoDelDocente(Number(cursoId), req.usuario.id);
  if (error) return respuesta.error(res, error.mensaje, error.status);

  // Solo se aceptan estudiantes del propio curso (mismo grado y secciÃ³n).
  const permitidos = new Set(
    (await db
      .obtener()
      .prepare('SELECT id FROM estudiantes WHERE grado = ? AND seccion = ?')
      .all(curso.grado, curso.seccion)
    ).map((fila) => fila.id),
  );

  for (const registro of registros) {
    const estudianteId = Number(registro.estudiante_id);
    if (!permitidos.has(estudianteId)) {
      return respuesta.error(res, `El estudiante ${estudianteId} no pertenece al curso`);
    }
    if (!ESTADOS.includes(registro.estado)) {
      return respuesta.error(res, `Estado de asistencia no valido: ${registro.estado}`);
    }
  }

  await db.obtener().transaction(async (tx) => {
    const guardar = tx.prepare(
      `INSERT INTO asistencias (curso_id, estudiante_id, fecha, estado, registrado_por)
       VALUES (@curso_id, @estudiante_id, @fecha, @estado, @registrado_por)
       ON CONFLICT (curso_id, estudiante_id, fecha)
       DO UPDATE SET estado = EXCLUDED.estado, registrado_por = EXCLUDED.registrado_por`,
    );
    for (const registro of registros) {
      await guardar.run({
        curso_id: curso.id,
        estudiante_id: Number(registro.estudiante_id),
        fecha,
        estado: registro.estado,
        registrado_por: req.usuario.id,
      });
    }
  });

  return respuesta.ok(res, { registros: registros.length, fecha }, `Asistencia guardada: ${registros.length} registros`);
}

module.exports = { listar, guardar, ESTADOS };