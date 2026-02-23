import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { CitaResponse, EstadoCita } from '../../core/models/cita.model';
import { CitasPorEstadoPipe } from '../../core/pipes/citas-por-estado.pipe';
import { EstadoBadgeComponent } from '../../shared/estado-badge/estado-badge.component';


@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatChipsModule,
    CitasPorEstadoPipe,EstadoBadgeComponent
],
  templateUrl: './admin-citas.component.html',
  styleUrl: './admin-citas.component.css'
})
export class AdminCitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private snackBar = inject(MatSnackBar);

  citas: CitaResponse[] = [];
  citasFiltradas: CitaResponse[] = [];
  columnas = ['fechaHora', 'paciente', 'medico', 'especialidad', 'estado', 'acciones'];
  cargando = false;
  filtroEstado = 'TODOS';

  estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'];

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.citaService.listarTodas().subscribe({
      next: (data) => {
        this.citas = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar citas', 'error');
        this.cargando = false;
      }
    });
  }

  aplicarFiltro() {
    this.citasFiltradas = this.filtroEstado === 'TODOS'
      ? this.citas
      : this.citas.filter(c => c.estado === this.filtroEstado);
  }

  cambiarEstado(cita: CitaResponse, nuevoEstado: EstadoCita) {
    this.citaService.actualizarEstado(cita.id, nuevoEstado).subscribe({
      next: () => {
        this.mostrarMensaje('Estado actualizado', 'ok');
        this.cargarCitas();
      },
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al actualizar', 'error')
    });
  }

  // Devuelve el color del chip según el estado
  colorEstado(estado: EstadoCita): string {
    const colores: Record<EstadoCita, string> = {
      PENDIENTE:  'estado-pendiente',
      CONFIRMADA: 'estado-confirmada',
      CANCELADA:  'estado-cancelada',
      FINALIZADA: 'estado-finalizada'
    };
    return colores[estado];
  }

  // Estados a los que se puede transicionar desde el estado actual
  estadosDisponibles(estadoActual: EstadoCita): EstadoCita[] {
    const transiciones: Record<EstadoCita, EstadoCita[]> = {
      PENDIENTE:  ['CONFIRMADA', 'CANCELADA'],
      CONFIRMADA: ['FINALIZADA', 'CANCELADA'],
      CANCELADA:  [],
      FINALIZADA: []
    };
    return transiciones[estadoActual];
  }

  private mostrarMensaje(mensaje: string, tipo: 'ok' | 'error') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'error' ? ['snack-error'] : ['snack-ok']
    });
  }
}