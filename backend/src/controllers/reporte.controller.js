'use strict';

/** Reporte consolidado del docente para el módulo de reportes. */

const db = require('../db');
const respuesta = require('../respuesta');
const { idDocente } = require('./docente.controller');

/** GET /api/docente/reportes */
async function resumen(req, res) {
  const docenteId = await idDocente(req.usuario.id);
  if (!docenteId) return respuesta.sinPermiso(res, 'El usuario no esta registrado como docente');

  const porCurso = (await db
    .obtener()
    .prepare(
      `SELECT c.id, c.nombre, c.grado, c.seccion,
              COUNT(a.id) AS registros,
              COUNT(*) FILTER (WHERE a.estado = 'presente') AS presentes,
              COUNT(*) FILTER (WHERE a.estado = 'tardanza') AS tardanzas,
              COUNT(*) FILTER (WHERE a.estado = 'falta') AS faltas,
              COUNT(*) FILTER (WHERE a.estado = 'justificada') AS justificadas
       FROM cursos c
       LEFT JOIN asistencias a ON a.curso_id = c.id
       WHERE c.docente_id = ?
       GROUP BY c.id
       ORDER BY c.grado, c.seccion`,
    )
    .all(docenteId))
    .map((curso) => {
      const registros = curso.registros;
      // La tardanza cuenta como asistencia parcial (0.5)
      const efectivas = curso.presentes + curso.tardanzas * 0.5;
      return {
        ...curso,
        porcentaje: registros > 0 ? Number(((efectivas / registros) * 100).toFixed(1)) : 0,
      };
    });

  const registros = porCurso.reduce((total, curso) => total + curso.registros, 0);
  const efectivas = porCurso.reduce(
    (total, curso) => total + curso.presentes + curso.tardanzas * 0.5,
    0,
  );

  const porEstado = await db
    .obtener()
    .prepare('SELECT estado, COUNT(*) AS total FROM incidencias WHERE docente_id = ? GROUP BY estado')
    .all(docenteId);

  const incidencias = (await db
    .obtener()
    .prepare('SELECT COUNT(*) AS total FROM incidencias WHERE docente_id = ?')
    .get(docenteId)).total;

  const estados = ['pendiente', 'en_proceso', 'resuelta'].map((estado) => ({
    estado,
    total: porEstado.find((fila) => fila.estado === estado)?.total ?? 0,
  }));

  return respuesta.ok(
    res,
    {
      cursos_a_cargo: porCurso.length,
      asistencia_promedio: registros > 0 ? Number(((efectivas / registros) * 100).toFixed(1)) : 0,
      asistencias_registradas: registros,
      incidencias_registradas: incidencias,
      por_curso: porCurso,
      incidencias_por_estado: estados,
    },
    'Reporte del docente',
  );
}

module.exports = { resumen };