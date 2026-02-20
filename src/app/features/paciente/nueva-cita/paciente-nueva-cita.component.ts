import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CitaService } from '../../../core/services/cita.service';
import { MedicoService } from '../../../core/services/medico.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { MedicoResponse } from '../../../core/models/medico.model';
import { EspecialidadResponse } from '../../../core/models/especialidad.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-paciente-nueva-cita',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './paciente-nueva-cita.component.html',
  styleUrl: './paciente-nueva-cita.component.css'
})
export class PacienteNuevaCitaComponent implements OnInit {
  private citaService = inject(CitaService);
  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  medicos: MedicoResponse[] = [];
  medicosFiltrados: MedicoResponse[] = [];
  especialidades: EspecialidadResponse[] = [];
  guardando = false;

  form = this.fb.group({
    especialidadId: [null as number | null],
    medicoId:       [null as number | null, Validators.required],
    fechaHora:      ['', Validators.required],
    motivo:         ['']
  });

  // Fecha mínima = mañana (no se puede agendar para hoy o antes)
  fechaMinima = new Date(Date.now() + 86400000).toISOString().slice(0, 16);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.especialidadService.listarTodas().subscribe({
      next: (data) => this.especialidades = data
    });
    this.medicoService.listarTodos().subscribe({
      next: (data) => {
        this.medicos = data;
        this.medicosFiltrados = data;
      }
    });
  }

  // Filtra médicos cuando el paciente selecciona una especialidad
  filtrarMedicos(especialidadId: number | null) {
    this.form.patchValue({ medicoId: null });
    this.medicosFiltrados = especialidadId
      ? this.medicos.filter(m => m.especialidadId === especialidadId)
      : this.medicos;
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;

    const { medicoId, fechaHora, motivo } = this.form.value;

    this.citaService.crearCita({
      medicoId: medicoId!,
      fechaHora: new Date(fechaHora!).toISOString().slice(0, 19),
      motivo: motivo || ''
    }).subscribe({
      next: () => {
        this.snackBar.open('¡Cita agendada! Revisa tu email de confirmación', 'Cerrar', {
          duration: 5000
        });
        this.router.navigate(['/paciente/mis-citas']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.mensaje || 'Error al agendar cita', 'Cerrar', { duration: 3000 });
        this.guardando = false;
      }
    });
  }
}