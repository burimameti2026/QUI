import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isTokenRequest = request.url.includes('/connect/token');
  const tenant = localStorage.getItem('qai-tenant') || 'renova';

  const attachContext = (token: string | null) => {
    const headers: Record<string, string> = { 'X-Tenant': tenant };
    if (token && !isTokenRequest) headers.Authorization = `Bearer ${token}`;
    return request.clone({ setHeaders: headers });
  };

  return next(attachContext(auth.accessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isTokenRequest || !auth.hasRefreshToken()) return throwError(() => error);
      return auth.refreshAccessToken().pipe(
        switchMap(token => next(attachContext(token))),
        catchError(refreshError => {
          auth.logout();
          void router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
          return throwError(() => refreshError);
        })
      );
    })
  );
};
