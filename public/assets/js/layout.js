/** Layout base del panel: barra lateral azul, cabecera y area de contenido. */

import { escapar, iniciales, nombreCompleto } from './ui.js';
import { proteger, cerrarSesion } from './guardia.js';

export const ICONOS = {
  escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  panel: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  cursos: '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M8 3v18"/>',
  horario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  mensajes: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  asistencia: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/>',
  incidencias: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5v.5"/>',
  reporte: '<path d="M4 20V10M10 20V4M16 20v-7M20 20H2"/>',
  evaluacion: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  docentes: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3.1-5 7-5s7 1.5 7 5"/><path d="M16 5.5a3.5 3.5 0 010 6.5"/>',
  economia: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  ugel: '<path d="M4 4h11l5 5v11H4z"/><path d="M14 4v5h6"/>',
  plantillas: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  salir: '<path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2"/><path d="M18 12H9M15 9l3 3-3 3"/>',
};

export const svg = (nombre) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre] ?? ICONOS.panel}</svg>`;

const MENUS = {
  DOCENTE: [
    { grupo: 'Principal' },
    { titulo: 'Panel', icono: 'panel', enlace: 'index.html' },
    { titulo: 'Mi perfil', icono: 'perfil', enlace: 'perfil.html' },
    { titulo: 'Mis cursos', icono: 'cursos', enlace: 'cursos.html' },
    { titulo: 'Mi horario', icono: 'horario', enlace: 'horario.html' },
    { titulo: 'Mensajes', icono: 'mensajes', enlace: 'mensajes.html' },
    { grupo: 'Aula' },
    { titulo: 'Asistencia', icono: 'asistencia', enlace: 'asistencia.html' },
    { titulo: 'Incidencias', icono: 'incidencias', enlace: 'incidencias.html' },
    { titulo: 'Mis reportes', icono: 'reporte', enlace: 'reportes.html' },
  ],
  DIRECTOR: [
    { grupo: 'Principal' },
    { titulo: 'Panel', icono: 'panel', enlace: 'index.html' },
    { grupo: 'Gestion academica' },
    { titulo: 'Incidencias', icono: 'incidencias', sprint: 'Sprint 5' },
    { titulo: 'Evaluacion docente', icono: 'evaluacion', sprint: 'Sprint 5' },
    { titulo: 'Docentes', icono: 'docentes', sprint: 'Sprint 5' },
    { titulo: 'Cursos', icono: 'cursos', sprint: 'Sprint 5' },
    { titulo: 'Horarios', icono: 'horario', sprint: 'Sprint 5' },
    { grupo: 'Administracion' },
    { titulo: 'Mensajes y UGEL', icono: 'ugel', sprint: 'Sprint 6' },
    { titulo: 'Plantillas UGEL', icono: 'plantillas', sprint: 'Sprint 6' },
    { titulo: 'Panel economico', icono: 'economia', sprint: 'Sprint 6' },
  ],
};

function menuHtml(rol) {
  const actual = location.pathname.split('/').pop() || 'index.html';

  return (MENUS[rol] ?? [])
    .map((item) => {
      if (item.grupo) return `<li class="menu-titulo">${escapar(item.grupo)}</li>`;
      const activo = item.enlace === actual ? ' class="activo"' : '';
      const etiqueta = item.sprint ? `<span class="sprint">${item.sprint}</span>` : '';
      const destino = item.enlace ?? '#';
      return `<li><a href="${destino}"${activo}>${svg(item.icono)}<span>${escapar(item.titulo)}</span>${etiqueta}</a></li>`;
    })
    .join('');
}

function panelHtml(usuario, rol) {
  const etiqueta = rol === 'DIRECTOR' ? 'Direccion' : 'Docencia';
  return `
  <aside class="lateral">
    <div class="lateral-marca">
      ${svg('escudo')}
      <div><strong>Sagrado Corazon</strong><span>${etiqueta}</span></div>
    </div>
    <ul class="menu">${menuHtml(rol)}</ul>
    <div class="lateral-pie">Periodo 2026-1 · Chiclayo</div>
  </aside>

  <div class="principal">
    <header class="cabecera">
      <h2>${escapar(etiqueta)}</h2>
      <div class="buscador">${svg('buscador')}<input type="search" placeholder="Buscar..." aria-label="Buscar"></div>
      <div class="perfil">
        <div class="avatar">${escapar(iniciales(usuario.nombres, usuario.apellidos))}</div>
        <div class="perfil-datos">
          <strong>${escapar(nombreCompleto(usuario))}</strong>
          <span>${escapar(usuario.rol)}</span>
        </div>
        <button class="boton secundario" id="btn-salir" title="Cerrar sesion">${svg('salir')} Salir</button>
      </div>
    </header>
    <main class="contenido" id="contenido"></main>
  </div>`;
}

/**
 * Monta el panel del perfil indicado.
 * @param {string} rol       'DOCENTE' o 'DIRECTOR'
 * @param {Function} contenido  callback (contenedor, usuario) para pintar la pantalla
 */
export async function iniciarPanel(rol, contenido) {
  const usuario = await proteger(rol);
  if (!usuario) return;

  document.title = `${rol === 'DIRECTOR' ? 'Direccion' : 'Docencia'} - Sagrado Corazon de Jesus`;
  document.getElementById('app').innerHTML = panelHtml(usuario, rol);
  document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

  contenido(document.getElementById('contenido'), usuario);
}

/** Pantalla provisional hasta que el modulo exista (marcada con su sprint). */
export function bloqueProvisional(titulo, mensaje, sprint) {
  return `
    <div class="tarjeta">
      <h3>${escapar(titulo)}</h3>
      <p>${escapar(mensaje)}</p>
      <p style="margin-top:10px"><span class="badge azul">${escapar(sprint)}</span></p>
    </div>`;
}