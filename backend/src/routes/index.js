'use strict';

/** Punto de entrada de las rutas de la API. */

const express = require('express');

const router = express.Router();

router.use(require('./salud'));
router.use(require('./auth'));
router.use(require('./pruebas'));
router.use(require('./docente'));
router.use(require('./mensajes'));
router.use(require('./asistencia'));
router.use(require('./incidencia'));
router.use(require('./direccion'));

module.exports = router;