import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TenantRuntimeService } from './tenant-runtime.service';

export function requireModule(code: string): CanActivateFn {
  return () => {
    const runtime = inject(TenantRuntimeService);
    const router = inject(Router);
    const current = runtime.runtime();

    // Never make navigation depend on tenant-runtime availability. If runtime
    // is already known, enforce it synchronously; otherwise the page opens and
    // the backend remains the authorization source of truth.
    if (!current) return true;

    return runtime.isActive() && runtime.hasModule(code)
      ? true
      : router.createUrlTree(['/dashboard'], {
          queryParams: { reason: 'module-unavailable', module: code }
        });
  };
}

export function requirePermission(permission: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Permissions are enforced by the API. Do not block route activation while
    // waiting for an identity refresh; an existing session can render and any
    // protected request will refresh/reject through the HTTP auth layer.
    if (!auth.hasValidAccessToken() && !auth.hasRefreshToken()) {
      return router.createUrlTree(['/login'], { queryParams: { reason: 'session-expired' } });
    }

    return auth.hasPermission(permission)
      ? true
      : router.createUrlTree(['/dashboard'], {
          queryParams: { reason: 'permission-required' }
        });
  };
}
