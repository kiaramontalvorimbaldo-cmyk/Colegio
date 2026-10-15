import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
}

/** Diálogo de confirmación usado antes de eliminar registros. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title><mat-icon aria-hidden="true">warning</mat-icon>{{ data.titulo }}</h2>
    <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cerrar(false)">Cancelar</button>
      <button mat-flat-button type="button" class="peligro" (click)="cerrar(true)">
        {{ data.textoConfirmar ?? 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; color: #16305c; }
    .peligro { background: #dc2626; color: #fff; }
  `,
})
export class ConfirmDialog {
  readonly data = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialog>);

  cerrar(aceptado: boolean): void {
    this.ref.close(aceptado);
  }
}

/** Abre el diálogo y devuelve true si el usuario confirma. */
export function confirmar(md: MatDialog, titulo: string, mensaje: string, textoConfirmar = 'Eliminar') {
  return md
    .open(ConfirmDialog, { data: { titulo, mensaje, textoConfirmar }, width: '380px' })
    .afterClosed()
    .subscribe((aceptado: boolean) => !!aceptado);
}