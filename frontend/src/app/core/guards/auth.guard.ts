import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Sin sesión válida el usuario es enviado al login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) return true;

  return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
};