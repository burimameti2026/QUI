import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiErrorService } from './api-error.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiErrors = inject(ApiErrorService);
  const isTokenRequest = request.url.includes('/connect/token');

  // The access token is authoritative for tenant context after login.
  // Do not fall back to a hardcoded/default tenant.
  const tenant = auth.session()?.tenantSlug || localStorage.getItem('qai-tenant') || '';
  const withContext = (token: string | null) => {
    const headers: Record<string, string> = {};
    if (tenant) headers['X-Tenant'] = tenant;
    if (token && !isTokenRequest) headers.Authorization = `Bearer ${token}`;
    return request.clone({ setHeaders: headers });
  };

  return next(withContext(auth.accessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isTokenRequest || !auth.hasRefreshToken()) {
        apiErrors.show(error);
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap(token => next(withContext(token))),
        catchError(refreshError => {
          apiErrors.show(refreshError);
          auth.logout();
          void router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
          return throwError(() => refreshError);
        })
      );
    })
  );
};
