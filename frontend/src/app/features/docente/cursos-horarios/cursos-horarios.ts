import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { CursoDocente, HorarioSemana } from '../../../core/models/docente.model';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Cursos asignados y horario semanal del docente. */
@Component({
  selector: 'app-cursos-horarios',
  imports: [DataTable, MatCardModule, MatIconModule],
  templateUrl: './cursos-horarios.html',
  styleUrl: './cursos-horarios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursosHorarios {
  private readonly api = inject(ApiService);

  readonly cursos = signal<CursoDocente[]>([]);
  readonly horario = signal<HorarioSemana>({});
  readonly totalHoras = signal(0);
  readonly totalEstudiantes = signal(0);
  readonly dias = DIAS;

  readonly columnas: Columna<CursoDocente>[] = [
    { titulo: 'Curso', clave: 'nombre' },
    { titulo: 'Grado', clave: 'grado', render: (c) => `${c.grado} - ${c.seccion}` },
    { titulo: 'Periodo', clave: 'periodo' },
    { titulo: 'Horas/semana', clave: 'horas_semana' },
    { titulo: 'Estudiantes', clave: 'estudiantes' },
  ];

  async ngOnInit(): Promise<void> {
    const [cursos, horario] = await Promise.all([
      firstValueFrom(this.api.get<CursoDocente[]>('docente/cursos')),
      firstValueFrom(this.api.get<HorarioSemana>('docente/horario')),
    ]);

    this.cursos.set(cursos.datos ?? []);
    this.horario.set(horario.datos ?? {});
    this.totalHoras.set(this.cursos().reduce((total, c) => total + c.horas_semana, 0));
    this.totalEstudiantes.set(this.cursos().reduce((total, c) => total + c.estudiantes, 0));
  }

  clasesDelDia(indice: number) {
    return this.horario()[String(indice + 1)] ?? [];
  }
}