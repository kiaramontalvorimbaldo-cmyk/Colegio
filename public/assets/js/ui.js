/** Utilidades de presentacion: escape de salida y formatos. */

/** Escapa texto para insertarlo con innerHTML (evita inyeccion de HTML). */
export function escapar(texto) {
  if (texto === null || texto === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

export function iniciales(nombres = '', apellidos = '') {
  return ((nombres.charAt(0) || '') + (apellidos.charAt(0) || '')).toUpperCase();
}

export function nombreCompleto(usuario = {}) {
  return `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim();
}

export function formatoDinero(valor) {
  return 'S/ ' + Number(valor ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatoFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(String(fecha).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function mostrarAlerta(elemento, mensaje, tipo = 'error') {
  if (!elemento) return;
  elemento.classList.remove('visible');
  if (!mensaje) return;

  elemento.textContent = mensaje;
  elemento.className = `alerta visible ${tipo === 'ok' ? 'ok' : 'error'}`;
  if (tipo === 'ok') {
    window.setTimeout(() => elemento.classList.remove('visible'), 4000);
  }
}