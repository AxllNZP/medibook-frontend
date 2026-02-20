import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { PacienteResponse } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-paciente-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './paciente-perfil.component.html',
  styleUrl: './paciente-perfil.component.css'
})
export class PacientePerfilComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  perfil: PacienteResponse | null = null;
  cargando = false;
  guardando = false;
  tienePerfil = false;

  form = this.fb.group({
    telefono: [''],
    direccion: [''],
    fechaNacimiento: [''],
    grupoSanguineo: ['']
  });

  usuario = this.authService.getUsuario();

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.pacienteService.miPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.tienePerfil = true;
        // Formateamos la fecha para el input date (yyyy-MM-dd)
        const fecha = data.fechaNacimiento
          ? new Date(data.fechaNacimiento).toISOString().split('T')[0]
          : '';
        this.form.patchValue({
          telefono: data.telefono,
          direccion: data.direccion,
          fechaNacimiento: fecha,
          grupoSanguineo: data.grupoSanguineo
        });
        this.cargando = false;
      },
      error: () => {
        // Si no tiene perfil aún, mostramos el formulario vacío para crearlo
        this.tienePerfil = false;
        this.cargando = false;
      }
    });
  }

  guardar() {
    this.guardando = true;
    const datos = this.form.value as any;

    const operacion = this.tienePerfil
      ? this.pacienteService.actualizarPerfil(datos)
      : this.pacienteService.crearPerfil(datos);

    operacion.subscribe({
      next: (data) => {
        this.perfil = data;
        this.tienePerfil = true;
        this.snackBar.open('Perfil guardado correctamente', 'Cerrar', { duration: 3000 });
        this.guardando = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.mensaje || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.guardando = false;
      }
    });
  }
}