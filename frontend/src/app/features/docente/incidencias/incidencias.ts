import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { Estudiante } from '../../../core/models/docente.model';
import { Incidencia, TipoIncidencia } from '../../../core/models/asistencia.model';

const TIPOS: { valor: TipoIncidencia; etiqueta: string }[] = [
  { valor: 'conducta', etiqueta: 'Conducta' },
  { valor: 'rendimiento', etiqueta: 'Rendimiento' },
  { valor: 'asistencia', etiqueta: 'Asistencia' },
  { valor: 'otro', etiqueta: 'Otro' },
];

/** Registro y listado de incidencias del docente (nacen en estado pendiente). */
@Component({
  selector: 'app-incidencias',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, DataTable],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Incidencias {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly estudiantes = signal<Estudiante[]>([]);
  readonly lista = signal<Incidencia[]>([]);
  readonly filtro = signal('');
  readonly registrando = signal(false);
  readonly tipos = TIPOS;

  readonly formulario = this.fb.nonNullable.group({
    estudiante_id: [0, [Validators.required, Validators.min(1)]],
    tipo: ['conducta' as TipoIncidencia, Validators.required],
    fecha: [new Date().toISOString().slice(0, 10), Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly columnas: Columna<Incidencia>[] = [
    { titulo: 'Estudiante', clave: 'apellidos', render: (i) => `${i.nombres} ${i.apellidos} (${i.grado}-${i.seccion})` },
    { titulo: 'Tipo', clave: 'tipo' },
    { titulo: 'Descripción', clave: 'descripcion' },
    { titulo: 'Fecha', clave: 'fecha' },
    { titulo: 'Estado', clave: 'estado' },
    {
      titulo: 'Respuesta del director',
      clave: 'respuesta_director',
      render: (i) => i.respuesta_director ?? 'Sin respuesta',
    },
  ];

  async ngOnInit(): Promise<void> {
    const estudiantes = await firstValueFrom(this.api.get<Estudiante[]>('docente/estudiantes'));
    this.estudiantes.set(estudiantes.datos ?? []);
    if (this.estudiantes().length) {
      this.formulario.controls.estudiante_id.setValue(this.estudiantes()[0].id);
    }
    await this.cargar();
  }

  async cambiarFiltro(valor: string): Promise<void> {
    this.filtro.set(valor);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(
      this.api.get<Incidencia[]>('incidencias', { estado: this.filtro() }),
    );
    if (respuesta.ok) {
      this.lista.set(respuesta.datos ?? []);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    }
  }

  async registrar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.registrando.set(true);
    const respuesta = await firstValueFrom(this.api.post<Incidencia>('incidencias', this.formulario.getRawValue()));
    this.registrando.set(false);

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) {
      this.formulario.controls.descripcion.reset('');
      await this.cargar();
    }
  }
}