'use strict';

/**
 * Aplicación Express: CORS, JSON, estáticos de /uploads, rutas de la API
 * y manejador central de errores.
 */

const path = require('node:path');
const cors = require('cors');
const express = require('express');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const respuesta = require('./respuesta');
const rutas = require('./routes');

const app = express();
const puerto = Number(process.env.PORT || 3000);
const origen = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.use(cors({ origin: origen.split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', rutas);

// Ruta no encontrada dentro de la API
app.use('/api', (req, res) => {
  respuesta.noEncontrado(res, `Ruta no encontrada: /api${req.path}`);
});

// El mismo servidor entrega la aplicación compilada y sus rutas Angular.
const web = path.join(__dirname, '../../frontend/dist/frontend/browser');
if (require('node:fs').existsSync(path.join(web, 'index.html'))) {
  app.use(express.static(web, { setHeaders: (res, archivo) => {
    if (archivo.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store');
  } }));
  app.get('/{*ruta}', (req, res, next) => {
    if (req.path.startsWith('/uploads/')) return next();
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(web, 'index.html'));
  });
}

// Manejador central: nunca filtra detalles internos al cliente
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[API]', error.message);
  if (error.type === 'entity.parse.failed') return respuesta.error(res, 'El JSON enviado no es valido', 400);
  if (error.code === 'LIMIT_FILE_SIZE') return respuesta.error(res, 'La foto no debe superar 300 KB', 400);
  if (error.code?.startsWith('LIMIT_') || error.status === 400) return respuesta.error(res, error.message, 400);
  if (error.code === '23505' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') return respuesta.error(res, 'Ya existe un registro con esos datos', 409);
  respuesta.error(res, respuesta.ERRORES.INTERNO, 500);
});

if (require.main === module) {
  app.listen(puerto, () => {
    console.log(`API escuchando en http://localhost:${puerto}`);
  });
}

module.exports = app;
