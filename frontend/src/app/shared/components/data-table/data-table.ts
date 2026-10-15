import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface Columna<T> {
  titulo: string;
  clave: keyof T & string;
  render?: (fila: T) => string;
}

/** Tabla genérica reutilizable en todos los módulos. */
@Component({
  selector: 'app-data-table',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marco">
      <table>
        <thead>
          <tr>
            @for (columna of columnas(); track columna.clave) {
              <th scope="col">{{ columna.titulo }}</th>
            }
            @if (conAcciones()) {
              <th scope="col">{{ textoAccion() }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (fila of filas(); track fila) {
            <tr>
              @for (columna of columnas(); track columna.clave) {
                <td>{{ columna.render ? columna.render(fila) : fila[columna.clave] }}</td>
              }
              @if (conAcciones()) {
                <td>
                  <button mat-stroked-button type="button" (click)="accion.emit(fila)">
                    <mat-icon>edit</mat-icon> {{ textoAccion() }}
                  </button>
                </td>
              }
            </tr>
          } @empty {
            <tr class="vacio">
              <td [attr.colspan]="columnas().length + (conAcciones() ? 1 : 0)">{{ vacio() }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .marco {
      overflow-x: auto;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(22, 48, 92, 0.06);
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
    th {
      text-align: left;
      background: #f8fafc;
      color: #16305c;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    td { padding: 10px 12px; border-bottom: 1px solid #eef1f6; }
    tbody tr:hover { background: #f8fafc; }
    .vacio { text-align: center; color: #6b7280; padding: 22px; }
  `,
})
export class DataTable<T> {
  readonly columnas = input.required<Columna<T>[]>();
  readonly filas = input.required<T[]>();
  readonly vacio = input('No hay registros para mostrar');
  readonly conAcciones = input(false);
  readonly textoAccion = input('Acción');
  readonly accion = output<T>();
}