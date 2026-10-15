/** Modelos de los módulos de la dirección. */

export interface ResumenDireccion {
  incidencias: { pendientes: number; proceso: number; resueltas: number; total: number };
  docentes: number;
  cursos: number;
  estudiantes: number;
  asistencia_promedio: number;
}

export interface DocenteAdmin {
  id: number;
  usuario_id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  dni: string;
  especialidad: string;
  sueldo: number;
  email: string | null;
  telefono: string | null;
  foto: string | null;
  activo: number;
  cursos: number;
}

export interface CredencialesDocente {
  id: number;
  usuario: string;
  contrasena: string;
  nombres: string;
  apellidos: string;
  aviso: string;
}

export interface EvaluacionDocente {
  id: number;
  docente_id: number;
  director_id: number;
  puntaje: number;
  observaciones: string;
  fecha: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
}

export interface PromedioDocente {
  docente_id: number;
  nombres: string;
  apellidos: string;
  evaluaciones: number;
  promedio: number | null;
}

export interface CursoAdmin {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  periodo: string;
  docente_id: number;
  docente_nombres: string;
  docente_apellidos: string;
  horas_semana: number;
}

export interface HorarioAdmin {
  id: number;
  curso_id: number;
  dia: number;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
  curso: string;
  grado: string;
  seccion: string;
  docente_nombres: string;
  docente_apellidos: string;
}

export interface IncidenciaDirector extends Record<string, unknown> {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  respuesta_director: string | null;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  docente_nombres: string;
  docente_apellidos: string;
}