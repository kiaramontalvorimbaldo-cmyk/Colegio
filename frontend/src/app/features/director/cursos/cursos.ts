import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { confirmar } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CursoAdmin, DocenteAdmin, HorarioAdmin } from '../../../core/models/direccion.model';

const DIAS: { valor: number; etiqueta: string }[] = [
  { valor: 1, etiqueta: 'Lunes' }, { valor: 2, etiqueta: 'Martes' }, { valor: 3, etiqueta: 'Miércoles' },
  { valor: 4, etiqueta: 'Jueves' }, { valor: 5, etiqueta: 'Viernes' }, { valor: 6, etiqueta: 'Sábado' },
  { valor: 7, etiqueta: 'Domingo' },
];

/** CRUD de cursos y horarios (con validación de cruces en el servidor). */
@Component({
  selector: 'app-cursos',
  imports: [ReactiveFormsModule, DataTable, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pestanas" role="tablist">
      <button type="button" role="tab" [class.activa]="pestana() === 'cursos'" (click)="pestana.set('cursos')">
        <mat-icon>school</mat-icon> Cursos
      </button>
      <button type="button" role="tab" [class.activa]="pestana() === 'horarios'" (click)="pestana.set('horarios')">
        <mat-icon>schedule</mat-icon> Horarios
      </button>
    </div>

    @if (pestana() === 'cursos') {
      <div class="rejilla">
        <mat-card>
          <mat-card-header><mat-card-title>{{ idCurso() ? 'Editar curso' : 'Nuevo curso' }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="formularioCurso" (ngSubmit)="guardarCurso()" class="formulario">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del curso</mat-label>
                <input matInput formControlName="nombre" placeholder="Ej. Matemática" />
              </mat-form-field>
              <div class="fila">
                <mat-form-field appearance="outline">
                  <mat-label>Grado</mat-label>
                  <input matInput formControlName="grado" placeholder="Ej. 5to" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Sección</mat-label>
                  <input matInput formControlName="seccion" maxlength="2" placeholder="Ej. A" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Periodo</mat-label>
                  <input matInput formControlName="periodo" placeholder="2026-1" />
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Docente a cargo</mat-label>
                <mat-select formControlName="docente_id">
                  @for (docente of docentes(); track docente.id) {
                    <mat-option [value]="docente.id">{{ docente.apellidos }}, {{ docente.nombres }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="acciones">
                <button mat-flat-button type="submit" class="guardar">
                  {{ idCurso() ? 'Actualizar curso' : 'Registrar curso' }}
                </button>
                <button mat-button type="button" (click)="limpiarCurso()">Limpiar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Cursos programados</mat-card-title>
            <mat-card-subtitle>{{ cursos().length }} cursos en el periodo</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-data-table
              [columnas]="columnasCurso"
              [filas]="cursos()"
              [conAcciones]="true"
              textoAccion="Editar"
              (accion)="editarCurso($event)"
              vacio="No hay cursos registrados"
            />
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="rejilla">
        <mat-card>
          <mat-card-header><mat-card-title>{{ idHorario() ? 'Editar horario' : 'Nuevo horario' }}</mat-card-title>
            <mat-card-subtitle>Se rechazan los cruces de docente y de aula</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="formularioHorario" (ngSubmit)="guardarHorario()" class="formulario">
              <mat-form-field appearance="outline">
                <mat-label>Curso</mat-label>
                <mat-select formControlName="curso_id">
                  @for (curso of cursos(); track curso.id) {
                    <mat-option [value]="curso.id">
                      {{ curso.nombre }} - {{ curso.grado }}-{{ curso.seccion }} ({{ curso.docente_nombres }})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="fila">
                <mat-form-field appearance="outline">
                  <mat-label>Día</mat-label>
                  <mat-select formControlName="dia">
                    @for (dia of dias; track dia.valor) {
                      <mat-option [value]="dia.valor">{{ dia.etiqueta }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Hora de inicio</mat-label>
                  <input matInput type="time" formControlName="hora_inicio" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Hora de fin</mat-label>
                  <input matInput type="time" formControlName="hora_fin" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Aula</mat-label>
                <input matInput formControlName="aula" placeholder="Ej. A-201" />
              </mat-form-field>

              <div class="acciones">
                <button mat-flat-button type="submit" class="guardar">
                  {{ idHorario() ? 'Actualizar horario' : 'Registrar horario' }}
                </button>
                <button mat-button type="button" (click)="limpiarHorario()">Limpiar</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Horarios del periodo</mat-card-title>
            <mat-card-subtitle>{{ horarios().length }} clases programadas</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-data-table
              [columnas]="columnasHorario"
              [filas]="horarios()"
              [conAcciones]="true"
              textoAccion="Editar"
              (accion)="editarHorario($event)"
              vacio="No hay horarios registrados"
            />
            <div class="acciones-eliminar">
              <button mat-stroked-button type="button" class="peligro" (click)="eliminarUltimoHorario()">
                <mat-icon>delete</mat-icon> Eliminar último horario creado
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: `
    .pestanas { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .pestanas button {
      display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0;
      border-bottom: 2px solid transparent; cursor: pointer; padding: 9px 14px;
      font-size: 0.88rem; font-weight: 600; color: #6b7280;
    }
    .pestanas .activa { color: #16305c; border-bottom-color: #16305c; }
    .rejilla { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); align-items: start; }
    .formulario { display: flex; flex-direction: column; }
    .fila { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .acciones { display: flex; gap: 10px; align-items: center; }
    .acciones-eliminar { margin-top: 12px; }
    .guardar { background: #2c4f86; color: #fff; }
    .peligro { color: #dc2626; }
    @media (max-width: 1200px) { .rejilla { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Cursos {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly pestana = signal<'cursos' | 'horarios'>('cursos');
  readonly cursos = signal<CursoAdmin[]>([]);
  readonly horarios = signal<HorarioAdmin[]>([]);
  readonly docentes = signal<DocenteAdmin[]>([]);
  readonly idCurso = signal(0);
  readonly idHorario = signal(0);
  readonly dias = DIAS;

  readonly formularioCurso = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    grado: ['', Validators.required],
    seccion: ['', Validators.required],
    periodo: ['2026-1', Validators.required],
    docente_id: [0, [Validators.required, Validators.min(1)]],
  });

  readonly formularioHorario = this.fb.nonNullable.group({
    curso_id: [0, [Validators.required, Validators.min(1)]],
    dia: [1, Validators.required],
    hora_inicio: ['07:00', Validators.required],
    hora_fin: ['08:30', Validators.required],
    aula: ['', Validators.required],
  });

  readonly columnasCurso: Columna<CursoAdmin>[] = [
    { titulo: 'Curso', clave: 'nombre' },
    { titulo: 'Grado', clave: 'grado', render: (c) => `${c.grado} - ${c.seccion}` },
    { titulo: 'Periodo', clave: 'periodo' },
    { titulo: 'Docente', clave: 'docente_nombres', render: (c) => `${c.docente_nombres} ${c.docente_apellidos}` },
    { titulo: 'Horas', clave: 'horas_semana', render: (c) => `${c.horas_semana} h/sem` },
  ];

  readonly columnasHorario: Columna<HorarioAdmin>[] = [
    { titulo: 'Día', clave: 'dia', render: (h) => DIAS.find((d) => d.valor === h.dia)?.etiqueta ?? '' },
    { titulo: 'Horario', clave: 'hora_inicio', render: (h) => `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}` },
    { titulo: 'Curso', clave: 'curso', render: (h) => `${h.curso} (${h.grado}-${h.seccion})` },
    { titulo: 'Docente', clave: 'docente_nombres', render: (h) => `${h.docente_nombres} ${h.docente_apellidos}` },
    { titulo: 'Aula', clave: 'aula' },
  ];

  async ngOnInit(): Promise<void> {
    const docentes = await firstValueFrom(this.api.get<DocenteAdmin[]>('docentes'));
    this.docentes.set(docentes.datos ?? []);
    if (this.docentes().length) {
      this.formularioCurso.controls.docente_id.setValue(this.docentes()[0].id);
    }
    await this.cargarCursos();
    await this.cargarHorarios();
  }

  async cargarCursos(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<CursoAdmin[]>('cursos'));
    if (respuesta.ok) {
      this.cursos.set(respuesta.datos ?? []);
      if (this.cursos().length && !this.formularioHorario.controls.curso_id.value) {
        this.formularioHorario.controls.curso_id.setValue(this.cursos()[0].id);
      }
    }
  }

  async cargarHorarios(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<HorarioAdmin[]>('horarios'));
    if (respuesta.ok) this.horarios.set(respuesta.datos ?? []);
  }

  async guardarCurso(): Promise<void> {
    if (this.formularioCurso.invalid) {
      this.formularioCurso.markAllAsTouched();
      return;
    }

    const id = this.idCurso();
    const cuerpo = this.formularioCurso.getRawValue();
    const respuesta = await firstValueFrom(
      id ? this.api.put<CursoAdmin>(`cursos/${id}`, cuerpo) : this.api.post<CursoAdmin>('cursos', cuerpo),
    );

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    if (respuesta.ok) {
      this.limpiarCurso();
      await this.cargarCursos();
    }
  }

  editarCurso(curso: CursoAdmin): void {
    this.idCurso.set(curso.id);
    this.formularioCurso.setValue({
      nombre: curso.nombre,
      grado: curso.grado,
      seccion: curso.seccion,
      periodo: curso.periodo,
      docente_id: curso.docente_id,
    });
  }

  limpiarCurso(): void {
    this.idCurso.set(0);
    this.formularioCurso.reset({ periodo: '2026-1', docente_id: this.docentes()[0]?.id ?? 0 });
  }

  async guardarHorario(): Promise<void> {
    if (this.formularioHorario.invalid) {
      this.formularioHorario.markAllAsTouched();
      return;
    }

    const id = this.idHorario();
    const cuerpo = this.formularioHorario.getRawValue();
    const respuesta = await firstValueFrom(
      id ? this.api.put<HorarioAdmin>(`horarios/${id}`, cuerpo) : this.api.post<HorarioAdmin>('horarios', cuerpo),
    );

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    if (respuesta.ok) {
      this.limpiarHorario();
      await this.cargarHorarios();
    }
  }

  editarHorario(horario: HorarioAdmin): void {
    this.idHorario.set(horario.id);
    this.formularioHorario.setValue({
      curso_id: horario.curso_id,
      dia: horario.dia,
      hora_inicio: horario.hora_inicio.slice(0, 5),
      hora_fin: horario.hora_fin.slice(0, 5),
      aula: horario.aula,
    });
  }

  limpiarHorario(): void {
    this.idHorario.set(0);
    this.formularioHorario.reset({ curso_id: this.cursos()[0]?.id ?? 0, dia: 1, hora_inicio: '07:00', hora_fin: '08:30', aula: '' });
  }

  async eliminarUltimoHorario(): Promise<void> {
    const ultimo = this.horarios().at(-1);
    if (!ultimo) return;

    const aceptado = confirmar(
      this.dialog,
      'Eliminar horario',
      `Se eliminará la clase de ${ultimo.curso} (${ultimo.dia}, ${ultimo.hora_inicio.slice(0, 5)}).`,
    );
    if (!aceptado) return;

    const respuesta = await firstValueFrom(this.api.delete<null>(`horarios/${ultimo.id}`));
    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) await this.cargarHorarios();
  }
}