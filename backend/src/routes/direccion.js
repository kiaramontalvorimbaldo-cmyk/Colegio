'use strict';

/** MÃ³dulos de la direcciÃ³n: panel, docentes, evaluaciones, cursos y horarios. */

const express = require('express');

const director = require('../controllers/director.controller');
const docenteAdmin = require('../controllers/docente-admin.controller');
const evaluacion = require('../controllers/evaluacion.controller');
const curso = require('../controllers/curso.controller');
const horario = require('../controllers/horario.controller');
const incidencia = require('../controllers/incidencia.controller');
const mensaje = require('../controllers/mensaje.controller');
const plantilla = require('../controllers/plantilla.controller');
const economia = require('../controllers/economia.controller');
const { autenticar } = require('../middleware/auth');
const { exigirRol } = require('../middleware/rol');

const router = express.Router();

const permisos = [autenticar, exigirRol('DIRECTOR')];

router.get('/director/resumen', ...permisos, director.resumen);

router.get('/docentes', ...permisos, docenteAdmin.listar);
router.post('/docentes', ...permisos, docenteAdmin.crear);

router.get('/evaluaciones', ...permisos, evaluacion.listar);
router.post('/evaluaciones', ...permisos, evaluacion.crear);

router.get('/cursos', ...permisos, curso.listar);
router.post('/cursos', ...permisos, curso.guardar);
router.put('/cursos/:id', ...permisos, curso.guardar);
router.delete('/cursos/:id', ...permisos, curso.eliminar);

router.get('/horarios', ...permisos, horario.listar);
router.post('/horarios', ...permisos, horario.guardar);
router.put('/horarios/:id', ...permisos, horario.guardar);
router.delete('/horarios/:id', ...permisos, horario.eliminar);

// La direcciÃ³n tambiÃ©n consulta y responde incidencias
router.put('/incidencias/:id', ...permisos, incidencia.actualizar);

// MensajerÃ­a con docentes y con la UGEL
router.get('/ugel/contactos', ...permisos, mensaje.contactosUgel);

// Plantillas UGEL y gestiÃ³n econÃ³mica
router.get('/plantillas', ...permisos, plantilla.listar);
router.get('/plantillas/:id/generar', ...permisos, plantilla.generar);
router.get('/economia/resumen', ...permisos, economia.resumen);
router.put('/economia/parametros', ...permisos, economia.parametros);

module.exports = router;