'use strict';

/** Rutas de estado del servicio y de la base de datos. */

const express = require('express');
const db = require('../db');
const respuesta = require('../respuesta');

const router = express.Router();

/** GET /api/salud - comprueba la API y la conexión a la base de datos. */
router.get('/salud', async (req, res) => {
  try {
    const { rows: [fila] } = await db.pool.query(
      `SELECT current_setting('server_version') AS version,
              (SELECT COUNT(*) FROM information_schema.tables
               WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tablas`,
    );

    respuesta.ok(
      res,
      {
        servicio: 'API Administracion Academica - I.E.P. Sagrado Corazon de Jesus',
        version: '1.0.0',
        sprint: 1,
        node: process.version,
        base_datos: 'Supabase PostgreSQL',
        postgres: fila.version,
        tablas: Number(fila.tablas),
      },
      'Servicio operativo',
    );
  } catch (error) {
    console.error('[API] No se pudo comprobar la conexión a Supabase:', error);
    respuesta.error(res, 'La base de datos no esta disponible', 500);
  }
});

module.exports = router;