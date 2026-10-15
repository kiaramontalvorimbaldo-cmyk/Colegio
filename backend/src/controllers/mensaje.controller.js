'use strict';

/** Mensajería entre docentes y dirección (y, desde el Sprint 6, con la UGEL). */

const db = require('../db');
const respuesta = require('../respuesta');

const SELECCION = `
  SELECT m.id, m.destinatario_id, m.asunto, m.cuerpo, m.fecha, m.leido,
         ur.nombres AS remitente_nombres, ur.apellidos AS remitente_apellidos,
         ud.nombres AS destinatario_nombres, ud.apellidos AS destinatario_apellidos,
         g.nombre AS destinatario_ugel
  FROM mensajes m
  INNER JOIN      usuarios ur ON ur.id = m.remitente_id
  LEFT  JOIN      usuarios ud ON ud.id = m.destinatario_id
  LEFT  JOIN ugel_contactos g ON g.id = m.destinatario_ugel_id`;

/** GET /api/mensajes?carpeta=recibidos|enviados|todos */
async function listar(req, res) {
  const usuarioId = req.usuario.id;
  const carpeta = ['recibidos', 'enviados', 'todos'].includes(req.query.carpeta) ? req.query.carpeta : 'todos';

  const condiciones = {
    recibidos: 'm.destinatario_id = @id',
    enviados: 'm.remitente_id = @id',
    todos: '(m.destinatario_id = @id OR m.remitente_id = @id)',
  }[carpeta];

  const filas = await db
    .obtener()
    .prepare(`${SELECCION} WHERE ${condiciones} ORDER BY m.fecha DESC, m.id DESC`)
    .all({ id: usuarioId });

  const noLeidos = filas.filter(
    (fila) => fila.leido === 0 && fila.destinatario_id === usuarioId,
  ).length;

  return respuesta.ok(res, { mensajes: filas, no_leidos: noLeidos }, 'Bandeja de mensajes');
}

/** POST /api/mensajes - el docente escribe a la dirección; la dirección, a docentes o UGEL. */
async function crear(req, res) {
  const { asunto, cuerpo, destinatario_id: destinatarioId, tipo_destino: tipoDestino, destinatario_ugel_id: ugelId } = req.body || {};

  if (!asunto?.trim() || !cuerpo?.trim()) {
    return respuesta.error(res, 'El asunto y el cuerpo del mensaje son obligatorios');
  }
  if (asunto.trim().length > 120 || cuerpo.trim().length > 2000) {
    return respuesta.error(res, 'El asunto admite 120 y el cuerpo 2000 caracteres');
  }

  const destino = req.usuario.rol === 'DIRECTOR'
    ? await destinoDirector(tipoDestino, destinatarioId, ugelId)
    : await destinoDocente(destinatarioId);

  if (destino.error) {
    return respuesta.error(res, destino.error);
  }

  const info = await db
    .obtener()
    .prepare(
      `INSERT INTO mensajes (remitente_id, destinatario_id, destinatario_ugel_id, asunto, cuerpo, fecha)
       VALUES (@remitente_id, @destinatario_id, @destinatario_ugel_id, @asunto, @cuerpo, datetime('now'))`,
    )
    .run({
      remitente_id: req.usuario.id,
      destinatario_id: destino.destinatario_id ?? null,
      destinatario_ugel_id: destino.destinatario_ugel_id ?? null,
      asunto: asunto.trim(),
      cuerpo: cuerpo.trim(),
    });

  const creado = await db.obtener().prepare('SELECT * FROM mensajes WHERE id = ?').get(info.lastInsertRowid);
  return respuesta.creado(res, creado, 'Mensaje enviado');
}

/** El docente escribe solo a la dirección activa. */
async function destinoDocente(destinatarioSolicitado) {
  const direccion = await db
    .obtener()
    .prepare(
      `SELECT u.id FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE r.nombre = 'DIRECTOR' AND u.activo = 1
       ORDER BY u.id LIMIT 1`,
    )
    .get();

  if (!direccion) return { error: 'No hay una direccion activa registrada' };
  if (destinatarioSolicitado && Number(destinatarioSolicitado) !== direccion.id) {
    return { error: 'El docente solo puede enviar mensajes a la direccion' };
  }
  return { destinatario_id: direccion.id };
}

/** La dirección elige entre un docente o un contacto de la UGEL. */
async function destinoDirector(tipoDestino, docenteId, ugelId) {
  if (tipoDestino === 'ugel') {
    const existe = await db.obtener().prepare('SELECT COUNT(*) AS total FROM ugel_contactos WHERE id = ?').get(Number(ugelId));
    if (!Number(ugelId) || existe.total === 0) {
      return { error: 'Debe seleccionar un contacto de la UGEL' };
    }
    return { destinatario_ugel_id: Number(ugelId) };
  }

  const existe = await db.obtener().prepare('SELECT d.usuario_id FROM docentes d JOIN usuarios u ON u.id = d.usuario_id WHERE d.id = ? AND u.activo = 1').get(Number(docenteId));
  if (!Number(docenteId) || !existe) {
    return { error: 'Debe seleccionar un docente valido' };
  }
  return { destinatario_id: existe.usuario_id };
}

/** GET /api/ugel/contactos */
async function contactosUgel(req, res) {
  const filas = await db
    .obtener()
    .prepare('SELECT id, nombre, cargo, email, telefono, direccion FROM ugel_contactos ORDER BY nombre')
    .all();
  return respuesta.ok(res, filas, 'Contactos de la UGEL');
}

async function leer(req, res) {
  const info = await db.obtener().prepare('UPDATE mensajes SET leido = 1 WHERE id = ? AND destinatario_id = ?').run(Number(req.params.id), req.usuario.id);
  if (!info.changes) return respuesta.noEncontrado(res, 'Mensaje recibido no encontrado');
  return respuesta.ok(res, null, 'Mensaje marcado como leido');
}
module.exports = { listar, crear, contactosUgel, leer };