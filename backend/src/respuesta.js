'use strict';

/** Respuestas JSON uniformes de la API: { ok, datos, mensaje }. */

const ERRORES = {
  PENDIENTE: 'ok',
  EXITO: 'exito',
  CREADO: 'creado',
  ERROR_PETICION: 'peticion invalida',
  NO_AUTENTICADO: 'no autenticado',
  SIN_PERMISO: 'no tiene permisos para esta operacion',
  NO_ENCONTRADO: 'recurso no encontrado',
  INTERNO: 'error interno del servidor',
};

function responder(res, codigo, datos, mensaje) {
  return res.status(codigo).json({ ok: codigo < 400, datos, mensaje });
}

module.exports = {
  ERRORES,
  ok: (res, datos = null, mensaje = 'Operacion correcta') => responder(res, 200, datos, mensaje),
  creado: (res, datos = null, mensaje = 'Recurso creado') => responder(res, 201, datos, mensaje),
  error: (res, mensaje = ERRORES.ERROR_PETICION, codigo = 400, datos = null) =>
    responder(res, codigo, datos, mensaje),
  noEncontrado: (res, mensaje = ERRORES.NO_ENCONTRADO) => responder(res, 404, null, mensaje),
  noAutenticado: (res, mensaje = ERRORES.NO_AUTENTICADO) => responder(res, 401, null, mensaje),
  sinPermiso: (res, mensaje = ERRORES.SIN_PERMISO) => responder(res, 403, null, mensaje),
};