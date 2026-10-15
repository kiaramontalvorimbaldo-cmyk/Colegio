/** Usuario de la sesión y roles disponibles en el sistema. */
export type Rol = 'DOCENTE' | 'DIRECTOR';

export interface Usuario {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  foto: string | null;
  rol: Rol;
}

export interface Credenciales {
  token: string;
  usuario: Usuario;
}