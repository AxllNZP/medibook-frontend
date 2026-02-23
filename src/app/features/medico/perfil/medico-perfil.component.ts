import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicoService } from '../../../core/services/medico.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicoResponse } from '../../../core/models/medico.model';
import { EspecialidadResponse } from '../../../core/models/especialidad.model';

@Component({
  selector: 'app-medico-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './medico-perfil.component.html',
  styleUrl: './medico-perfil.component.css'
})
export class MedicoPerfilComponent implements OnInit {
  private medicoService     = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);
  private authService       = inject(AuthService);
  private fb                = inject(FormBuilder);
  private snackBar          = inject(MatSnackBar);

  perfil: MedicoResponse | null = null;
  especialidades: EspecialidadResponse[] = [];
  cargando  = false;
  guardando = false;
  // Controla si mostramos la vista de solo lectura o el formulario de edición
  editando  = false;

  usuario = this.authService.getUsuario();

  form = this.fb.group({
    cmp:            ['', Validators.required],
    telefono:       [''],
    especialidadId: [null as number | null, Validators.required]
  });

  ngOnInit() {
    this.cargarEspecialidades();
    this.cargarPerfil();
  }

  cargarEspecialidades() {
    this.especialidadService.listarTodas().subscribe({
      next: (data) => this.especialidades = data
    });
  }

  cargarPerfil() {
    this.cargando = true;
    this.medicoService.listarTodos().subscribe({
      next: (medicos) => {
        this.perfil = medicos.find(m => m.usuarioId === this.usuario?.id) || null;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  // Al hacer clic en "Editar", pre-cargamos el formulario con los datos actuales
  iniciarEdicion() {
    if (!this.perfil) return;
    this.form.patchValue({
      cmp:            this.perfil.cmp,
      telefono:       this.perfil.telefono || '',
      especialidadId: this.perfil.especialidadId
    });
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.form.reset();
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;

    const datos = {
      cmp:            this.form.value.cmp!,
      telefono:       this.form.value.telefono || '',
      especialidadId: this.form.value.especialidadId!
    };

    this.medicoService.actualizarMiPerfil(datos).subscribe({
      next: (perfilActualizado) => {
        this.perfil   = perfilActualizado;
        this.editando = false;
        this.guardando = false;
        this.snackBar.open('Perfil actualizado correctamente ✅', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.mensaje || 'Error al guardar', 'Cerrar', { duration: 3000 });
        this.guardando = false;
      }
    });
  }
}