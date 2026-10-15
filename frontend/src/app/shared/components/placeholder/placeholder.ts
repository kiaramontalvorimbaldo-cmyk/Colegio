import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/** Pantalla provisional de los módulos que se habilitan en los próximos sprints. */
@Component({
  selector: 'app-placeholder',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="tarjeta">
      <mat-card-header>
        <mat-icon matCardAvatar aria-hidden="true">{{ icono() }}</mat-icon>
        <mat-card-title>{{ titulo() }}</mat-card-title>
        <mat-card-subtitle>{{ modulo() }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (auth.isLogged()) {
          <p>Hola, {{ auth.nombreCompleto() }} ({{ auth.usuario()?.rol }}).</p>
        }
        <p>{{ descripcion() }}</p>
      </mat-card-content>

      <mat-card-actions>
        <span class="badge">{{ sprint() }}</span>
        <a mat-stroked-button [routerLink]="['/', auth.rutaInicio()]">
          <mat-icon>home</mat-icon> Volver al panel
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .tarjeta { max-width: 720px; }
    .badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      background: #e0e9f7; color: #16305c; font-size: 0.72rem; font-weight: 600; margin-right: 12px;
    }
    mat-card-actions { align-items: center; }
  `,
})
export class Placeholder {
  readonly auth = inject(AuthService);
  private readonly ruta = inject(ActivatedRoute);

  readonly titulo = () => (this.ruta.snapshot.data['titulo'] as string) ?? 'Módulo';
  readonly modulo = () => (this.ruta.snapshot.data['modulo'] as string) ?? '';
  readonly descripcion = () =>
    (this.ruta.snapshot.data['descripcion'] as string) ?? 'Funcionalidad en construcción.';
  readonly sprint = () => (this.ruta.snapshot.data['sprint'] as string) ?? '';
  readonly icono = () => (this.ruta.snapshot.data['icono'] as string) ?? 'construction';
}