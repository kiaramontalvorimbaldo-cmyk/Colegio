import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import type { Columna } from '../../../shared/components/data-table/data-table';
import { CursoDocente } from '../../../core/models/docente.model';
import { EstudianteAsistencia, ListaAsistencia, EstadoAsistencia } from '../../../core/models/asistencia.model';

const ESTADOS: { valor: EstadoAsistencia; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Sin registrar' },
  { valor: 'presente', etiqueta: 'Presente' },
  { valor: 'tardanza', etiqueta: 'Tardanza' },
  { valor: 'falta', etiqueta: 'Falta' },
  { valor: 'justificada', etiqueta: 'Justificada' },
];

/** Toma de asistencia por curso y fecha con guardado masivo. */
@Component({
  selector: 'app-asistencia',
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Asistencia {
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly cursos = signal<CursoDocente[]>([]);
  readonly estudiantes = signal<EstudianteAsistencia[]>([]);
  readonly cursoId = signal<number | null>(null);
  readonly fecha = signal(new Date().toISOString().slice(0, 10));
  readonly guardando = signal(false);
  readonly cargando = signal(false);
  readonly estados = ESTADOS;

  readonly columnas: Columna<EstudianteAsistencia>[] = [
    {
      titulo: 'Estudiante',
      clave: 'apellidos',
      render: (e) => `${e.nombres} ${e.apellidos}`,
    },
    { titulo: 'DNI', clave: 'dni' },
    { titulo: 'Estado', clave: 'estado', render: (e) => ESTADOS.find((s) => s.valor === e.estado)?.etiqueta ?? e.estado },
    {
      titulo: 'Registro',
      clave: 'asistencia_id',
      render: (e) => (e.asistencia_id ? 'Registrada' : 'Nueva'),
    },
  ];

  readonly resumen = computed(() => {
    const conteo: Record<string, number> = {};
    this.estudiantes().forEach((e) => (conteo[e.estado] = (conteo[e.estado] ?? 0) + 1));
    return conteo;
  });

  async ngOnInit(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<CursoDocente[]>('docente/cursos'));
    this.cursos.set(respuesta.datos ?? []);
    if (this.cursos().length) {
      this.cursoId.set(this.cursos()[0].id);
      await this.cargar();
    }
  }

  async cambiarCurso(valor: number): Promise<void> {
    this.cursoId.set(valor);
    await this.cargar();
  }

  async cambiarFecha(valor: string): Promise<void> {
    this.fecha.set(valor);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    if (!this.cursoId()) return;

    this.cargando.set(true);
    const respuesta = await firstValueFrom(
      this.api.get<ListaAsistencia>('asistencias', { curso_id: this.cursoId(), fecha: this.fecha() }),
    );
    this.cargando.set(false);

    if (respuesta.ok && respuesta.datos) {
      this.estudiantes.set(respuesta.datos.estudiantes);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
      this.estudiantes.set([]);
    }
  }

  /** Guarda todas las filas de una vez (guardado masivo). */
  async guardar(): Promise<void> {
    if (!this.cursoId()) return;

    this.guardando.set(true);
    const registros = this.estudiantes()
      .filter((e) => e.estado !== 'pendiente')
      .map((e) => ({ estudiante_id: e.id, estado: e.estado }));

    const respuesta = await firstValueFrom(
      this.api.post<{ registros: number }>('asistencias', {
        curso_id: this.cursoId(),
        fecha: this.fecha(),
        registros,
      }),
    );
    this.guardando.set(false);

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) await this.cargar(); // recarga: las filas guardadas quedan "Registrada"
  }

  cambiarEstado(estudianteId: number, valor: EstadoAsistencia): void {
    this.estudiantes.update((lista) =>
      lista.map((e) => (e.id === estudianteId ? { ...e, estado: valor } : e)),
    );
  }

  marcarTodos(estado: EstadoAsistencia = 'presente'): void {
    this.estudiantes.update((lista) => lista.map((e) => ({ ...e, estado })));
  }
}