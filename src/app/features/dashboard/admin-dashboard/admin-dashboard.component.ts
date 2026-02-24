import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  usuario = this.authService.getUsuario();

  // IMPLEMENTACION DE ICONOS Y RUTAS EN EL SIDENAV
menuItems = [
  { label: 'Inicio',         icon: 'dashboard',        ruta: '/admin' },
  { label: 'Especialidades', icon: 'medical_services', ruta: '/admin/especialidades' },
  { label: 'Médicos',        icon: 'monitor_heart',    ruta: '/admin/medicos' },
  { label: 'Citas',          icon: 'calendar_month',   ruta: '/admin/citas' },
  { label: 'Pacientes',      icon: 'people',           ruta: '/admin/pacientes' },
  { label: 'Administradores', icon: 'admin_panel_settings', ruta: '/admin/usuarios' }
];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}