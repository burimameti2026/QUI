import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { TenantRuntimeService } from './tenant-runtime.service';

export function requireModule(code: string): CanActivateFn {
  return () => {
    const runtime = inject(TenantRuntimeService);
    const router = inject(Router);
    return runtime.load().pipe(
      map(() => runtime.isActive() && runtime.hasModule(code)
        ? true
        : router.createUrlTree(['/dashboard'], { queryParams: { reason: 'module-unavailable', module: code } })),
      catchError(() => of(router.createUrlTree(['/dashboard'], { queryParams: { reason: 'tenant-runtime-unavailable', module: code } })))
    );
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
