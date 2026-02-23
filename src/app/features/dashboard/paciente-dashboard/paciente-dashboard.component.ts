import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './paciente-dashboard.component.html',
  styleUrl: './paciente-dashboard.component.css'
})
export class PacienteDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  usuario = this.authService.getUsuario();

  // IMPLEMENTACION DE ICONOS Y RUTAS EN EL SIDENAV
menuItems = [
  { label: 'Inicio',     icon: 'dashboard',      ruta: '/paciente',           exact: true  },
  { label: 'Mi Perfil',  icon: 'account_circle', ruta: '/paciente/perfil',    exact: false },
  { label: 'Mis Citas',  icon: 'calendar_month', ruta: '/paciente/mis-citas', exact: false },
  { label: 'Nueva Cita', icon: 'add_circle',      ruta: '/paciente/nueva-cita', exact: false }
];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}