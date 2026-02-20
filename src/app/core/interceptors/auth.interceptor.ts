import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// HttpInterceptorFn es la forma moderna de Angular 17+ (función, no clase)
// Se ejecuta automáticamente en CADA request HTTP de la app
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Si hay token, clonamos el request y le agregamos el header Authorization
  // Clonamos porque los requests HTTP son inmutables en Angular
  const requestConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requestConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 (token expirado o inválido)
      // cerramos sesión y mandamos al login automáticamente
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};