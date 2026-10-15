'use strict';

/** Incidencias: alta y consulta del docente, gestiÃ³n y respuesta de la direcciÃ³n. */

const db = require('../db');
const respuesta = require('../respuesta');
const { idDocente } = require('./docente.controller');

const TIPOS = ['conducta', 'rendimiento', 'asistencia', 'otro'];
const ESTADOS = ['pendiente', 'en_proceso', 'resuelta'];
const { fechaValida } = require('../validacion');

const SELECCION = `
  SELECT i.*, e.nombres, e.apellidos, e.grado, e.seccion,
         u.nombres AS docente_nombres, u.apellidos AS docente_apellidos
  FROM incidencias i
  INNER JOIN estudiantes e ON e.id = i.estudiante_id
  INNER JOIN docentes  d ON d.id = i.docente_id
  INNER JOIN usuarios   u ON u.id = d.usuario_id`;

/** GET /api/incidencias?estado= - docente: las suyas | direcciÃ³n: todas */
async function listar(req, res) {
  const estado = String(req.query.estado ?? '');
  if (estado && !ESTADOS.includes(estado)) {
    return respuesta.error(res, 'Estado de incidencia no valido');
  }

  if (req.usuario.rol === 'DIRECTOR') {
    const filas = await db
      .obtener()
      .prepare(`${SELECCION} ORDER BY CASE i.estado WHEN 'pendiente' THEN 0 WHEN 'en_proceso' THEN 1 ELSE 2 END, i.fecha DESC`)
      .all();
    const filtradas = estado ? filas.filter((fila) => fila.estado === estado) : filas;
    return respuesta.ok(res, filtradas, `Incidencias de la institucion: ${filtradas.length}`);
  }

  let sql = `${SELECCION} WHERE i.docente_id = ?`;
  const params = [await idDocente(req.usuario.id)];
  if (estado) {
    sql += ' AND i.estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY i.fecha DESC, i.id DESC';

  const filas = await db.obtener().prepare(sql).all(...params);
  return respuesta.ok(res, filas, `Incidencias registradas: ${filas.length}`);
}

/** POST /api/incidencias - el docente registra; nace en estado pendiente. */
async function crear(req, res) {
  const { estudiante_id: estudianteId, tipo, descripcion, fecha } = req.body || {};

  if (!TIPOS.includes(tipo)) {
    return respuesta.error(res, 'Tipo de incidencia no valido');
  }
  if (!descripcion?.trim() || descripcion.trim().length < 10) {
    return respuesta.error(res, 'La descripcion debe tener al menos 10 caracteres');
  }
  if (!fechaValida(fecha)) {
    return respuesta.error(res, 'La fecha debe tener el formato AAAA-MM-DD');
  }

  const docenteId = await idDocente(req.usuario.id);
  if (!docenteId) {
    return respuesta.sinPermiso(res, 'El usuario no esta registrado como docente');
  }

  const estudiante = await db
    .obtener()
    .prepare(
      `SELECT e.id FROM estudiantes e
       INNER JOIN cursos c ON c.grado = e.grado AND c.seccion = e.seccion
       WHERE e.id = ? AND c.docente_id = ?`,
    )
    .get(Number(estudianteId), docenteId);

  if (!estudiante) {
    return respuesta.error(res, 'El estudiante no pertenece a sus cursos');
  }

  const info = await db
    .obtener()
    .prepare(
      `INSERT INTO incidencias (estudiante_id, docente_id, tipo, descripcion, fecha, estado)
       VALUES (?, ?, ?, ?, ?, 'pendiente')`,
    )
    .run(estudiante.id, docenteId, tipo, descripcion.trim(), fecha);

  const creada = await db.obtener().prepare('SELECT * FROM incidencias WHERE id = ?').get(info.lastInsertRowid);
  return respuesta.creado(res, creada, 'Incidencia registrada');
}

/** PUT /api/incidencias/:id - la direcciÃ³n cambia el estado y responde. */
async function actualizar(req, res) {
  const id = Number(req.params.id);
  const incidencia = await db.obtener().prepare('SELECT * FROM incidencias WHERE id = ?').get(id);
  if (!incidencia) return respuesta.noEncontrado(res, 'Incidencia no encontrada');

  const { estado, respuesta_director: respuestaDirector } = req.body || {};
  const cambios = [];

  if (estado !== undefined) {
    if (!ESTADOS.includes(estado)) {
      return respuesta.error(res, 'Estado de incidencia no valido');
    }
    cambios.push('estado = @estado');
  }

  let texto = incidencia.respuesta_director;
  if (respuestaDirector !== undefined) {
    texto = respuestaDirector?.trim() ? respuestaDirector.trim() : null;
    if (texto && texto.length < 5) {
      return respuesta.error(res, 'La respuesta debe tener al menos 5 caracteres');
    }
    cambios.push('respuesta_director = @respuesta_director');
  }

  if (cambios.length === 0) {
    return respuesta.error(res, 'No se envio ningun campo permitido');
  }

  const estadoFinal = estado ?? incidencia.estado;
  if (estadoFinal === 'resuelta') {
    cambios.push("fecha_respuesta = datetime('now')");
  }

  await db.obtener()
    .prepare(`UPDATE incidencias SET ${cambios.join(', ')} WHERE id = @id`)
    .run({ id, estado: estadoFinal, respuesta_director: texto });

  const actualizada = await db.obtener().prepare('SELECT * FROM incidencias WHERE id = ?').get(id);
  return respuesta.ok(res, actualizada, 'Incidencia actualizada');
}

module.exports = { listar, crear, actualizar };