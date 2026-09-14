import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { TenantRuntimeService } from './tenant-runtime.service';

export function requireModule(code: string): CanActivateFn {
  return () => {
    const runtime = inject(TenantRuntimeService);
    const router = inject(Router);
    const current = runtime.runtime();

    // Navigation must never wait on tenant-runtime. If it is already cached,
    // enforce the known module state synchronously; otherwise let the page open
    // and hydrate the runtime in the background. Backend authorization remains
    // the source of truth for the actual API operation.
    if (current) {
      return runtime.isActive() && runtime.hasModule(code)
        ? true
        : router.createUrlTree(['/dashboard'], { queryParams: { reason: 'module-unavailable', module: code } });
    }

    runtime.load().subscribe({ error: () => undefined });
    return true;
  };
}

export function requirePermission(permission: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.ensureSession().pipe(
      map(valid => valid && auth.hasPermission(permission)
        ? true
        : router.createUrlTree(['/dashboard'], { queryParams: { reason: 'permission-required' } })),
      catchError(() => of(router.createUrlTree(['/login'], { queryParams: { reason: 'session-expired' } })))
    );
  };
}
