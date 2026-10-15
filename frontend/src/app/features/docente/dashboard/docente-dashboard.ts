import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';

/** Panel de inicio del docente. */
@Component({
  selector: 'app-docente-dashboard',
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="tarjeta">
      <mat-card-header>
        <mat-icon matCardAvatar aria-hidden="true">dashboard</mat-icon>
        <mat-card-title>Panel del docente</mat-card-title>
        <mat-card-subtitle>{{ auth.usuario()?.rol }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Sesión iniciada como <strong>{{ auth.nombreCompleto() }}</strong> (usuario: {{ auth.usuario()?.usuario }}).</p>
        <p>Gestiona tu perfil, consulta tus cursos y horarios, registra asistencia e incidencias, revisa tus reportes y comunícate con la dirección desde el menú.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: '.tarjeta { max-width: 720px; }',
})
export class DocenteDashboard {
  readonly auth = inject(AuthService);
}

