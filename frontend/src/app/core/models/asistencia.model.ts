/** Modelos de asistencia e incidencias del docente. */

export type EstadoAsistencia = 'pendiente' | 'presente' | 'tardanza' | 'falta' | 'justificada';

export interface EstudianteAsistencia {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  asistencia_id: number | null;
  estado: EstadoAsistencia;
}

export interface ListaAsistencia {
  curso: { id: number; nombre: string; grado: string; seccion: string };
  fecha: string;
  estudiantes: EstudianteAsistencia[];
}

export type TipoIncidencia = 'conducta' | 'rendimiento' | 'asistencia' | 'otro';
export type EstadoIncidencia = 'pendiente' | 'en_proceso' | 'resuelta';

export interface Incidencia {
  id: number;
  estudiante_id: number;
  docente_id: number;
  tipo: TipoIncidencia;
  descripcion: string;
  fecha: string;
  estado: EstadoIncidencia;
  respuesta_director: string | null;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
}

export interface ResumenCurso {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  registros: number;
  presentes: number;
  tardanzas: number;
  faltas: number;
  justificadas: number;
  porcentaje: number;
}

export interface ReporteDocente {
  cursos_a_cargo: number;
  asistencia_promedio: number;
  asistencias_registradas: number;
  incidencias_registradas: number;
  por_curso: ResumenCurso[];
  incidencias_por_estado: { estado: EstadoIncidencia; total: number }[];
}