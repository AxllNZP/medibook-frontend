import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const snackBar    = inject(MatSnackBar);
  const token       = authService.getToken();

  const requestConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requestConToken).pipe(
    catchError((error: HttpErrorResponse) => {

      // Error de red — el backend no responde
      if (error.status === 0) {
        snackBar.open(
          'No se puede conectar al servidor. Verifica tu conexión.',
          'Cerrar',
          { duration: 5000, panelClass: ['snack-error'] }
        );
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          // Token expirado o inválido — cerramos sesión
          authService.logout();
          router.navigate(['/login']);
          snackBar.open(
            'Tu sesión expiró. Inicia sesión de nuevo.',
            'Cerrar',
            { duration: 4000, panelClass: ['snack-error'] }
          );
          break;

        case 403:
          // Logueado pero sin permisos
          router.navigate(['/403']);
          break;

        case 404:
          // Recurso no encontrado — no redirigimos, solo avisamos
          // El componente que hizo la petición maneja su propio error
          break;

        case 500:
          snackBar.open(
            'Error interno del servidor. Intenta de nuevo más tarde.',
            'Cerrar',
            { duration: 5000, panelClass: ['snack-error'] }
          );
          break;
      }

      return throwError(() => error);
    })
  );
};