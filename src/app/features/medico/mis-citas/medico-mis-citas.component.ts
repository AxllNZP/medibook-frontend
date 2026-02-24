import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../../core/services/medico.service';
import { CitaService } from '../../../core/services/cita.service';
import { CitaResponse, EstadoCita } from '../../../core/models/cita.model';
import { CitasPorEstadoPipe } from '../../../core/pipes/citas-por-estado.pipe';
import { EstadoBadgeComponent } from '../../../shared/estado-badge/estado-badge.component';
import {
  FinalizarCitaDialogComponent,
  FinalizarCitaDialogResult
} from '../../../shared/finalizar-cita-dialog/finalizar-cita-dialog.component';

@Component({
  selector: 'app-medico-mis-citas',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatDialogModule,
    CitasPorEstadoPipe, EstadoBadgeComponent
  ],
  templateUrl: './medico-mis-citas.component.html',
  styleUrl: './medico-mis-citas.component.css'
})
export class MedicoMisCitasComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private citaService   = inject(CitaService);
  private snackBar      = inject(MatSnackBar);
  private dialog        = inject(MatDialog);   // ← necesario para abrir el dialog

  citas: CitaResponse[]         = [];
  citasFiltradas: CitaResponse[] = [];
  cargando      = false;
  filtroEstado  = 'TODOS';

  estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'];

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.medicoService.misCitas().subscribe({
      next: (data) => {
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

  // ─────────────────────────────────────────────────────────────────────────
  // PUNTO CLAVE: Interceptamos el click antes de llamar al backend.
  // Si el médico quiere FINALIZAR → abrimos el dialog con los 2 campos.
  // Si quiere CONFIRMAR o CANCELAR → seguimos el flujo normal.
  // ─────────────────────────────────────────────────────────────────────────
  cambiarEstado(cita: CitaResponse, nuevoEstado: EstadoCita) {
    if (nuevoEstado === 'FINALIZADA') {
      this.abrirDialogFinalizar(cita);
    } else {
      this.actualizarEstadoDirecto(cita, nuevoEstado);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Abre el dialog, espera a que el médico llene los datos y confirme.
  // afterClosed() emite el resultado cuando el dialog se cierra:
  //   - null     → médico canceló, no hacemos nada
  //   - resultado → médico confirmó, llamamos al endpoint /finalizar
  // ─────────────────────────────────────────────────────────────────────────
  private abrirDialogFinalizar(cita: CitaResponse) {
    const ref = this.dialog.open(FinalizarCitaDialogComponent, {
      width: '520px',
      disableClose: true,   // obliga al médico a usar los botones del dialog
      data: { pacienteNombre: cita.pacienteNombre }
    });

    ref.afterClosed().subscribe((resultado: FinalizarCitaDialogResult | null) => {
      // Si el médico canceló el dialog, no hacemos nada
      if (!resultado) return;

      // Llamamos al endpoint especializado que guarda estado + diagnóstico + indicaciones
      this.citaService.finalizarCita(cita.id, resultado).subscribe({
        next: () => {
          this.snackBar.open('Cita finalizada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['snack-ok']
          });
          this.cargarCitas();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.mensaje || 'Error al finalizar la cita',
            'Cerrar',
            { duration: 3000, panelClass: ['snack-error'] }
          );
        }
      });
    });
  }

  // Para CONFIRMADA y CANCELADA seguimos usando el endpoint original
  private actualizarEstadoDirecto(cita: CitaResponse, nuevoEstado: EstadoCita) {
    this.citaService.actualizarEstado(cita.id, nuevoEstado).subscribe({
      next: () => {
        this.snackBar.open(`Cita marcada como ${nuevoEstado}`, 'Cerrar', {
          duration: 3000
        });
        this.cargarCitas();
      },
      error: (err) => this.snackBar.open(
        err.error?.mensaje || 'Error', 'Cerrar', { duration: 3000 }
      )
    });
  }

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