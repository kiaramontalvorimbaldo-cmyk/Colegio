import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/** Pantalla de acceso con Reactive Forms y validaciones en tiempo real. */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly snackbar = inject(MatSnackBar);

  readonly cargando = signal(false);
  readonly error = signal('');

  readonly formulario = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
  });

  get usuario() {
    return this.formulario.controls.usuario;
  }

  get clave() {
    return this.formulario.controls.clave;
  }

  async enviar(): Promise<void> {
    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Revise los campos marcados');
      return;
    }

    this.cargando.set(true);
    const { usuario, clave } = this.formulario.getRawValue();
    const respuesta = await this.auth.login(usuario, clave);
    this.cargando.set(false);

    if (!respuesta.ok) {
      this.error.set(respuesta.mensaje);
      this.clave.setValue('');
      return;
    }

    this.snackbar.open(respuesta.mensaje, 'Cerrar', { duration: 2500 });
    const retorno = this.ruta.snapshot.queryParamMap.get('retorno');
    await this.router.navigateByUrl(retorno || this.auth.rutaInicio());
  }
}