'use strict';

/** Rutas de incidencias del docente. */

const express = require('express');

const controller = require('../controllers/incidencia.controller');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');

const router = express.Router();

router.get('/incidencias', autenticar, exigirRol('DOCENTE', 'DIRECTOR'), controller.listar);
router.post('/incidencias', autenticar, exigirRol('DOCENTE'), controller.crear);

module.exports = router;