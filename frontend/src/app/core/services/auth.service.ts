import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { Credenciales, Rol, Usuario } from '../models/usuario.model';

const LLAVE_TOKEN = 'scj_token';
const LLAVE_USUARIO = 'scj_usuario';

/** Estado de sesión con signals: token, usuario y banderas por rol. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  readonly token = signal<string | null>(localStorage.getItem(LLAVE_TOKEN));
  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  readonly isLogged = computed(() => !!this.token() && !!this.usuario());
  readonly nombreCompleto = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombres} ${u.apellidos}`.trim() : '';
  });
  readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombres.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase() : '';
  });

  /** Ruta de inicio según el perfil. */
  readonly rutaInicio = computed(() => (this.usuario()?.rol === 'DIRECTOR' ? '/director/dashboard' : '/docente/dashboard'));

  /** Inicia sesión y guarda token y usuario. */
async login(usuario: string, clave: string) {
    const respuesta = await firstValueFrom(this.api.post<Credenciales>('auth/login', { usuario, clave }));

    if (respuesta.ok && respuesta.datos) {
      const { token, usuario: datos } = respuesta.datos;
      this.token.set(token);
      this.usuario.set(datos);
      localStorage.setItem(LLAVE_TOKEN, token);
      localStorage.setItem(LLAVE_USUARIO, JSON.stringify(datos));
    }
    return respuesta;
  }

  /** Consulta la sesión en el backend (valida el token). */
async refrescar(): Promise<boolean> {
    if (!this.token()) return false;

    const respuesta = await firstValueFrom(this.api.get<Usuario>('auth/yo'));
    if (respuesta.ok && respuesta.datos) {
      this.usuario.set(respuesta.datos);
      localStorage.setItem(LLAVE_USUARIO, JSON.stringify(respuesta.datos));
      return true;
    }

    this.logout();
    return false;
  }

  logout(): void {
    this.token.set(null);
    this.usuario.set(null);
    localStorage.removeItem(LLAVE_TOKEN);
    localStorage.removeItem(LLAVE_USUARIO);
  }

  tieneRol(rol: Rol): boolean {
    return this.usuario()?.rol === rol;
  }

  private leerUsuarioGuardado(): Usuario | null {
    try {
      const guardado = localStorage.getItem(LLAVE_USUARIO);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }
}