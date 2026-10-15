'use strict';

/** Gestión de docentes: listado y alta con credenciales automáticas. */

const bcrypt = require('bcryptjs');
const { randomInt } = require('node:crypto');

const db = require('../db');
const respuesta = require('../respuesta');

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const TILDES = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N' };

/** Quita tildes y deja solo caracteres válidos para el nombre de usuario. */
function normalizar(texto) {
  return texto
    .replace(/[áéíóúñüÁÉÍÓÚÑÜ]/g, (letra) => TILDES[letra] ?? letra)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

/** Usuario sugerido: inicial + primer apellido + 2 dígitos, único en la base. */
async function generarUsuario(nombres, apellidos) {
  const base = normalizar(`${nombres.charAt(0)}${apellidos.split(/\s+/)[0].slice(0, 8)}`) || 'docente';

  for (let intento = 0; intento < 20; intento += 1) {
    const candidato = `${base}${String(Math.floor(Math.random() * 90) + 10)}`;
    const existe = await db.obtener().prepare('SELECT COUNT(*) AS total FROM usuarios WHERE usuario = ?').get(candidato);
    if (existe.total === 0) return candidato;
  }
  return `${base}${Date.now().toString().slice(-3)}`;
}

/** Contraseña aleatoria de 10 caracteres. */
function generarClave() {
  let clave = '';
  for (let i = 0; i < 10; i += 1) {
    clave += ALFABETO[randomInt(ALFABETO.length)];
  }
  return clave;
}

/** GET /api/docentes */
async function listar(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT d.id, d.dni, d.especialidad, d.sueldo,
              u.id AS usuario_id, u.usuario, u.nombres, u.apellidos, u.email, u.telefono, u.foto, u.activo,
              (SELECT COUNT(*) FROM cursos c WHERE c.docente_id = d.id) AS cursos
       FROM docentes d
       INNER JOIN usuarios u ON u.id = d.usuario_id
       ORDER BY u.apellidos, u.nombres`,
    )
    .all();

  return respuesta.ok(res, filas, `Docentes registrados: ${filas.length}`);
}

/** POST /api/docentes - crea usuario y docente; la clave se muestra una sola vez. */
async function crear(req, res) {
  const {
    nombres, apellidos, dni, especialidad, email, telefono, sueldo,
  } = req.body || {};

  if (!nombres?.trim() || !apellidos?.trim()) {
    return respuesta.error(res, 'Los nombres y apellidos son obligatorios');
  }
  if (!/^\d{8}$/.test(String(dni ?? '').trim())) {
    return respuesta.error(res, 'El DNI debe tener 8 digitos');
  }
  if (!especialidad?.trim()) {
    return respuesta.error(res, 'La especialidad es obligatoria');
  }
  if (email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return respuesta.error(res, 'El correo electronico no tiene un formato valido');
  }
  if (!Number.isFinite(Number(sueldo ?? 0)) || Number(sueldo ?? 0) < 0) {
    return respuesta.error(res, 'El sueldo no puede ser negativo');
  }

  if ((await db.obtener().prepare('SELECT COUNT(*) AS total FROM docentes WHERE dni = ?').get(String(dni).trim())).total > 0) {
    return respuesta.error(res, 'Ya existe un docente registrado con ese DNI');
  }
  if (email?.trim() && (await db.obtener().prepare('SELECT COUNT(*) AS total FROM usuarios WHERE email = ?').get(email.trim())).total > 0) {
    return respuesta.error(res, 'Ya existe un usuario registrado con ese correo');
  }

  const rolDocente = await db
    .obtener()
    .prepare("SELECT id FROM roles WHERE nombre = 'DOCENTE'")
    .get();
  if (!rolDocente) return respuesta.error(res, 'El rol DOCENTE no esta configurado');

  const usuario = await generarUsuario(nombres.trim(), apellidos.trim());
  const clave = generarClave();

  try {
    const docenteId = await db.obtener().transaction(async (tx) => {
      const infoUsuario = await tx
        .prepare(
          `INSERT INTO usuarios (rol_id, usuario, password_hash, nombres, apellidos, email, telefono, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        )
        .run(
          rolDocente.id,
          usuario,
          bcrypt.hashSync(clave, 10),
          nombres.trim(),
          apellidos.trim(),
          email?.trim() || null,
          telefono?.trim() || null,
        );

      const infoDocente = await tx
        .prepare('INSERT INTO docentes (usuario_id, dni, especialidad, sueldo) VALUES (?, ?, ?, ?)')
        .run(infoUsuario.lastInsertRowid, String(dni).trim(), especialidad.trim(), Number(sueldo) || 0);
      return infoDocente.lastInsertRowid;
    });

    return respuesta.creado(
      res,
      {
        id: docenteId,
        usuario,
        contrasena: clave,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        dni: String(dni).trim(),
        especialidad: especialidad.trim(),
        aviso: 'Anote estas credenciales: la contrasena solo se muestra ahora',
      },
      'Docente registrado',
    );
  } catch (error) {
    if (error.code === '23505' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return respuesta.error(res, 'Ya existe un docente con ese DNI, usuario o correo');
    }
    throw error;
  }
}

module.exports = { listar, crear };