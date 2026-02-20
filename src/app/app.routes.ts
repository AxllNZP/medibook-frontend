import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // PACIENTE
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard],
    data: { rol: 'ROLE_PACIENTE' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/paciente-dashboard/paciente-dashboard.component')
            .then(m => m.PacienteDashboardComponent)
      }
    ]
  },

  // MEDICO
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard],
    data: { rol: 'ROLE_MEDICO' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/medico-dashboard/medico-dashboard.component')
            .then(m => m.MedicoDashboardComponent)
      }
    ]
  },

  // ADMIN — el dashboard es el layout, los hijos son las secciones
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { rol: 'ROLE_ADMIN' },
    loadComponent: () =>
      import('./features/dashboard/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
    children: [
      { path: '', redirectTo: 'especialidades', pathMatch: 'full' },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./features/admin/especialidades/especialidades.component')
            .then(m => m.EspecialidadesComponent)
      },
      {
        path: 'medicos',
        loadComponent: () =>
          import('./features/admin/medicos/medicos.component')
            .then(m => m.MedicosComponent)
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/admin/citas/admin-citas.component')
            .then(m => m.AdminCitasComponent)
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./features/admin/pacientes/admin-pacientes.component')
            .then(m => m.AdminPacientesComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];