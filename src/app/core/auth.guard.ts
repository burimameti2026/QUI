import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Route activation must stay synchronous. Token refresh belongs to the HTTP
  // interceptor, not to Angular navigation, otherwise a slow identity endpoint
  // can make the whole application appear frozen.
  if (auth.hasValidAccessToken() || auth.hasRefreshToken()) return true;

  return router.createUrlTree(['/login']);
};
