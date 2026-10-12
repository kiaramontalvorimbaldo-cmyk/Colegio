/**
 * Graficos con Chart.js (cargado como archivo local en assets/js/chart.umd.min.js).
 * Toda la configuracion vive aqui para reutilizarla en todos los paneles.
 */

const AZUL = '#2c4f86';
const VERDE = '#16a34a';
const ROJO = '#dc2626';
const AMBAR = '#d97706';

/** Barras: porcentaje de asistencia por curso. */
export function graficoBarras(idCanvas, etiquetas, datos, opciones = {}) {
  const lienzo = document.getElementById(idCanvas);
  if (!lienzo || typeof Chart === 'undefined') return null;

  return new Chart(lienzo.getContext('2d'), {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: opciones.etiqueta ?? 'Porcentaje',
        data: datos,
        backgroundColor: opciones.color ?? AZUL,
        borderRadius: 6,
        maxBarThickness: 60,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.parsed.y}${opciones.sufijo ?? '%'}` } },
      },
      scales: {
        y: opciones.conteos
          ? { beginAtZero: true, ticks: { precision: 0 } }
          : { beginAtZero: true, max: 100, ticks: { callback: (v) => v + (opciones.sufijo ?? '%') } },
      },
    },
  });
}

/** Anillo: incidencias por estado. */
export function graficoAnillo(idCanvas, etiquetas, datos, colores = [AMBAR, AZUL, VERDE]) {
  const lienzo = document.getElementById(idCanvas);
  if (!lienzo || typeof Chart === 'undefined') return null;

  return new Chart(lienzo.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: etiquetas,
      datasets: [{
        data: datos,
        backgroundColor: colores,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'right', labels: { font: { size: 12 } } } },
    },
  });
}

export { ROJO, AMBAR };