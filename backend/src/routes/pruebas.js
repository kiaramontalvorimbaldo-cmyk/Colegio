'use strict';

/**
 * Rutas de diagnóstico del Sprint 2: demuestran el middleware de roles.
 * Un perfil que llama a la ruta del otro perfil recibe 403.
 */

const express = require('express');
const respuesta = require('../respuesta');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');

const router = express.Router();

router.get('/pruebas/permiso-docente', autenticar, exigirRol('DOCENTE'), (req, res) => {
  respuesta.ok(
    res,
    { ruta: 'pruebas/permiso-docente', rol: req.usuario.rol, usuario: req.usuario.usuario },
    'Acceso permitido: ruta exclusiva del docente',
  );
});

router.get('/pruebas/permiso-director', autenticar, exigirRol('DIRECTOR'), (req, res) => {
  respuesta.ok(
    res,
    { ruta: 'pruebas/permiso-director', rol: req.usuario.rol, usuario: req.usuario.usuario },
    'Acceso permitido: ruta exclusiva del director',
  );
});

module.exports = router;