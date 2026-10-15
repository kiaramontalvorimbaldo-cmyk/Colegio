'use strict';

/** CRUD de cursos para la dirección. */

const db = require('../db');
const respuesta = require('../respuesta');

const CAMPOS = ['nombre', 'grado', 'seccion', 'periodo', 'docente_id'];

/** GET /api/cursos */
async function listar(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT c.*, u.nombres AS docente_nombres, u.apellidos AS docente_apellidos,
              (SELECT COUNT(*) FROM horarios h WHERE h.curso_id = c.id) AS horas_semana
       FROM cursos c
       INNER JOIN docentes d ON d.id = c.docente_id
       INNER JOIN usuarios  u ON u.id = d.usuario_id
       ORDER BY c.grado, c.seccion`,
    )
    .all();

  return respuesta.ok(res, filas, `Cursos: ${filas.length}`);
}

/** POST /api/cursos y PUT /api/cursos/:id */
async function guardar(req, res) {
  const id = Number(req.params.id || 0);
  const cuerpo = req.body || {};

  const datos = Object.fromEntries(
    CAMPOS.map((campo) => [campo, campo === 'seccion' ? String(cuerpo.seccion ?? '').trim().toUpperCase() : cuerpo[campo]]),
  );

  for (const campo of ['nombre', 'grado', 'seccion', 'periodo']) {
    if (!String(datos[campo] ?? '').trim()) {
      return respuesta.error(res, `El campo ${campo} es obligatorio`);
    }
  }
  if (!await db.obtener().prepare('SELECT id FROM docentes WHERE id = ?').get(Number(datos.docente_id))) {
    return respuesta.error(res, 'Debe seleccionar un docente valido');
  }

  const repetido = await db
    .obtener()
    .prepare(
      `SELECT id FROM cursos
       WHERE nombre = ? AND grado = ? AND seccion = ? AND periodo = ? AND id <> ?`,
    )
    .get(datos.nombre.trim(), datos.grado.trim(), datos.seccion.trim(), datos.periodo.trim(), id);
  if (repetido) {
    return respuesta.error(res, 'Ya existe ese curso en el mismo grado, seccion y periodo');
  }

  if (id > 0) {
    if (!await db.obtener().prepare('SELECT id FROM cursos WHERE id = ?').get(id)) {
      return respuesta.noEncontrado(res, 'Curso no encontrado');
    }
    await db.obtener()
      .prepare('UPDATE cursos SET nombre = @nombre, grado = @grado, seccion = @seccion, periodo = @periodo, docente_id = @docente_id WHERE id = @id')
      .run({ ...datos, id });
    const actualizado = await db.obtener().prepare('SELECT * FROM cursos WHERE id = ?').get(id);
    return respuesta.ok(res, actualizado, 'Curso actualizado');
  }

  const info = await db
    .obtener()
    .prepare('INSERT INTO cursos (nombre, grado, seccion, periodo, docente_id) VALUES (@nombre, @grado, @seccion, @periodo, @docente_id)')
    .run(datos);
  const creado = await db.obtener().prepare('SELECT * FROM cursos WHERE id = ?').get(info.lastInsertRowid);
  return respuesta.creado(res, creado, 'Curso creado');
}

/** DELETE /api/cursos/:id */
async function eliminar(req, res) {
  const id = Number(req.params.id);
  const curso = await db.obtener().prepare('SELECT id FROM cursos WHERE id = ?').get(id);
  if (!curso) return respuesta.noEncontrado(res, 'Curso no encontrado');

  await db.obtener().prepare('DELETE FROM cursos WHERE id = ?').run(id);
  return respuesta.ok(res, null, 'Curso eliminado');
}

module.exports = { listar, guardar, eliminar };