import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Columna, DataTable } from '../../../shared/components/data-table/data-table';
import { Bandeja, Carpeta, Mensaje } from '../../../core/models/mensaje.model';

/** Bandeja de mensajes del docente: recibidos, enviados y redacción a la dirección. */
@Component({
  selector: 'app-mensajes',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, DataTable],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mensajes {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly carpeta = signal<Carpeta>('recibidos');
  readonly lista = signal<Mensaje[]>([]);
  readonly noLeidos = signal(0);
  readonly enviando = signal(false);
  readonly seleccionado = signal<Mensaje | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    asunto: ['', [Validators.required, Validators.maxLength(120)]],
    cuerpo: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly columnas: Columna<Mensaje>[] = [
    {
      titulo: 'De / Para',
      clave: 'remitente_nombres',
      render: (m) =>
        `${m.remitente_nombres} ${m.remitente_apellidos} → ${
          m.destinatario_ugel ?? `${m.destinatario_nombres ?? ''} ${m.destinatario_apellidos ?? ''}`.trim()
        }`,
    },
    { titulo: 'Asunto', clave: 'asunto' },
    {
      titulo: 'Mensaje',
      clave: 'cuerpo',
      render: (m) => (m.cuerpo.length > 70 ? `${m.cuerpo.slice(0, 70)}…` : m.cuerpo),
    },
    {
      titulo: 'Fecha',
      clave: 'fecha',
      render: (m) => new Date(m.fecha.replace(' ', 'T')).toLocaleDateString('es-PE'),
    },
    { titulo: 'Estado', clave: 'leido', render: (m) => (m.leido === 0 ? 'No leído' : 'Leído') },
  ];

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cambiarCarpeta(carpeta: Carpeta): Promise<void> {
    this.carpeta.set(carpeta);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<Bandeja>('mensajes', { carpeta: this.carpeta() }));
    if (respuesta.ok && respuesta.datos) {
      this.lista.set(respuesta.datos.mensajes);
      this.noLeidos.set(respuesta.datos.no_leidos);
    } else {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
    }
  }

  async ver(mensaje: Mensaje): Promise<void> {
    this.seleccionado.set(mensaje);
    if (this.carpeta() === 'recibidos' && mensaje.leido === 0) {
      const r = await firstValueFrom(this.api.put(`mensajes/${mensaje.id}/leido`, {}));
      if (r.ok) await this.cargar();
    }
  }

  async enviar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const respuesta = await firstValueFrom(this.api.post<Mensaje>('mensajes', this.formulario.getRawValue()));
    this.enviando.set(false);

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });
    if (respuesta.ok) {
      this.formulario.reset();
      await this.cargar();
      await this.cambiarCarpeta('enviados');
    }
  }
}