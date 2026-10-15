'use strict';

/** Middleware de rol: exige sesión activa y, si se indica, un perfil concreto. */

const respuesta = require('../respuesta');

/**
 * @param {...string} rolesPerfiles Nombres de rol admitidos (DOCENTE, DIRECTOR)
 */
function exigirRol(...rolesPerfiles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return respuesta.noAutenticado(res);
    }
    if (rolesPerfiles.length && !rolesPerfiles.includes(req.usuario.rol)) {
      return respuesta.sinPermiso(res, `Su rol (${req.usuario.rol}) no tiene acceso a esta ruta`);
    }
    return next();
  };
}

module.exports = { exigirRol };