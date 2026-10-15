'use strict';

/** Configuración de multer para la foto de perfil (backend/uploads). */

const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const CARPETA = path.join(__dirname, '..', '..', 'uploads');
const EXTENSIONES = { '.jpg': 1, '.jpeg': 1, '.png': 1, '.webp': 1 };
const TAMANO_MAXIMO = 300 * 1024; // 300 KB

fs.mkdirSync(CARPETA, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARPETA),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `foto-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
    cb(null, nombre);
  },
});

const subirFoto = multer({
  storage: almacenamiento,
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXTENSIONES[path.extname(file.originalname).toLowerCase()]) {
      return cb(Object.assign(new Error('La foto debe estar en formato JPG, PNG o WEBP'), { status: 400 }));
    }
    return cb(null, true);
  },
});

module.exports = { subirFoto, CARPETA, TAMANO_MAXIMO };