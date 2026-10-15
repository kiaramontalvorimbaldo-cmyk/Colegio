'use strict';

/** Rutas del docente (exclusivas del perfil DOCENTE). */

const express = require('express');

const controller = require('../controllers/docente.controller');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');
const { subirFoto } = require('../middleware/subida');

const router = express.Router();

const docente = [autenticar, exigirRol('DOCENTE')];

router.get('/docente/perfil', ...docente, controller.perfil);
router.put('/docente/perfil', ...docente, controller.actualizarPerfil);
router.put('/docente/perfil/foto', ...docente, subirFoto.single('foto'), controller.actualizarFoto);
router.get('/docente/cursos', ...docente, controller.cursos);
router.get('/docente/horario', ...docente, controller.horario);
router.get('/docente/estudiantes', ...docente, controller.estudiantes);

module.exports = router;