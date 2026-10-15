import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { IncidenciaDirector } from '../../../core/models/direccion.model';

type Estado = 'pendiente' | 'en_proceso' | 'resuelta';

/** Gestión de incidencias: filtro por estado, cambio de estado y respuesta. */
@Component({
  selector: 'app-incidencias-director',
  imports: [FormsModule, DataTable, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fila">
      <mat-form-field appearance="outline" class="filtro">
        <mat-label>Filtrar por estado</mat-label>
        <mat-select [value]="filtro()" (selectionChange)="cambiarFiltro($event.value)">
          <mat-option value="">Todos</mat-option>
          <mat-option value="pendiente">Pendiente</mat-option>
          <mat-option value="en_proceso">En proceso</mat-option>
          <mat-option value="resuelta">Resuelta</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <app-data-table
      [columnas]="columnas"
      [filas]="lista()"
      [conAcciones]="true"
      textoAccion="Gestionar"
      (accion)="abrir($event)"
      vacio="No hay incidencias con ese filtro"
    />

    @if (editando(); as inc) {
      <div class="capa" (click)="cerrar()"></div>
      <mat-card class="editor">
        <mat-card-header><mat-card-title>Gestionar incidencia</mat-card-title></mat-card-header>
        <mat-card-content>
          <p class="detalle">
            <strong>{{ inc.nombres }} {{ inc.apellidos }}</strong> ({{ inc.grado }}-{{ inc.seccion }}) ·
            {{ inc.docente_nombres }} {{ inc.docente_apellidos }}
          </p>
          <p class="detalle">{{ inc.descripcion }}</p>

          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="estadoElegido">
              <mat-option value="pendiente">Pendiente</mat-option>
              <mat-option value="en_proceso">En proceso</mat-option>
              <mat-option value="resuelta">Resuelta</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Respuesta del director</mat-label>
            <textarea matInput rows="4" maxlength="1000" [(ngModel)]="respuestaTexto"
                      placeholder="Escriba la respuesta para el docente"></textarea>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button type="button" (click)="cerrar()">Cancelar</button>
          <button mat-flat-button type="button" class="guardar" (click)="guardar()">Guardar cambios</button>
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: `
    .fila { max-width: 280px; margin-bottom: 12px; }
    .capa { position: fixed; inset: 0; background: rgba(15, 28, 51, 0.45); z-index: 10; }
    .editor {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 11; width: min(560px, 92vw); padding: 8px;
    }
    .detalle { font-size: 0.86rem; color: #4b5563; margin-bottom: 8px; }
    .guardar { background: #2c4f86; color: #fff; }
  `,
})
export class IncidenciasDirector {
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly lista = signal<IncidenciaDirector[]>([]);
  readonly filtro = signal('');
  readonly editando = signal<IncidenciaDirector | null>(null);
  estadoElegido: Estado = 'pendiente';
  respuestaTexto = '';

  readonly columnas: Columna<IncidenciaDirector>[] = [
    {
      titulo: 'Estudiante',
      clave: 'apellidos',
      render: (i) => `${i.nombres} ${i.apellidos} (${i.grado}-${i.seccion})`,
    },
    { titulo: 'Docente', clave: 'docente_nombres', render: (i) => `${i.docente_nombres} ${i.docente_apellidos}` },
    { titulo: 'Tipo', clave: 'tipo' },
    { titulo: 'Descripción', clave: 'descripcion' },
    { titulo: 'Fecha', clave: 'fecha' },
    { titulo: 'Estado', clave: 'estado' },
    {
      titulo: 'Respuesta',
      clave: 'respuesta_director',
      render: (i) => i.respuesta_director ?? 'Sin respuesta',
    },
  ];

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cambiarFiltro(valor: string): Promise<void> {
    this.filtro.set(valor);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<IncidenciaDirector[]>('incidencias', { estado: this.filtro() }));
    if (respuesta.ok) {
      this.lista.set(respuesta.datos ?? []);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    }
  }

  abrir(incidencia: IncidenciaDirector): void {
    this.editando.set(incidencia);
    this.estadoElegido = incidencia.estado;
    this.respuestaTexto = incidencia.respuesta_director ?? '';
  }

  cerrar(): void {
    this.editando.set(null);
  }

  async guardar(): Promise<void> {
    const incidencia = this.editando();
    if (!incidencia) return;

    const respuesta = await firstValueFrom(
      this.api.put<IncidenciaDirector>(`incidencias/${incidencia.id}`, {
        estado: this.estadoElegido,
        respuesta_director: this.respuestaTexto,
      }),
    );

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) {
      this.cerrar();
      await this.cargar();
    }
  }
}