/** Forma uniforme de las respuestas de la API: { ok, datos, mensaje }. */
export interface RespuestaApi<T> {
  ok: boolean;
  datos: T | null;
  mensaje: string;
}