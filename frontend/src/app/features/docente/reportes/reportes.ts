import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { ReporteDocente, ResumenCurso } from '../../../core/models/asistencia.model';

/** Reportes del docente con gráficos construidos con datos reales de la API. */
@Component({
  selector: 'app-reportes',
  imports: [ChartComponent, DataTable, MatCardModule, MatIconModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reportes {
  private readonly api = inject(ApiService);

  readonly reporte = signal<ReporteDocente | null>(null);
  readonly cargando = signal(true);

  readonly etiquetasCurso = computed(() =>
    this.reporte()?.por_curso.map((curso) => `${curso.grado}-${curso.seccion}`) ?? [],
  );
  readonly porcentajeCurso = computed(() => this.reporte()?.por_curso.map((c) => c.porcentaje) ?? []);

  readonly etiquetasEstado = computed(() =>
    this.reporte()?.incidencias_por_estado.map((e) => e.estado.replace('_', ' ')) ?? [],
  );
  readonly totalesEstado = computed(() => this.reporte()?.incidencias_por_estado.map((e) => e.total) ?? []);

  readonly columnas: Columna<ResumenCurso>[] = [
    { titulo: 'Curso', clave: 'nombre' },
    { titulo: 'Grado', clave: 'grado', render: (c) => `${c.grado} - ${c.seccion}` },
    { titulo: 'Registros', clave: 'registros' },
    { titulo: 'Presentes', clave: 'presentes' },
    { titulo: 'Tardanzas', clave: 'tardanzas' },
    { titulo: 'Faltas', clave: 'faltas' },
    { titulo: 'Justificadas', clave: 'justificadas' },
    { titulo: '% asistencia', clave: 'porcentaje', render: (c) => `${c.porcentaje}%` },
  ];

  async ngOnInit(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<ReporteDocente>('docente/reportes'));
    this.cargando.set(false);

    if (respuesta.ok) {
      this.reporte.set(respuesta.datos);
    }
  }
}