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
import { DocenteAdmin } from '../../../core/models/direccion.model';
import { Bandeja, Carpeta, Mensaje } from '../../../core/models/mensaje.model';

interface ContactoUgel {
  id: number;
  nombre: string;
  email: string;
}

/** Mensajería de la dirección con docentes y con la UGEL. */
@Component({
  selector: 'app-mensajeria',
  imports: [ReactiveFormsModule, DataTable, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rejilla">
      <section>
        <div class="pestanas" role="tablist">
          <button type="button" role="tab" [class.activa]="carpeta() === 'recibidos'" (click)="cambiarCarpeta('recibidos')">
            Recibidos
            @if (noLeidos() > 0) { <span class="contador">{{ noLeidos() }}</span> }
          </button>
          <button type="button" role="tab" [class.activa]="carpeta() === 'enviados'" (click)="cambiarCarpeta('enviados')">Enviados</button>
        </div>

        <app-data-table [columnas]="columnas" [filas]="lista()" vacio="No hay mensajes en esta carpeta" [conAcciones]="true" textoAccion="Leer" (accion)="ver($event)" />
    @if (seleccionado(); as m) {
      <article aria-live="polite" style="padding:20px; background:white; margin-top:16px">
        <h3>{{ m.asunto }}</h3><p style="white-space:pre-wrap">{{ m.cuerpo }}</p>
        <button mat-button type="button" (click)="seleccionado.set(null)">Cerrar mensaje</button>
      </article>
    }

      </section>

      <mat-card>
        <mat-card-header><mat-card-title>Nuevo mensaje</mat-card-title>
          <mat-card-subtitle>Enviar a un docente o a la UGEL</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="enviar()" class="formulario">
            <mat-form-field appearance="outline">
              <mat-label>Destinatario</mat-label>
              <mat-select formControlName="tipo_destino">
                <mat-option value="usuario">Docente</mat-option>
                <mat-option value="ugel">UGEL</mat-option>
              </mat-select>
            </mat-form-field>

            @if (formulario.controls.tipo_destino.value === 'usuario') {
              <mat-form-field appearance="outline">
                <mat-label>Docente</mat-label>
                <mat-select formControlName="destinatario_id">
                  @for (docente of docentes(); track docente.id) {
                    <mat-option [value]="docente.id">{{ docente.apellidos }}, {{ docente.nombres }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <mat-form-field appearance="outline">
                <mat-label>Contacto de la UGEL</mat-label>
                <mat-select formControlName="destinatario_ugel_id">
                  @for (contacto of ugel(); track contacto.id) {
                    <mat-option [value]="contacto.id">{{ contacto.nombre }} - {{ contacto.email }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <mat-form-field appearance="outline">
              <mat-label>Asunto</mat-label>
              <input matInput formControlName="asunto" maxlength="120" />
              @if (formulario.controls.asunto.hasError('required')) {
                <mat-error>El asunto es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mensaje</mat-label>
              <textarea matInput rows="5" formControlName="cuerpo" maxlength="2000"></textarea>
              @if (formulario.controls.cuerpo.hasError('required')) {
                <mat-error>El mensaje es obligatorio</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button type="submit" [disabled]="enviando()" class="enviar">
              {{ enviando() ? 'Enviando...' : 'Enviar mensaje' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .rejilla { display: grid; gap: 18px; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); align-items: start; }
    .pestanas { display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .pestanas button {
      background: transparent; border: 0; border-bottom: 2px solid transparent; cursor: pointer;
      padding: 9px 14px; font-size: 0.88rem; font-weight: 600; color: #6b7280;
    }
    .pestanas .activa { color: #16305c; border-bottom-color: #16305c; }
    .contador { background: #d97706; color: #fff; border-radius: 20px; padding: 1px 7px; font-size: 0.7rem; }
    .formulario { display: flex; flex-direction: column; }
    .enviar { background: #2c4f86; color: #fff; }
    @media (max-width: 1100px) { .rejilla { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Mensajeria {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly carpeta = signal<Carpeta>('recibidos');
  readonly lista = signal<Mensaje[]>([]);
  readonly noLeidos = signal(0);
  readonly docentes = signal<DocenteAdmin[]>([]);
  readonly ugel = signal<ContactoUgel[]>([]);
  readonly enviando = signal(false);
  readonly seleccionado = signal<Mensaje | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    tipo_destino: ['usuario', Validators.required],
    destinatario_id: [0],
    destinatario_ugel_id: [0],
    asunto: ['', [Validators.required, Validators.maxLength(120)]],
    cuerpo: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly columnas: Columna<Mensaje>[] = [
    {
      titulo: 'De / Para',
      clave: 'remitente_nombres',
      render: (m) =>
        `${m.remitente_nombres} ${m.remitente_apellidos} → ${
          m.destinatario_ugel ?? `${m.destinatario_nombres ?? ''} ${m.destinatario_apellidos ?? ''}`.trim()
        }`,
    },
    { titulo: 'Asunto', clave: 'asunto' },
    { titulo: 'Mensaje', clave: 'cuerpo', render: (m) => (m.cuerpo.length > 70 ? `${m.cuerpo.slice(0, 70)}…` : m.cuerpo) },
    { titulo: 'Fecha', clave: 'fecha' },
    { titulo: 'Estado', clave: 'leido', render: (m) => (m.leido === 0 ? 'No leído' : 'Leído') },
  ];

  async ngOnInit(): Promise<void> {
    const [docentes, ugel] = await Promise.all([
      firstValueFrom(this.api.get<DocenteAdmin[]>('docentes')),
      firstValueFrom(this.api.get<ContactoUgel[]>('ugel/contactos')),
    ]);
    this.docentes.set(docentes.datos ?? []);
    this.ugel.set(ugel.datos ?? []);

    if (this.docentes().length) this.formulario.controls.destinatario_id.setValue(this.docentes()[0].id);
    if (this.ugel().length) this.formulario.controls.destinatario_ugel_id.setValue(this.ugel()[0].id);

    await this.cargar();
  }

  async cambiarCarpeta(carpeta: Carpeta): Promise<void> {
    this.carpeta.set(carpeta);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<Bandeja>('mensajes', { carpeta: this.carpeta() }));
    if (respuesta.ok && respuesta.datos) {
      this.lista.set(respuesta.datos.mensajes);
      this.noLeidos.set(respuesta.datos.no_leidos);
    }
  }

  async ver(mensaje: Mensaje): Promise<void> {
    this.seleccionado.set(mensaje);
    if (this.carpeta() === 'recibidos' && mensaje.leido === 0) {
      const r = await firstValueFrom(this.api.put(`mensajes/${mensaje.id}/leido`, {}));
      if (r.ok) await this.cargar();
    }
  }

  async enviar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const respuesta = await firstValueFrom(this.api.post<Mensaje>('mensajes', this.formulario.getRawValue()));
    this.enviando.set(false);

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) {
      this.formulario.controls.asunto.reset('');
      this.formulario.controls.cuerpo.reset('');
      await this.cambiarCarpeta('enviados');
    }
  }
}