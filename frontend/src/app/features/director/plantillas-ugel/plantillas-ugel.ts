import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

interface PlantillaResumen {
  id: number;
  nombre: string;
}

interface DocumentoGenerado {
  id: number;
  nombre: string;
  contenido_html: string;
  marcadores_pendientes: string[];
  datos_institucionales: Record<string, string>;
}

/** Documento listo para mostrar: HTML saneado + datos auxiliares. */
interface DocumentoVisto {
  html: string;
  datos: Record<string, string>;
  pendientes: string[];
}

/** Plantillas UGEL: generación, vista previa e impresión / guardado como PDF. */
@Component({
  selector: 'app-plantillas-ugel',
  imports: [FormsModule, KeyValuePipe, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cabecera no-imprimir">
      <div>
        <h2>Documentos para la UGEL</h2>
        <p class="ayuda">Los marcadores se reemplazan con los datos institucionales antes de mostrarse.</p>
      </div>
      <button mat-flat-button type="button" (click)="imprimir()" [disabled]="!documento()">
        <mat-icon>print</mat-icon> Imprimir / Guardar como PDF
      </button>
    </div>

    <mat-card class="selector no-imprimir">
      <mat-card-content>
        <mat-form-field appearance="outline">
          <mat-label>Plantilla</mat-label>
          <mat-select [value]="plantillaId()" (selectionChange)="seleccionar($event.value)">
            @for (plantilla of plantillas(); track plantilla.id) {
              <mat-option [value]="plantilla.id">{{ plantilla.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <div class="documento" id="documento-ugel">
      @if (documento(); as doc) {
        <div [innerHTML]="doc.html"></div>
        <p class="datos no-imprimir">
          @for (dato of doc.datos | keyvalue; track dato.key) {
            <span><strong>{{ dato.key }}:</strong> {{ dato.value }}</span>
          }
        </p>
        @if (doc.pendientes.length) {
          <p class="pendientes no-imprimir">Marcadores sin reemplazo: {{ doc.pendientes.join(', ') }}</p>
        }
      } @else {
        <p class="vacio">Seleccione una plantilla para generar el documento.</p>
      }
    </div>
  `,
  styles: `
    .cabecera { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
    h2 { font-size: 1.05rem; color: #16305c; }
    .ayuda { font-size: 0.82rem; color: #6b7280; }
    .cabecera button { margin-left: auto; background: #2c4f86; color: #fff; }
    .selector { margin-bottom: 14px; }
    .documento { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 32px; line-height: 1.6; }
    .vacio { color: #6b7280; text-align: center; padding: 24px; }
    .datos { margin-top: 22px; padding-top: 12px; border-top: 1px dashed #e5e7eb; display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.76rem; color: #6b7280; }
    .pendientes { margin-top: 10px; color: #b45309; font-size: 0.8rem; }
  `,
})
export class PlantillasUgel {
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);

  readonly plantillas = signal<PlantillaResumen[]>([]);
  readonly plantillaId = signal(0);
  readonly documento = signal<DocumentoVisto | null>(null);

  ngAfterViewInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<PlantillaResumen[]>('plantillas'));
    if (respuesta.ok && respuesta.datos?.length) {
      this.plantillas.set(respuesta.datos);
      await this.seleccionar(respuesta.datos[0].id);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    }
  }

  async seleccionar(id: number): Promise<void> {
    this.plantillaId.set(id);
    const respuesta = await firstValueFrom(
      this.api.get<DocumentoGenerado>(`plantillas/${id}/generar`),
    );

    if (!respuesta.ok || !respuesta.datos) {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
      return;
    }

    // El HTML ya fue saneado en el servidor
    this.documento.set({
      html: respuesta.datos.contenido_html,
      datos: respuesta.datos.datos_institucionales,
      pendientes: respuesta.datos.marcadores_pendientes,
    });
  }

  imprimir(): void {
    window.print();
  }
}