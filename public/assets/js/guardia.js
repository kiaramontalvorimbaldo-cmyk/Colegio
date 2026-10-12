/** Guardia de sesion y de rol para el frontend. */

import { api } from './api.js';

export const RUTAS = {
  login: new URL('../../login.html', import.meta.url).href,
  docente: new URL('../../docente/index.html', import.meta.url).href,
  director: new URL('../../director/index.html', import.meta.url).href,
};

/** Panel que corresponde a un perfil. */
export function panelDe(rol) {
  return rol === 'DIRECTOR' ? RUTAS.director : RUTAS.docente;
}

/** Usuario de la sesion actual o null (401). */
export async function sesionActual() {
  const r = await api('auth/yo');
  return r.ok ? r.datos : null;
}

/**
 * Protege una pagina: sin sesion va al login y con perfil distinto
 * lo devuelve a su propio panel.
 */
export async function proteger(rolEsperado) {
  const usuario = await sesionActual();

  if (!usuario) {
    location.replace(RUTAS.login);
    return null;
  }
  if (rolEsperado && usuario.rol !== rolEsperado) {
    location.replace(panelDe(usuario.rol));
    return null;
  }
  return usuario;
}

/** Cierra la sesion y vuelve al login. */
export async function cerrarSesion() {
  await api('auth/logout', { metodo: 'POST' });
  location.replace(RUTAS.login);
}