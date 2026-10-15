'use strict';

/** Rutas de asistencia (solo docente) y reportes del docente. */

const express = require('express');

const asistencia = require('../controllers/asistencia.controller');
const reporte = require('../controllers/reporte.controller');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');

const router = express.Router();

const docente = [autenticar, exigirRol('DOCENTE')];

router.get('/asistencias', ...docente, asistencia.listar);
router.post('/asistencias', ...docente, asistencia.guardar);
router.get('/docente/reportes', ...docente, reporte.resumen);

module.exports = router;