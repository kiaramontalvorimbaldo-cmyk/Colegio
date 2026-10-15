'use strict';

/** Indicadores del panel de la dirección. */

const db = require('../db');
const respuesta = require('../respuesta');

/** GET /api/director/resumen */
async function resumen(req, res) {
  const bd = db.obtener();

  const conteo = { pendiente: 0, en_proceso: 0, resuelta: 0 };
  (await bd.prepare('SELECT estado, COUNT(*) AS total FROM incidencias GROUP BY estado')
    .all()).forEach((fila) => { conteo[fila.estado] = fila.total; });

  const asistencia = await bd
    .prepare(
      `SELECT COUNT(*) AS registros,
              COUNT(*) FILTER (WHERE estado = 'presente') AS presentes,
              COUNT(*) FILTER (WHERE estado = 'tardanza') AS tardanzas
       FROM asistencias`,
    )
    .get();

  const registros = asistencia.registros;
  const efectivas = asistencia.presentes + asistencia.tardanzas * 0.5;
  const docentes = await bd.prepare('SELECT COUNT(*) AS total FROM docentes').get();
  const cursos = await bd.prepare('SELECT COUNT(*) AS total FROM cursos').get();
  const estudiantes = await bd.prepare('SELECT COUNT(*) AS total FROM estudiantes').get();

  return respuesta.ok(
    res,
    {
      incidencias: {
        pendientes: conteo.pendiente,
        proceso: conteo.en_proceso,
        resueltas: conteo.resuelta,
        total: conteo.pendiente + conteo.en_proceso + conteo.resuelta,
      },
      docentes: docentes.total,
      cursos: cursos.total,
      estudiantes: estudiantes.total,
      asistencia_promedio: registros > 0 ? Number(((efectivas / registros) * 100).toFixed(1)) : 0,
    },
    'Resumen de la direccion',
  );
}

module.exports = { resumen };