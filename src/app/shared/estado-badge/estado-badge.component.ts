// src/app/shared/estado-badge/estado-badge.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoCita } from '../../core/models/cita.model';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estado-badge.component.html',
  styleUrls: ['./estado-badge.component.css']
})
export class EstadoBadgeComponent {
  @Input({ required: true }) estado!: EstadoCita;

  colorEstado(): string {
    const colores: Record<EstadoCita, string> = {
      PENDIENTE: 'estado-pendiente',
      CONFIRMADA: 'estado-confirmada',
      CANCELADA: 'estado-cancelada',
      FINALIZADA: 'estado-finalizada'
    };

    return colores[this.estado];
  }
}