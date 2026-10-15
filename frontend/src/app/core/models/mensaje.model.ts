/** Mensaje de la bandeja (docente <-> dirección). */
export interface Mensaje {
  id: number;
  asunto: string;
  cuerpo: string;
  fecha: string;
  leido: number;
  remitente_nombres: string;
  remitente_apellidos: string;
  destinatario_nombres: string | null;
  destinatario_apellidos: string | null;
  destinatario_ugel: string | null;
}

export interface Bandeja {
  mensajes: Mensaje[];
  no_leidos: number;
}

export type Carpeta = 'recibidos' | 'enviados' | 'todos';