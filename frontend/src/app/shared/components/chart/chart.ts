import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export type TipoGrafico = 'bar' | 'doughnut' | 'line' | 'pie';

/** Componente de gráfico genérico basado en Chart.js. */
@Component({
  selector: 'app-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="lienzo"><canvas #lienzo role="img" [attr.aria-label]="etiquetaAccesible()"></canvas></div>`,
  styles: `
    :host { display: block; }
    .lienzo { position: relative; height: 260px; }
  `,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  readonly tipo = input<TipoGrafico>('bar');
  readonly etiquetas = input.required<string[]>();
  readonly datos = input.required<number[]>();
  readonly colores = input<string[]>([]);
  readonly titulo = input('Gráfico');
  readonly etiquetaAccesible = input('Gráfico de datos');
  readonly ejeYMaximo = input<number | null>(null);
  readonly sufijo = input('');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico: Chart | null = null;

  constructor() {
    effect(() => {
      // Se redibuja cuando cambian los datos de entrada
      this.etiquetas();
      this.datos();
      if (this.grafico) this.actualizar();
    });
  }

  ngAfterViewInit(): void {
    this.grafico = new Chart(this.canvas().nativeElement, this.configuracion());
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }

  private actualizar(): void {
    const grafico = this.grafico;
    if (!grafico) return;

    grafico.data.labels = this.etiquetas();
    grafico.data.datasets[0].data = this.datos();
    grafico.update();
  }

  private configuracion(): ChartConfiguration {
    const paleta = this.colores();
    const conColores = paleta.length > 0;

    const config: ChartConfiguration = {
      type: this.tipo(),
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            label: this.titulo(),
            data: this.datos(),
            backgroundColor: conColores ? paleta : ['#2c4f86', '#16a34a', '#d97706', '#dc2626', '#0ea5e9', '#7c3aed'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: this.tipo() === 'doughnut' || this.tipo() === 'pie' } },
        scales:
          this.tipo() === 'bar' || this.tipo() === 'line'
            ? {
                y: {
                  beginAtZero: true,
                  max: this.ejeYMaximo() ?? undefined,
                  ticks: { callback: (valor) => `${valor}${this.sufijo()}` },
                },
              }
            : undefined,
      },
    };
    return config;
  }
}