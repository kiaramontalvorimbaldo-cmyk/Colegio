'use strict';

/** CRUD de horarios con validación de cruces (docente y aula). */

const db = require('../db');
const respuesta = require('../respuesta');

const DIAS = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};
const HORA = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** GET /api/horarios */
async function listar(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT h.*, c.nombre AS curso, c.grado, c.seccion, c.docente_id,
              u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
       FROM horarios h
       INNER JOIN cursos c ON c.id = h.curso_id
       INNER JOIN docentes d ON d.id = c.docente_id
       INNER JOIN usuarios  u ON u.id = d.usuario_id
       ORDER BY h.dia, h.hora_inicio`,
    )
    .all();

  return respuesta.ok(res, filas, `Horarios: ${filas.length}`);
}

/** POST /api/horarios y PUT /api/horarios/:id */
async function guardar(req, res) {
  const id = Number(req.params.id || 0);
  const cuerpo = req.body || {};

  const cursoId = Number(cuerpo.curso_id);
  const dia = Number(cuerpo.dia);
  const horaInicio = String(cuerpo.hora_inicio ?? '');
  const horaFin = String(cuerpo.hora_fin ?? '');
  const aula = String(cuerpo.aula ?? '').trim().toUpperCase();

  const curso = await db
    .obtener()
    .prepare('SELECT id, nombre, grado, seccion, docente_id FROM cursos WHERE id = ?')
    .get(cursoId);
  if (!curso) return respuesta.error(res, 'Debe seleccionar un curso valido');
  if (!DIAS[dia]) return respuesta.error(res, 'El dia debe estar entre 1 (lunes) y 7 (domingo)');
  if (!HORA.test(horaInicio) || !HORA.test(horaFin)) {
    return respuesta.error(res, 'Las horas deben tener el formato HH:MM');
  }
  if (horaFin <= horaInicio) {
    return respuesta.error(res, 'La hora de fin debe ser mayor que la hora de inicio');
  }
  if (!aula) return respuesta.error(res, 'El aula es obligatoria');

  // Cruce: mismo docente o misma aula, mismo dia y rangos solapados
  const cruce = await db
    .obtener()
    .prepare(
      `SELECT h.hora_inicio, h.hora_fin, h.aula, c.nombre AS curso, c.docente_id
       FROM horarios h
       INNER JOIN cursos c ON c.id = h.curso_id
       WHERE h.dia = @dia
         AND h.hora_inicio < @hora_fin
         AND h.hora_fin > @hora_inicio
         AND (c.docente_id = @docente_id OR h.aula = @aula)
         AND h.id <> @id
       LIMIT 1`,
    )
    .get({ dia, hora_fin: horaFin, hora_inicio: horaInicio, docente_id: curso.docente_id, aula, id });

  if (cruce) {
    const motivo = cruce.docente_id === curso.docente_id
      ? 'el docente ya tiene'
      : 'el aula ya esta ocupada en';
    return respuesta.error(
      res,
      `No se puede registrar: ${motivo} el ${DIAS[dia]} de ${cruce.hora_inicio.slice(0, 5)} a ${cruce.hora_fin.slice(0, 5)} (${cruce.curso}, aula ${cruce.aula}).`,
    );
  }

  const datos = { curso_id: cursoId, dia, hora_inicio: horaInicio, hora_fin: horaFin, aula };

  if (id > 0) {
    if (!await db.obtener().prepare('SELECT id FROM horarios WHERE id = ?').get(id)) {
      return respuesta.noEncontrado(res, 'Horario no encontrado');
    }
    await db.obtener()
      .prepare(
        `UPDATE horarios SET curso_id = @curso_id, dia = @dia, hora_inicio = @hora_inicio,
                             hora_fin = @hora_fin, aula = @aula
         WHERE id = @id`,
      )
      .run({ ...datos, id });
    const actualizado = await db.obtener().prepare('SELECT * FROM horarios WHERE id = ?').get(id);
    return respuesta.ok(res, actualizado, 'Horario actualizado');
  }

  const info = await db
    .obtener()
    .prepare(
      `INSERT INTO horarios (curso_id, dia, hora_inicio, hora_fin, aula)
       VALUES (@curso_id, @dia, @hora_inicio, @hora_fin, @aula)`,
    )
    .run(datos);
  const creado = await db.obtener().prepare('SELECT * FROM horarios WHERE id = ?').get(info.lastInsertRowid);
  return respuesta.creado(res, creado, 'Horario creado');
}

/** DELETE /api/horarios/:id */
async function eliminar(req, res) {
  const id = Number(req.params.id);
  if (!await db.obtener().prepare('SELECT id FROM horarios WHERE id = ?').get(id)) {
    return respuesta.noEncontrado(res, 'Horario no encontrado');
  }
  await db.obtener().prepare('DELETE FROM horarios WHERE id = ?').run(id);
  return respuesta.ok(res, null, 'Horario eliminado');
}

module.exports = { listar, guardar, eliminar };