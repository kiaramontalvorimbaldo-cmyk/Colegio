/** Modelos del módulo docente. */

export interface PerfilDocente {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  foto: string | null;
  rol: string;
  docente: { id: number; dni: string; especialidad: string } | null;
}

export interface CursoDocente {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  periodo: string;
  horas_semana: number;
  estudiantes: number;
}

export interface ClaseHorario {
  id: number;
  curso_id: number;
  dia: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
  curso: string;
  grado: string;
  seccion: string;
}

export type HorarioSemana = Record<string, ClaseHorario[]>;

export interface Estudiante {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
}