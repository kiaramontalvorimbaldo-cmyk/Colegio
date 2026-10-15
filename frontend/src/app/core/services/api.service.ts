import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RespuestaApi } from '../models/respuesta-api.model';

export type Parametros = Record<string, string | number | boolean | null | undefined>;

/** Cliente HTTP base: devuelve siempre un RespuestaApi y nunca lanza errores. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(ruta: string, params?: Parametros): Observable<RespuestaApi<T>> {
    return this.enviar<T>(this.http.get<RespuestaApi<T>>(`${this.base}/${ruta}`, { params: this.aParametros(params) }));
  }

  post<T>(ruta: string, cuerpo: unknown): Observable<RespuestaApi<T>> {
    return this.enviar<T>(this.http.post<RespuestaApi<T>>(`${this.base}/${ruta}`, cuerpo));
  }

  /** Envía FormData (subida de archivos) sin fijar Content-Type. */
  postForm<T>(ruta: string, cuerpo: FormData): Observable<RespuestaApi<T>> {
    return this.enviar<T>(this.http.put<RespuestaApi<T>>(`${this.base}/${ruta}`, cuerpo));
  }

  put<T>(ruta: string, cuerpo: unknown): Observable<RespuestaApi<T>> {
    return this.enviar<T>(this.http.put<RespuestaApi<T>>(`${this.base}/${ruta}`, cuerpo));
  }

  delete<T>(ruta: string): Observable<RespuestaApi<T>> {
    return this.enviar<T>(this.http.delete<RespuestaApi<T>>(`${this.base}/${ruta}`));
  }

  private aParametros(params?: Parametros): HttpParams | undefined {
    if (!params) return undefined;
    let http = new HttpParams();
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        http = http.set(clave, String(valor));
      }
    }
    return http;
  }

  private enviar<T>(peticion: Observable<RespuestaApi<T>>): Observable<RespuestaApi<T>> {
    return peticion.pipe(
      catchError((error) =>
        of({
          ok: false,
          datos: null,
          mensaje: error?.error?.mensaje ?? 'No hay conexión con el servidor',
        }),
      ),
    );
  }
}