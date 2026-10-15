'use strict';

/** Módulos del docente: perfil, cursos asignados y horario semanal. */

const db = require('../db');
const fs = require('node:fs');
const respuesta = require('../respuesta');

/** Id del docente asociado al usuario de la sesión. */
async function idDocente(usuarioId) {
  return (await db.obtener().prepare('SELECT id FROM docentes WHERE usuario_id = ?').get(usuarioId))?.id ?? 0;
}

/** GET /api/docente/perfil */
async function perfil(req, res) {
  const fila = await db
    .obtener()
    .prepare(
      `SELECT u.id, u.usuario, u.nombres, u.apellidos, u.email, u.telefono, u.foto, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
    )
    .get(req.usuario.id);

  if (!fila) return respuesta.noEncontrado(res, 'Usuario no encontrado');

  const docente = await db
    .obtener()
    .prepare('SELECT id, dni, especialidad FROM docentes WHERE usuario_id = ?')
    .get(req.usuario.id);

  return respuesta.ok(res, { ...fila, docente: docente ?? null }, 'Perfil del docente');
}

/** PUT /api/docente/perfil - actualiza los datos de contacto. */
async function actualizarPerfil(req, res) {
  const { nombres, apellidos, email, telefono } = req.body || {};

  if (!nombres?.trim() || !apellidos?.trim()) {
    return respuesta.error(res, 'Nombres y apellidos son obligatorios');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respuesta.error(res, 'El correo electronico no tiene un formato valido');
  }
  if (telefono && String(telefono).replace(/\D/g, '').length > 20) {
    return respuesta.error(res, 'El telefono admite 20 caracteres como maximo');
  }

  await db.obtener()
    .prepare(
      `UPDATE usuarios
       SET nombres = @nombres, apellidos = @apellidos,
           email = @email, telefono = @telefono
       WHERE id = @id`,
    )
    .run({
      id: req.usuario.id,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
    });

  return perfil({ usuario: req.usuario }, res);
}

/** PUT /api/docente/perfil/foto - guarda la foto en uploads y devuelve su ruta. */
async function actualizarFoto(req, res) {
  if (!req.file) {
    return respuesta.error(res, 'No se recibio ningun archivo');
  }

  const bytes = fs.readFileSync(req.file.path);
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  const ext = require('node:path').extname(req.file.originalname).toLowerCase();
  if (!((jpg && ['.jpg', '.jpeg'].includes(ext)) || (png && ext === '.png') || (webp && ext === '.webp'))) {
    fs.unlinkSync(req.file.path);
    return respuesta.error(res, 'El archivo no corresponde a una imagen JPG, PNG o WEBP');
  }
  const ruta = `/uploads/${req.file.filename}`;
  await db.obtener().prepare('UPDATE usuarios SET foto = ? WHERE id = ?').run(ruta, req.usuario.id);

  return respuesta.ok(res, { foto: ruta }, 'Foto actualizada');
}

/** GET /api/docente/cursos - solo los cursos asignados al docente de la sesión. */
async function cursos(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT c.id, c.nombre, c.grado, c.seccion, c.periodo,
              (SELECT COUNT(*) FROM horarios h WHERE h.curso_id = c.id) AS horas_semana,
              (SELECT COUNT(*) FROM estudiantes e WHERE e.grado = c.grado AND e.seccion = c.seccion) AS estudiantes
       FROM cursos c
       WHERE c.docente_id = ?
       ORDER BY c.grado, c.seccion`,
    )
    .all(await idDocente(req.usuario.id));

  return respuesta.ok(res, filas, `Cursos asignados: ${filas.length}`);
}

/** GET /api/docente/horario - horarios agrupados por día (1 a 7). */
async function horario(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT h.id, h.curso_id, h.dia, h.hora_inicio, h.hora_fin, h.aula,
              c.nombre AS curso, c.grado, c.seccion
       FROM horarios h
       INNER JOIN cursos c ON c.id = h.curso_id
       WHERE c.docente_id = ?
       ORDER BY h.dia, h.hora_inicio`,
    )
    .all(await idDocente(req.usuario.id));

  const agrupado = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  filas.forEach((fila) => agrupado[fila.dia].push(fila));

  const total = filas.length;
  return respuesta.ok(res, agrupado, `Horario semanal: ${total} clases`);
}

/** GET /api/docente/estudiantes - alumnos de los cursos del docente. */
async function estudiantes(req, res) {
  const filas = await db
    .obtener()
    .prepare(
      `SELECT DISTINCT e.id, e.dni, e.nombres, e.apellidos, e.grado, e.seccion
       FROM estudiantes e
       INNER JOIN cursos c ON c.grado = e.grado AND c.seccion = e.seccion
       WHERE c.docente_id = ?
       ORDER BY e.grado, e.seccion, e.apellidos, e.nombres`,
    )
    .all(await idDocente(req.usuario.id));

  return respuesta.ok(res, filas, `Estudiantes a cargo: ${filas.length}`);
}

module.exports = { perfil, actualizarPerfil, actualizarFoto, cursos, horario, estudiantes, idDocente };