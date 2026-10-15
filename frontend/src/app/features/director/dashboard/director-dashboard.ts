import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { ResumenDireccion } from '../../../core/models/direccion.model';

/** Panel de la dirección con indicadores y gráficos de la institución. */
@Component({
  selector: 'app-director-dashboard',
  imports: [MatCardModule, MatIconModule, ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (resumen(); as d) {
      <div class="indicadores">
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">report</mat-icon>
          <div><strong>{{ d.incidencias.pendientes }}</strong><span>Incidencias pendientes</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">groups</mat-icon>
          <div><strong>{{ d.docentes }}</strong><span>Docentes</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">school</mat-icon>
          <div><strong>{{ d.cursos }}</strong><span>Cursos programados</span></div>
        </mat-card>
        <mat-card class="indicador">
          <mat-icon aria-hidden="true">how_to_reg</mat-icon>
          <div><strong>{{ d.asistencia_promedio }}%</strong><span>Asistencia promedio</span></div>
        </mat-card>
      </div>

      <div class="graficos">
        <mat-card>
          <mat-card-header><mat-card-title>Incidencias por estado</mat-card-title>
            <mat-card-subtitle>{{ d.incidencias.total }} incidencias en el periodo</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-chart
              tipo="doughnut"
              [etiquetas]="etiquetasIncidencias()"
              [datos]="totalesIncidencias()"
              [colores]="['#d97706', '#2c4f86', '#16a34a']"
              titulo="Incidencias"
              etiquetaAccesible="Incidencias por estado"
            />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Distribución del claustro</mat-card-title>
            <mat-card-subtitle>Docentes, cursos y estudiantes matriculados</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-chart
              tipo="bar"
              [etiquetas]="['Docentes', 'Cursos', 'Estudiantes']"
              [datos]="[d.docentes, d.cursos, d.estudiantes]"
              titulo="Cantidad"
              etiquetaAccesible="Docentes, cursos y estudiantes"
            />
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <p>Cargando indicadores...</p>
    }
  `,
  styles: `
    .indicadores { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .indicador { display: flex; align-items: center; gap: 14px; padding: 14px; }
    .indicador mat-icon {
      width: 46px; height: 46px; font-size: 46px; line-height: 46px; text-align: center;
      display: grid; place-items: center; border-radius: 10px; color: #2c4f86;
      background: #eef3fb; flex: 0 0 46px;
    }
    .indicador strong { display: block; font-size: 1.4rem; color: #16305c; }
    .indicador span { font-size: 0.78rem; color: #6b7280; }
    .graficos { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-top: 16px; }
  `,
})
export class DirectorDashboard {
  private readonly api = inject(ApiService);

  readonly resumen = signal<ResumenDireccion | null>(null);

  readonly etiquetasIncidencias = computed(() => ['Pendiente', 'En proceso', 'Resuelta']);
  readonly totalesIncidencias = computed(() => {
    const d = this.resumen();
    return d ? [d.incidencias.pendientes, d.incidencias.proceso, d.incidencias.resueltas] : [];
  });

  async ngOnInit(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<ResumenDireccion>('director/resumen'));
    if (respuesta.ok) this.resumen.set(respuesta.datos);
  }
}