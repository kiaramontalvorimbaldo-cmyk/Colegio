/**
 * Cliente unico de la API.
 * Todas las pantallas consumen datos por aqui: fetch + JSON {ok, datos, mensaje}.
 */

const BASE_API = new URL('../../../api/', import.meta.url);

/**
 * @param {string} ruta       Ej: 'auth/login', 'docente/cursos'
 * @param {object} opciones   { metodo, cuerpo, params }
 * @returns {Promise<{ok:boolean, codigo:number, datos:any, mensaje:string}>}
 */
export async function api(ruta, opciones = {}) {
  const { metodo = 'GET', cuerpo = null, params = null } = opciones;

  const url = new URL(String(ruta).replace(/^\/+/, ''), BASE_API);
  if (params) {
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        url.searchParams.set(clave, valor);
      }
    }
  }

  const config = {
    method: metodo,
    headers: { 'Accept': 'application/json' },
    credentials: 'same-origin',
  };

  if (cuerpo !== null) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(cuerpo);
  }

  try {
    const respuesta = await fetch(url, config);
    let json = { ok: false, datos: null, mensaje: 'Respuesta no valida del servidor' };
    try {
      json = await respuesta.json();
    } catch {
      json.mensaje = 'El servidor no devolvio un JSON valido';
    }
    return { ok: Boolean(json.ok), codigo: respuesta.status, datos: json.datos, mensaje: json.mensaje };
  } catch (e) {
    return { ok: false, codigo: 0, datos: null, mensaje: 'Error de conexion con el servidor' };
  }
}