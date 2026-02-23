import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';
import { CitaService } from '../../../core/services/cita.service';
import { CitaResponse, EstadoCita } from '../../../core/models/cita.model';
import { EstadoBadgeComponent } from '../../../shared/estado-badge/estado-badge.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-paciente-mis-citas',
  standalone: true,
imports: [
  CommonModule, RouterLink,
  MatCardModule, MatButtonModule, MatIconModule,
  MatSnackBarModule, MatProgressSpinnerModule,
  MatDialogModule, EstadoBadgeComponent
],
  templateUrl: './paciente-mis-citas.component.html',
  styleUrl: './paciente-mis-citas.component.css'
})
export class PacienteMisCitasComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private citaService = inject(CitaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  citas: CitaResponse[] = [];
  cargando = false;

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.pacienteService.misCitas().subscribe({
      next: (data) => {
        // Ordenamos por fecha más reciente primero
        this.citas = data.sort((a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
        this.cargando = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar citas', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  // MEJORA DE DIALOGOS DE CONFIRMACION PARA CANCELAR
cancelar(id: number) {
  const ref = this.dialog.open(ConfirmDialogComponent, {
    data: {
      titulo: 'Cancelar Cita',
      mensaje: '¿Estás seguro de que deseas cancelar esta cita?',
      textoConfirmar: 'Sí, cancelar',
      tipo: 'warning'
    }
  });

  ref.afterClosed().subscribe(confirmado => {
    if (!confirmado) return;
    this.citaService.cancelarCita(id).subscribe({
      next: () => {
        this.snackBar.open('Cita cancelada', 'Cerrar', { duration: 3000 });
        this.cargarCitas();
      },
      error: (err) => this.snackBar.open(err.error?.mensaje || 'Error', 'Cerrar', { duration: 3000 })
    });
  });
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

  puedeCancelar(estado: EstadoCita): boolean {
    return estado === 'PENDIENTE' || estado === 'CONFIRMADA';
  }
}