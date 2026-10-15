import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { CredencialesDocente, DocenteAdmin } from '../../../core/models/direccion.model';

/** Alta y listado de docentes con credenciales automáticas (se muestran una vez). */
@Component({
  selector: 'app-docentes',
  imports: [ReactiveFormsModule, DataTable, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rejilla">
      <mat-card>
        <mat-card-header><mat-card-title>Nuevo docente</mat-card-title>
          <mat-card-subtitle>El usuario y la contraseña se generan automáticamente</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="registrar()" class="formulario">
            <div class="fila">
              <mat-form-field appearance="outline">
                <mat-label>Nombres</mat-label>
                <input matInput formControlName="nombres" autocomplete="off" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Apellidos</mat-label>
                <input matInput formControlName="apellidos" autocomplete="off" />
              </mat-form-field>
            </div>

            <div class="fila">
              <mat-form-field appearance="outline">
                <mat-label>DNI</mat-label>
                <input matInput formControlName="dni" maxlength="8" inputmode="numeric" />
                @if (formulario.controls.dni.hasError('pattern')) {
                  <mat-error>El DNI debe tener 8 dígitos</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Especialidad</mat-label>
                <input matInput formControlName="especialidad" />
              </mat-form-field>
            </div>

            <div class="fila">
              <mat-form-field appearance="outline">
                <mat-label>Correo electrónico</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="telefono" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Sueldo mensual (S/)</mat-label>
                <input matInput type="number" formControlName="sueldo" min="0" step="0.01" />
              </mat-form-field>
            </div>

            <button mat-flat-button type="submit" [disabled]="registrando()" class="guardar">
              Registrar docente
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Docentes registrados</mat-card-title>
          <mat-card-subtitle>{{ lista().length }} docentes</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-data-table [columnas]="columnas" [filas]="lista()" vacio="No hay docentes registrados" />
        </mat-card-content>
      </mat-card>
    </div>

    @if (credenciales(); as cred) {
      <div class="capa" (click)="credenciales.set(null)"></div>
      <mat-card class="dialogo">
        <mat-card-header><mat-card-title>Credenciales generadas</mat-card-title>
          <mat-card-subtitle>{{ cred.aviso }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Docente:</strong> {{ cred.nombres }} {{ cred.apellidos }}</p>
          <p><strong>Usuario:</strong> <code>{{ cred.usuario }}</code></p>
          <p><strong>Contraseña:</strong> <code>{{ cred.contrasena }}</code></p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-flat-button type="button" class="guardar" (click)="credenciales.set(null)">Entendido</button>
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: `
    .rejilla { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); align-items: start; }
    .fila { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .formulario { display: flex; flex-direction: column; }
    .guardar { background: #2c4f86; color: #fff; }
    .capa { position: fixed; inset: 0; background: rgba(15, 28, 51, 0.45); z-index: 10; }
    .dialogo { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 11; width: min(520px, 92vw); padding: 8px; }
    code { background: #eef3fb; padding: 2px 8px; border-radius: 6px; font-size: 0.9rem; }
    @media (max-width: 1200px) { .rejilla { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Docentes {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly lista = signal<DocenteAdmin[]>([]);
  readonly credenciales = signal<CredencialesDocente | null>(null);
  readonly registrando = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    especialidad: ['', Validators.required],
    email: ['', Validators.email],
    telefono: [''],
    sueldo: [1500, [Validators.required, Validators.min(0)]],
  });

  readonly columnas: Columna<DocenteAdmin>[] = [
    { titulo: 'Docente', clave: 'apellidos', render: (d) => `${d.nombres} ${d.apellidos}` },
    { titulo: 'Usuario', clave: 'usuario' },
    { titulo: 'DNI', clave: 'dni' },
    { titulo: 'Especialidad', clave: 'especialidad' },
    { titulo: 'Sueldo', clave: 'sueldo', render: (d) => `S/ ${Number(d.sueldo).toFixed(2)}` },
    { titulo: 'Cursos', clave: 'cursos' },
    { titulo: 'Estado', clave: 'activo', render: (d) => (d.activo === 1 ? 'Activo' : 'Inactivo') },
  ];

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<DocenteAdmin[]>('docentes'));
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
    const respuesta = await firstValueFrom(
      this.api.post<CredencialesDocente>('docentes', this.formulario.getRawValue()),
    );
    this.registrando.set(false);

    if (!respuesta.ok || !respuesta.datos) {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 4000 });
      return;
    }

    // Las credenciales se muestran una sola vez
    this.credenciales.set(respuesta.datos);
    this.formulario.reset({ especialidad: '', sueldo: 1500 });
    await this.cargar();
  }
}