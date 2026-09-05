import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { TenantRuntimeService } from './tenant-runtime.service';

export function requireModule(code: string): CanActivateFn {
  return () => {
    const runtime = inject(TenantRuntimeService);
    const router = inject(Router);
    return runtime.load().pipe(
      map(() => runtime.isActive() && runtime.hasModule(code)
        ? true
        : router.createUrlTree(['/billing'], { queryParams: { reason: 'module-unavailable', module: code } })),
      catchError(() => of(router.createUrlTree(['/billing'], { queryParams: { reason: 'tenant-runtime-unavailable' } })))
    );
  };
}
