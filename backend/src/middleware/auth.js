'use strict';

/** Middleware de autenticación: valida el JWT y carga el usuario en la petición. */

const jwt = require('jsonwebtoken');
const respuesta = require('../respuesta');

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : null;

  if (!token) {
    return respuesta.noAutenticado(res, 'Falta el token de acceso');
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    const mensaje = error.name === 'TokenExpiredError'
      ? 'La sesion expiro, vuelva a iniciar sesion'
      : 'Token invalido';
    return respuesta.noAutenticado(res, mensaje);
  }
}

module.exports = { autenticar };