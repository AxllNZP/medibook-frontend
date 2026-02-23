import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege rutas según rol específico
// Uso: canActivate: [roleGuard], data: { rol: 'ROLE_ADMIN' }
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolRequerido = route.data['rol'] as string;

  if (authService.tieneRol(rolRequerido)) {
    return true;
  }

// Logueado con el rol incorrecto, redirige a 403
  router.navigate(['/403']);
  return false;
};