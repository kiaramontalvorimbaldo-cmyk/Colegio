'use strict';

/** Plantillas de documentos para la UGEL con marcadores {{...}}. */

const db = require('../db');
const respuesta = require('../respuesta');
const { ApiService } = require('../api.service');

/** Modelo de plantillas sobre el CRUD genérico parametrizado. */
const plantillaModelo = new ApiService({
  tabla: 'plantillas_ugel',
  campos: ['nombre', 'contenido_html'],
});

/** Elimina scripts y manejadores de evento del HTML de la plantilla. */
function sanear(html) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')?\s*javascript:[^"'>]*("|')?/gi, '');
}

/** Escapa el texto que se inyecta en el documento. */
const escapar = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** GET /api/plantillas */
async function listar(req, res) {
  const filas = await plantillaModelo.todos([], { orden: 'nombre ASC' });
  const resumen = filas.map(({ id, nombre, actualizado_en: actualizadoEn }) => ({
    id,
    nombre,
    actualizado_en: actualizadoEn,
  }));
  return respuesta.ok(res, resumen, `Plantillas UGEL: ${resumen.length}`);
}

/** GET /api/plantillas/:id/generar - documento con los datos ya colocados. */
async function generar(req, res) {
  const plantilla = await plantillaModelo.porId(Number(req.params.id));

  if (!plantilla) return respuesta.noEncontrado(res, 'Plantilla no encontrada');

  const director = await db
    .obtener()
    .prepare(
      `SELECT u.nombres, u.apellidos FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
    )
    .get(req.usuario.id);

  const periodo = await db.obtener().prepare('SELECT periodo FROM cursos ORDER BY id LIMIT 1').get();

  const datos = {
    institucion: 'I.E.P. Sagrado Corazón de Jesús',
    director: director ? `${director.nombres} ${director.apellidos}` : '',
    fecha: new Date().toLocaleDateString('es-PE'),
    periodo: periodo?.periodo ?? '',
  };

  let contenido = sanear(plantilla.contenido_html);
  for (const [marcador, valor] of Object.entries(datos)) {
    contenido = contenido.replaceAll(`{{${marcador}}}`, escapar(valor));
  }

  const pendientes = [...contenido.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);

  return respuesta.ok(
    res,
    {
      id: plantilla.id,
      nombre: plantilla.nombre,
      contenido_html: contenido,
      marcadores_pendientes: [...new Set(pendientes)],
      datos_institucionales: datos,
    },
    'Documento generado',
  );
}

module.exports = { listar, generar };