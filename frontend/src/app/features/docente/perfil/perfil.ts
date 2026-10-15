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
import { AuthService } from '../../../core/services/auth.service';
import { PerfilDocente } from '../../../core/models/docente.model';

/** Perfil del docente: datos de contacto y foto (multer). */
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Perfil {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snackbar = inject(MatSnackBar);

  readonly auth = inject(AuthService);

  readonly cargando = signal(true);
  readonly fotoUrl = signal<string | null>(null);
  readonly dni = signal('');
  readonly especialidad = signal('');

  readonly formulario = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    telefono: ['', [Validators.maxLength(20)]],
  });

  async ngOnInit(): Promise<void> {
    const respuesta = await firstValueFrom(this.api.get<PerfilDocente>('docente/perfil'));
    this.cargando.set(false);

    if (!respuesta.ok || !respuesta.datos) {
      this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3500 });
      return;
    }

    const perfil = respuesta.datos;
    this.formulario.setValue({
      nombres: perfil.nombres,
      apellidos: perfil.apellidos,
      email: perfil.email ?? '',
      telefono: perfil.telefono ?? '',
    });
    this.fotoUrl.set(perfil.foto);
    this.dni.set(perfil.docente?.dni ?? '-');
    this.especialidad.set(perfil.docente?.especialidad ?? '-');
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const respuesta = await firstValueFrom(this.api.put<PerfilDocente>('docente/perfil', this.formulario.getRawValue()));
    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });

    if (respuesta.ok) {
      await this.auth.refrescar(); // el menú y la cabecera usan el mismo signal
    }
  }

  async cambiarFoto(evento: Event): Promise<void> {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    if (archivo.size > 300 * 1024) {
      this.snackbar.open('La foto supera los 300 KB permitidos', 'Cerrar', { duration: 3500 });
      return;
    }

    const form = new FormData();
    form.append('foto', archivo);

    const respuesta = await firstValueFrom(this.api.postForm<{ foto: string }>('docente/perfil/foto', form));
    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 3000 });

    if (respuesta.ok && respuesta.datos) {
      this.fotoUrl.set(respuesta.datos.foto);
    }
  }
}