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
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MedicoService } from '../../../core/services/medico.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { MedicoResponse } from '../../../core/models/medico.model';
import { EspecialidadResponse } from '../../../core/models/especialidad.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatCardModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatDividerModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css'
})
export class MedicosComponent implements OnInit {
  private medicoService       = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);
  private fb                  = inject(FormBuilder);
  private snackBar            = inject(MatSnackBar);
  private dialog              = inject(MatDialog);

  medicos: MedicoResponse[]            = [];
  especialidades: EspecialidadResponse[] = [];
  columnas = ['nombre', 'cmp', 'especialidad', 'telefono', 'email', 'acciones'];
  cargando          = false;
  mostrarFormulario = false;
  guardando         = false;
  ocultarPassword   = true;
  editandoId: number | null = null;  // null = crear, number = editar

  // Formulario de CREACIÓN (datos usuario + médico)
  formCrear = this.fb.group({
    nombre:         ['', Validators.required],
    apellidos:      ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    password:       ['', [Validators.required, Validators.minLength(8)]],
    cmp:            ['', Validators.required],
    telefono:       [''],
    especialidadId: [null as number | null, Validators.required]
  });

  // Formulario de EDICIÓN (solo datos médico, no usuario)
  formEditar = this.fb.group({
    cmp:            ['', Validators.required],
    telefono:       [''],
    especialidadId: [null as number | null, Validators.required]
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

  abrirFormularioCrear() {
    this.editandoId = null;
    this.formCrear.reset();
    this.ocultarPassword = true;
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(medico: MedicoResponse) {
    this.editandoId = medico.id;
    this.formEditar.patchValue({
      cmp:            medico.cmp,
      telefono:       medico.telefono || '',
      especialidadId: medico.especialidadId
    });
    this.mostrarFormulario = true;
  }

  guardar() {
    if (this.editandoId) {
      this.guardarEdicion();
    } else {
      this.guardarCreacion();
    }
  }

  private guardarCreacion() {
    if (this.formCrear.invalid) return;
    this.guardando = true;

    this.medicoService.crearCompleto(this.formCrear.value as any).subscribe({
      next: () => {
        this.mostrarMensaje('Médico registrado exitosamente', 'ok');
        this.cancelar();
        this.cargarMedicos();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al crear médico', 'error');
        this.guardando = false;
      }
    });
  }

  private guardarEdicion() {
    if (this.formEditar.invalid) return;
    this.guardando = true;

    const datos = {
      ...this.formEditar.value,
      usuarioId: this.medicos.find(m => m.id === this.editandoId)?.usuarioId
    };

    this.medicoService.actualizar(this.editandoId!, datos as any).subscribe({
      next: () => {
        this.mostrarMensaje('Médico actualizado correctamente', 'ok');
        this.cancelar();
        this.cargarMedicos();
        this.guardando = false;
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al actualizar', 'error');
        this.guardando = false;
      }
    });
  }

  eliminar(medico: MedicoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar Médico',
        mensaje: `¿Eliminar a Dr/Dra. ${medico.nombre} ${medico.apellidos}? Esta acción no se puede deshacer.`,
        textoConfirmar: 'Eliminar',
        tipo: 'danger'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.medicoService.eliminar(medico.id).subscribe({
        next: () => {
          this.mostrarMensaje('Médico eliminado', 'ok');
          this.cargarMedicos();
        },
        error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al eliminar', 'error')
      });
    });
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.formCrear.reset();
    this.formEditar.reset();
    this.ocultarPassword = true;
  }

  private mostrarMensaje(mensaje: string, tipo: 'ok' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'error' ? ['snack-error'] : ['snack-ok']
    });
  }
}