import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // FormGroup define el formulario con sus validaciones
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  cargando = false;
  errorMensaje = '';
  ocultarPassword = true;

  submit(): void {
  if (this.form.invalid) return;
  this.cargando = true;
  this.errorMensaje = '';

  this.authService.login(this.form.value as any).subscribe({
    next: (response) => {
      // ✅ Rutas corregidas — sin /dashboard
      if (response.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/admin']);
      } else if (response.roles.includes('ROLE_MEDICO')) {
        this.router.navigate(['/medico']);
      } else {
        this.router.navigate(['/paciente']);
      }
    },
    error: (err) => {
      this.errorMensaje = err.error?.mensaje || 'Error al iniciar sesión';
      this.cargando = false;
    }
  });
}
}