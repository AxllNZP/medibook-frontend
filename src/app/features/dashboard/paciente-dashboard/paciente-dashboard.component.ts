import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="header">
        <mat-icon>local_hospital</mat-icon>
        <h1>MediBook</h1>
        <button mat-stroked-button (click)="logout()">
          <mat-icon>logout</mat-icon> Cerrar Sesión
        </button>
      </div>
      <div class="bienvenida">
        <h2>Bienvenido, {{ usuario?.nombre }} 👋</h2>
        <p>Panel del Paciente — próximamente más funciones</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; }
    .header {
      display: flex; align-items: center; gap: 1rem;
      background: #1565C0; color: white;
      padding: 1rem 2rem; border-radius: 12px;
      margin-bottom: 2rem;
    }
    .header h1 { flex: 1; margin: 0; }
    .bienvenida { text-align: center; padding: 3rem; }
  `]
})
export class PacienteDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  usuario = this.authService.getUsuario();

  ngOnInit() {
    if (!this.authService.isLoggedIn()) this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}