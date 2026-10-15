import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models/usuario.model';

interface EnlaceMenu {
  titulo: string;
  icono: string;
  ruta: string;
  exacto?: boolean;
}

const MENUS: Record<Rol, { grupo: string; enlaces: EnlaceMenu[] }[]> = {
  DOCENTE: [
    {
      grupo: 'Principal',
      enlaces: [
        { titulo: 'Panel', icono: 'dashboard', ruta: '/docente/dashboard', exacto: true },
        { titulo: 'Mi perfil', icono: 'person', ruta: '/docente/perfil' },
        { titulo: 'Cursos y horarios', icono: 'school', ruta: '/docente/cursos-horarios' },
        { titulo: 'Mensajes', icono: 'mail', ruta: '/docente/mensajes' },
      ],
    },
    {
      grupo: 'Aula',
      enlaces: [
        { titulo: 'Asistencia', icono: 'how_to_reg', ruta: '/docente/asistencia' },
        { titulo: 'Incidencias', icono: 'report', ruta: '/docente/incidencias' },
        { titulo: 'Mis reportes', icono: 'insert_chart', ruta: '/docente/reportes' },
      ],
    },
  ],
  DIRECTOR: [
    {
      grupo: 'Principal',
      enlaces: [{ titulo: 'Panel', icono: 'dashboard', ruta: '/director/dashboard', exacto: true }],
    },
    {
      grupo: 'Gestión académica',
      enlaces: [
        { titulo: 'Incidencias', icono: 'report', ruta: '/director/incidencias' },
        { titulo: 'Evaluación docente', icono: 'star', ruta: '/director/evaluacion' },
        { titulo: 'Docentes', icono: 'groups', ruta: '/director/docentes' },
        { titulo: 'Cursos y horarios', icono: 'school', ruta: '/director/cursos' },
      ],
    },
    {
      grupo: 'Administración',
      enlaces: [
        { titulo: 'Mensajería y UGEL', icono: 'send', ruta: '/director/mensajeria' },
        { titulo: 'Plantillas UGEL', icono: 'description', ruta: '/director/plantillas-ugel' },
        { titulo: 'Panel económico', icono: 'paid', ruta: '/director/economia' },
      ],
    },
  ],
};

/** Layout principal: sidebar con menú por rol + topbar con buscador y perfil. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuAbierto = signal(false);
  readonly usuario = this.auth.usuario;
  readonly nombreCompleto = this.auth.nombreCompleto;
  readonly iniciales = this.auth.iniciales;
  readonly rol = computed(() => this.usuario()?.rol);
  readonly menus = computed(() => MENUS[this.usuario()?.rol ?? 'DOCENTE']);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}