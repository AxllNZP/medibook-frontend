import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './medico-dashboard.component.html',
  styleUrl: './medico-dashboard.component.css'
})
export class MedicoDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  usuario = this.authService.getUsuario();

menuItems = [
  { label: 'Mis Citas',        icon: 'calendar_month',      ruta: '/medico/mis-citas' },
  { label: 'Historial Médico', icon: 'folder_shared',       ruta: '/medico/historial' },
  { label: 'Mi Perfil',        icon: 'account_circle',      ruta: '/medico/perfil'    }
];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
