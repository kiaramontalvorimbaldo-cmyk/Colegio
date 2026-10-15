'use strict';

/** Panel económico: indicadores con las fórmulas del proyecto. */

const db = require('../db');
const respuesta = require('../respuesta');

/** Calcula los indicadores con los parámetros vigentes. */
async function calcular() {
  const parametros = await db.obtener().prepare('SELECT * FROM parametros_economicos WHERE id = 1').get();
  if (!parametros) return null;

  const recaudacion = await db
    .obtener()
    .prepare(
      `SELECT COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) AS efectiva,
              COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) AS pendiente
       FROM pagos`,
    )
    .get();

  const porMes = await db
    .obtener()
    .prepare(
      `SELECT mes,
              COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) AS efectiva,
              COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) AS pendiente
       FROM pagos GROUP BY mes ORDER BY mes`,
    )
    .all();

  const estudiantes = Number(parametros.num_estudiantes);
  const pension = Number(parametros.pension_mensual);
  const meses = Number(parametros.meses);
  const gastos = Number(parametros.gastos_operativos);
  const planilla = Number(
    (await db.obtener().prepare('SELECT COALESCE(SUM(sueldo), 0) AS total FROM docentes').get()).total,
  );

  const teorica = estudiantes * pension * meses;
  const efectiva = Number(recaudacion.efectiva);
  const morosidad = teorica > 0 ? Number((((teorica - efectiva) / teorica) * 100).toFixed(2)) : 0;
  const equilibrio = pension > 0 ? Number(((planilla + gastos) / pension).toFixed(1)) : 0;

  return {
    parametros: {
      pension_mensual: pension,
      num_estudiantes: estudiantes,
      gastos_operativos: gastos,
      meses,
    },
    teorica,
    efectiva,
    pendiente: recaudacion.pendiente,
    morosidad_pct: morosidad,
    planilla,
    gastos_operativos: gastos,
    balance_neto: Number((efectiva - (planilla + gastos) * meses).toFixed(2)),
    punto_equilibrio: equilibrio,
    supera_equilibrio: estudiantes >= equilibrio,
    por_mes: porMes,
  };
}

/** GET /api/economia/resumen */
async function resumen(req, res) {
  const datos = await calcular();
  if (!datos) return respuesta.error(res, 'No se han configurado los parametros economicos', 500);
  return respuesta.ok(res, datos, 'Resumen economico');
}

/** PUT /api/economia/parametros - guarda y devuelve el resumen recalculado. */
async function parametros(req, res) {
  const cuerpo = req.body || {};
  const permitidos = ['pension_mensual', 'num_estudiantes', 'gastos_operativos', 'meses'];
  const valores = Object.fromEntries(
    Object.entries(cuerpo).filter(([clave]) => permitidos.includes(clave)),
  );

  if (Object.keys(valores).length === 0) {
    return respuesta.error(res, 'No se envio ningun parametro editable');
  }

  if (valores.pension_mensual !== undefined && Number(valores.pension_mensual) <= 0) {
    return respuesta.error(res, 'La pension mensual debe ser mayor que cero');
  }
  if (valores.num_estudiantes !== undefined && Number(valores.num_estudiantes) < 0) {
    return respuesta.error(res, 'El numero de estudiantes no puede ser negativo');
  }
  if (valores.gastos_operativos !== undefined && Number(valores.gastos_operativos) < 0) {
    return respuesta.error(res, 'Los gastos operativos no pueden ser negativos');
  }
  if (valores.meses !== undefined) {
    const meses = Number(valores.meses);
    if (!Number.isInteger(meses) || meses < 1 || meses > 12) {
      return respuesta.error(res, 'El periodo debe estar entre 1 y 12 meses');
    }
    valores.meses = meses;
  }

  for (const [clave, valor] of Object.entries(valores)) {
    if (valor === null || valor === '' || !Number.isFinite(Number(valor))) return respuesta.error(res, 'Los parametros deben ser numeros validos');
    valores[clave] = Number(valor);
  }
  if (valores.num_estudiantes !== undefined && !Number.isInteger(valores.num_estudiantes)) return respuesta.error(res, 'El numero de estudiantes debe ser entero');

  const asignaciones = Object.keys(valores).map((clave) => `${clave} = @${clave}`).join(', ');
  await db.obtener().prepare(`UPDATE parametros_economicos SET ${asignaciones} WHERE id = 1`).run(valores);

  return respuesta.ok(res, await calcular(), 'Parametros actualizados');
}

module.exports = { resumen, parametros };