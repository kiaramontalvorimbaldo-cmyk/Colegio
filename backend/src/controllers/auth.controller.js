'use strict';

/** Autenticación: POST /api/auth/login y GET /api/auth/yo. */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db');
const respuesta = require('../respuesta');
const { autenticar } = require('../middleware/auth');

/** Datos del usuario sin información sensible. */
function datosPublicos(fila) {
  return {
    id: fila.id,
    usuario: fila.usuario,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    email: fila.email,
    telefono: fila.telefono,
    foto: fila.foto,
    rol: fila.rol,
  };
}

/** POST /api/auth/login */
async function login(req, res) {
  const { usuario, clave } = req.body || {};

  if (!usuario || !clave) {
    return respuesta.error(res, 'Usuario y contrasena son obligatorios');
  }

  const fila = await db
    .obtener()
    .prepare(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.usuario = ?`,
    )
    .get(String(usuario).trim());

  if (!fila || !bcrypt.compareSync(String(clave), fila.password_hash)) {
    return respuesta.error(res, 'Usuario o contrasena incorrectos');
  }
  if (fila.activo !== 1) {
    return respuesta.error(res, 'El usuario esta inactivo', 403);
  }

  const token = jwt.sign(
    { id: fila.id, rol: fila.rol, usuario: fila.usuario },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  );

  return respuesta.ok(res, { token, usuario: datosPublicos(fila) }, 'Sesion iniciada');
}

/** GET /api/auth/yo - devuelve el usuario de la sesión vigente. */
async function yo(req, res) {
  const fila = await db
    .obtener()
    .prepare(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
    )
    .get(req.usuario.id);

  if (!fila) {
    return respuesta.noEncontrado(res, 'Usuario no encontrado');
  }
  return respuesta.ok(res, datosPublicos(fila), 'Sesion activa');
}

module.exports = { login, yo, autenticar };