import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Rol } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';

/**
 * Restringe una rama de rutas a un perfil.
 * Si el usuario tiene otro rol, se lo manda a su propio panel.
 */
export function rolGuard(rol: Rol): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLogged()) return router.createUrlTree(['/login']);
    if (auth.tieneRol(rol)) return true;

    return router.createUrlTree([auth.rutaInicio()]);
  };
}