import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { DocenteAdmin, EvaluacionDocente, PromedioDocente } from '../../../core/models/direccion.model';

/** Evaluación docente: puntaje 1 a 5, observación obligatoria y promedio por docente. */
@Component({
  selector: 'app-evaluacion',
  imports: [ReactiveFormsModule, DataTable, ChartComponent, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rejilla">
      <mat-card>
        <mat-card-header><mat-card-title>Registrar evaluación</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="registrar()" class="formulario">
            <mat-form-field appearance="outline">
              <mat-label>Docente</mat-label>
              <mat-select formControlName="docente_id">
                @for (docente of docentes(); track docente.id) {
                  <mat-option [value]="docente.id">{{ docente.apellidos }}, {{ docente.nombres }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Puntaje</mat-label>
              <mat-select formControlName="puntaje">
                <mat-option [value]="5">5 - Excelente</mat-option>
                <mat-option [value]="4">4 - Bueno</mat-option>
                <mat-option [value]="3">3 - Regular</mat-option>
                <mat-option [value]="2">2 - Deficiente</mat-option>
                <mat-option [value]="1">1 - Muy deficiente</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha</mat-label>
              <input matInput type="date" formControlName="fecha" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Observaciones (obligatorias)</mat-label>
              <textarea matInput rows="4" maxlength="255" formControlName="observaciones"
                        placeholder="Describa el desempeño observado en el aula"></textarea>
              @if (formulario.controls.observaciones.hasError('required')) {
                <mat-error>La observación es obligatoria</mat-error>
              } @else if (formulario.controls.observaciones.hasError('minlength')) {
                <mat-error>Mínimo 10 caracteres</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button type="submit" class="guardar">Registrar evaluación</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Promedio por docente</mat-card-title>
          <mat-card-subtitle>Consolidado de todas las evaluaciones</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-chart
            tipo="bar"
            [etiquetas]="etiquetasPromedio()"
            [datos]="promedios()"
            titulo="Promedio"
            [ejeYMaximo]="5"
            etiquetaAccesible="Promedio de evaluación por docente"
          />
        </mat-card-content>
      </mat-card>
    </div>

    <h2>Historial de evaluaciones</h2>
    <app-data-table [columnas]="columnas" [filas]="evaluaciones()" vacio="No hay evaluaciones registradas" />
  `,
  styles: `
    .rejilla { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); align-items: start; }
    .formulario { display: flex; flex-direction: column; }
    .guardar { background: #2c4f86; color: #fff; }
    h2 { font-size: 1rem; color: #16305c; margin: 20px 0 10px; }
    @media (max-width: 992px) { .rejilla { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Evaluacion {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly docentes = signal<DocenteAdmin[]>([]);
  readonly evaluaciones = signal<EvaluacionDocente[]>([]);
  readonly promedios = signal<number[]>([]);
  readonly etiquetasPromedio = signal<string[]>([]);

  readonly formulario = this.fb.nonNullable.group({
    docente_id: [0, [Validators.required, Validators.min(1)]],
    puntaje: [4, Validators.required],
    fecha: [new Date().toISOString().slice(0, 10), Validators.required],
    observaciones: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly columnas: Columna<EvaluacionDocente>[] = [
    { titulo: 'Docente', clave: 'apellidos', render: (e) => `${e.nombres} ${e.apellidos}` },
    { titulo: 'Puntaje', clave: 'puntaje', render: (e) => `${e.puntaje} / 5` },
    { titulo: 'Observaciones', clave: 'observaciones' },
    { titulo: 'Fecha', clave: 'fecha' },
  ];

  async ngOnInit(): Promise<void> {
    const docentes = await firstValueFrom(this.api.get<DocenteAdmin[]>('docentes'));
    this.docentes.set(docentes.datos ?? []);
    if (this.docentes().length) {
      this.formulario.controls.docente_id.setValue(this.docentes()[0].id);
    }
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(
      this.api.get<{ evaluaciones: EvaluacionDocente[]; promedios: PromedioDocente[] }>('evaluaciones'),
    );
    if (!respuesta.ok || !respuesta.datos) {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
      return;
    }

    this.evaluaciones.set(respuesta.datos.evaluaciones);
    this.etiquetasPromedio.set(respuesta.datos.promedios.map((p) => `${p.nombres.charAt(0)}. ${p.apellidos.split(' ')[0]}`));
    this.promedios.set(respuesta.datos.promedios.map((p) => Number(p.promedio ?? 0)));
  }

  async registrar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const respuesta = await firstValueFrom(this.api.post<EvaluacionDocente>('evaluaciones', this.formulario.getRawValue()));
    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });

    if (respuesta.ok) {
      this.formulario.controls.observaciones.reset('');
      await this.cargar();
    }
  }
}