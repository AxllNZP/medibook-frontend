import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { EspecialidadResponse } from '../../../core/models/especialidad.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [
  CommonModule, ReactiveFormsModule,
  MatTableModule, MatButtonModule, MatIconModule,
  MatInputModule, MatCardModule, MatDialogModule,
  MatSnackBarModule, MatProgressSpinnerModule,
  MatTooltipModule
],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.css'
})
export class EspecialidadesComponent implements OnInit {
  private especialidadService = inject(EspecialidadService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  especialidades: EspecialidadResponse[] = [];
  columnas = ['nombre', 'descripcion', 'acciones'];
  cargando = false;

  // Controla si el formulario está visible y si es edición o creación
  mostrarFormulario = false;
  editandoId: number | null = null;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit() {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.cargando = true;
    this.especialidadService.listarTodas().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar especialidades', 'error');
        this.cargando = false;
      }
    });
  }

  abrirFormularioCrear() {
    this.editandoId = null;
    this.form.reset();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(esp: EspecialidadResponse) {
    this.editandoId = esp.id;
    this.form.patchValue({ nombre: esp.nombre, descripcion: esp.descripcion });
    this.mostrarFormulario = true;
  }

  guardar() {
    if (this.form.invalid) return;
    const datos = this.form.value as any;

    const operacion = this.editandoId
      ? this.especialidadService.actualizar(this.editandoId, datos)
      : this.especialidadService.crear(datos);

    operacion.subscribe({
      next: () => {
        this.mostrarMensaje(
          this.editandoId ? 'Especialidad actualizada' : 'Especialidad creada', 'ok'
        );
        this.mostrarFormulario = false;
        this.cargarEspecialidades();
      },
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al guardar', 'error')
    });
  }

  // MEJORA DE DIALOGOS DE CONFIRMACION PARA ELIMINAR
eliminar(id: number) {
  const ref = this.dialog.open(ConfirmDialogComponent, {
    data: {
      titulo: 'Eliminar Especialidad',
      mensaje: '¿Estás seguro? Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      tipo: 'danger'
    }
  });

  ref.afterClosed().subscribe(confirmado => {
    if (!confirmado) return;
    this.especialidadService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('Especialidad eliminada', 'ok');
        this.cargarEspecialidades();
      },
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al eliminar', 'error')
    });
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