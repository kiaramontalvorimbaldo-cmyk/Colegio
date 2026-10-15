'use strict';

/** Rutas de mensajería. */

const express = require('express');

const controller = require('../controllers/mensaje.controller');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');

const router = express.Router();

const permisos = [autenticar, exigirRol('DOCENTE', 'DIRECTOR')];

router.get('/mensajes', ...permisos, controller.listar);
router.post('/mensajes', ...permisos, controller.crear);   // docente -> dirección | dirección -> docente o UGEL

router.put('/mensajes/:id/leido', ...permisos, controller.leer);
module.exports = router;