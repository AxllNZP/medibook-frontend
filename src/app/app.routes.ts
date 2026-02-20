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

  // ✅ PACIENTE — loadComponent en el padre = layout con sidenav
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard],
    data: { rol: 'ROLE_PACIENTE' },
    loadComponent: () =>
      import('./features/dashboard/paciente-dashboard/paciente-dashboard.component')
        .then(m => m.PacienteDashboardComponent),
    children: [
      { path: '', redirectTo: 'mis-citas', pathMatch: 'full' },
      {
        path: 'mis-citas',
        loadComponent: () =>
          import('./features/paciente/mis-citas/paciente-mis-citas.component')
            .then(m => m.PacienteMisCitasComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/paciente/perfil/paciente-perfil.component')
            .then(m => m.PacientePerfilComponent)
      },
      {
        path: 'nueva-cita',
        loadComponent: () =>
          import('./features/paciente/nueva-cita/paciente-nueva-cita.component')
            .then(m => m.PacienteNuevaCitaComponent)
      }
    ]
  },

  // ✅ MEDICO — mismo patrón
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard],
    data: { rol: 'ROLE_MEDICO' },
    loadComponent: () =>
      import('./features/dashboard/medico-dashboard/medico-dashboard.component')
        .then(m => m.MedicoDashboardComponent),
    children: [
      { path: '', redirectTo: 'mis-citas', pathMatch: 'full' },
      {
        path: 'mis-citas',
        loadComponent: () =>
          import('./features/medico/mis-citas/medico-mis-citas.component')
            .then(m => m.MedicoMisCitasComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/medico/perfil/medico-perfil.component')
            .then(m => m.MedicoPerfilComponent)
      }
    ]
  },

  // ADMIN — ya estaba correcto
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