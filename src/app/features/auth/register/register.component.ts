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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  cargando = false;
  errorMensaje = '';
  ocultarPassword = true;

  // SIEMPRE CREARA PACIENTE, PERO EN LA PRACTICA SE PODRIA DAR LA OPCION DE REGISTRARSE COMO MEDICO (CON UN CODIGO O ALGO ASI)
submit(): void {
  if (this.form.invalid) return;
  this.cargando = true;
  this.errorMensaje = '';

  this.authService.register(this.form.value as any).subscribe({
    next: (response) => {
      if (response.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/admin']);
      } else if (response.roles.includes('ROLE_MEDICO')) {
        this.router.navigate(['/medico']);
      } else {
        this.router.navigate(['/paciente']);
      }
    },
    error: (err) => {
      this.errorMensaje = err.error?.mensaje || 'Error al registrarse';
      this.cargando = false;
    }
  });
}
}