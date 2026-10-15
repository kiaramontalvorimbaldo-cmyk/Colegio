'use strict';

/** Rutas de autenticación. */

const express = require('express');
const controller = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.post('/auth/login', controller.login);
router.get('/auth/yo', autenticar, controller.yo);

module.exports = router;