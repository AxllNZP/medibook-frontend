import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../../core/services/medico.service';
import { CitaService } from '../../../core/services/cita.service';
import { CitaResponse, EstadoCita } from '../../../core/models/cita.model';
import { CitasPorEstadoPipe } from '../../../core/pipes/citas-por-estado.pipe';

@Component({
  selector: 'app-medico-mis-citas',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    CitasPorEstadoPipe
  ],
  templateUrl: './medico-mis-citas.component.html',
  styleUrl: './medico-mis-citas.component.css'
})
export class MedicoMisCitasComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private citaService = inject(CitaService);
  private snackBar = inject(MatSnackBar);

  citas: CitaResponse[] = [];
  citasFiltradas: CitaResponse[] = [];
  cargando = false;
  filtroEstado = 'TODOS';

  estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'];

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.medicoService.misCitas().subscribe({
      next: (data) => {
        // Más reciente primero
        this.citas = data.sort((a, b) =>
          new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
        );
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar citas', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open(`Cita marcada como ${nuevoEstado}`, 'Cerrar', { duration: 3000 });
        this.cargarCitas();
      },
      error: (err) => this.snackBar.open(err.error?.mensaje || 'Error', 'Cerrar', { duration: 3000 })
    });
  }

  // El médico solo puede: CONFIRMAR o CANCELAR pendientes, FINALIZAR o CANCELAR confirmadas
  estadosDisponibles(estado: EstadoCita): EstadoCita[] {
    const transiciones: Record<EstadoCita, EstadoCita[]> = {
      PENDIENTE:  ['CONFIRMADA', 'CANCELADA'],
      CONFIRMADA: ['FINALIZADA', 'CANCELADA'],
      CANCELADA:  [],
      FINALIZADA: []
    };
    return transiciones[estado];
  }

  colorEstado(estado: EstadoCita): string {
    const colores: Record<EstadoCita, string> = {
      PENDIENTE:  'estado-pendiente',
      CONFIRMADA: 'estado-confirmada',
      CANCELADA:  'estado-cancelada',
      FINALIZADA: 'estado-finalizada'
    };
    return colores[estado];
  }
}