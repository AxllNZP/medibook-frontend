import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicoService } from '../../../core/services/medico.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { MedicoResponse } from '../../../core/models/medico.model';
import { EspecialidadResponse } from '../../../core/models/especialidad.model';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatCardModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css'
})
export class MedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  medicos: MedicoResponse[] = [];
  especialidades: EspecialidadResponse[] = [];
  columnas = ['nombre', 'cmp', 'especialidad', 'telefono', 'email'];
  cargando = false;
  mostrarFormulario = false;

  // El admin necesita: CMP, teléfono, especialidad, y el usuarioId
  // El usuarioId viene del email — buscamos al usuario por email
  form = this.fb.group({
    cmp:           ['', Validators.required],
    telefono:      [''],
    especialidadId: [null as number | null, Validators.required],
    usuarioId:     [null as number | null, Validators.required]
  });

  ngOnInit() {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos() {
    this.cargando = true;
    this.medicoService.listarTodos().subscribe({
      next: (data) => { this.medicos = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar médicos', 'error'); this.cargando = false; }
    });
  }

  cargarEspecialidades() {
    this.especialidadService.listarTodas().subscribe({
      next: (data) => this.especialidades = data
    });
  }

  guardar() {
    if (this.form.invalid) return;
    const datos = this.form.value as any;

    this.medicoService.crear(datos).subscribe({
      next: () => {
        this.mostrarMensaje('Médico creado exitosamente', 'ok');
        this.mostrarFormulario = false;
        this.form.reset();
        this.cargarMedicos();
      },
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al crear médico', 'error')
    });
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.form.reset();
  }

  private mostrarMensaje(mensaje: string, tipo: 'ok' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'error' ? ['snack-error'] : ['snack-ok']
    });
  }
}