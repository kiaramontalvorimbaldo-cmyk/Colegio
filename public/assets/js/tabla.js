/** Tabla reutilizable para las pantallas del sistema. */

import { escapar } from './ui.js';

/**
 * @param {HTMLElement} contenedor
 * @param {Array<{clave?:string, titulo:string, clase?:string, render?:Function}>} columnas
 * @param {Array<object>} filas
 * @param {string} mensajeVacio
 */
export function pintarTabla(contenedor, columnas, filas, mensajeVacio = 'No hay registros para mostrar') {
  if (!contenedor) return;

  if (!filas || filas.length === 0) {
    contenedor.innerHTML = `<div class="tarjeta"><p class="vacio">${escapar(mensajeVacio)}</p></div>`;
    return;
  }

  const encabezado = columnas
    .map((c) => `<th class="${c.clase ?? ''}">${escapar(c.titulo)}</th>`)
    .join('');

  const cuerpo = filas
    .map((fila) => {
      const celdas = columnas
        .map((c) => `<td class="${c.clase ?? ''}">${c.render ? c.render(fila) : escapar(fila[c.clave] ?? '')}</td>`)
        .join('');
      return `<tr>${celdas}</tr>`;
    })
    .join('');

  contenedor.innerHTML = `
    <div class="tarjeta" style="padding:0;overflow-x:auto">
      <table>
        <thead><tr>${encabezado}</tr></thead>
        <tbody>${cuerpo}</tbody>
      </table>
    </div>`;
}

/** Badge de estado con color por valor. */
export function badge(texto, color = 'azul') {
  return `<span class="badge ${color}">${escapar(texto)}</span>`;
}