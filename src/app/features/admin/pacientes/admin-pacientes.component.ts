import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../../core/services/paciente.service';
import { PacienteResponse } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-admin-pacientes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatInputModule
  ],
  templateUrl: './admin-pacientes.component.html',
  styleUrl: './admin-pacientes.component.css'
})
export class AdminPacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private snackBar = inject(MatSnackBar);

  pacientes: PacienteResponse[] = [];
  pacientesFiltrados: PacienteResponse[] = [];
  columnas = ['nombre', 'email', 'telefono', 'grupoSanguineo', 'fechaNacimiento'];
  cargando = false;
  busqueda = '';

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.cargando = true;
    this.pacienteService.listarTodos().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar pacientes', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  // Filtro local por nombre o email — no necesita llamar al backend
  filtrar() {
    const texto = this.busqueda.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.apellidos.toLowerCase().includes(texto) ||
      p.email.toLowerCase().includes(texto)
    );
  }
}