import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="notfound-container">
      <div class="notfound-card">
        <div class="error-icon">
          <mat-icon>search_off</mat-icon>
        </div>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que buscas no existe o fue movida.</p>
        <button mat-raised-button color="primary" (click)="volver()">
          <mat-icon>home</mat-icon>
          Volver al inicio
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notfound-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
    }

    .notfound-card {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      max-width: 400px;
    }

    .error-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .error-icon mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #1565C0;
    }

    h1 {
      font-size: 4rem;
      font-weight: 700;
      color: #1565C0;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 1.4rem;
      color: #333;
      margin: 0.5rem 0;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }
  `]
})
export class NotFoundComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  volver() {
    const usuario = this.authService.getUsuario();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    if (usuario.roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (usuario.roles.includes('ROLE_MEDICO')) {
      this.router.navigate(['/medico']);
    } else {
      this.router.navigate(['/paciente']);
    }
  }
}