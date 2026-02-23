import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoCita } from '../../core/models/cita.model';

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="estado-badge" [ngClass]="colorEstado()">
      {{ estado }}
    </span>
  `,
  styles: [`
    .estado-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .estado-pendiente  { background: #FFF3E0; color: #E65100; }
    .estado-confirmada { background: #E8F5E9; color: #2E7D32; }
    .estado-cancelada  { background: #FFEBEE; color: #C62828; }
    .estado-finalizada { background: #E3F2FD; color: #1565C0; }
  `]
})
export class EstadoBadgeComponent {
  @Input() estado!: EstadoCita;

  colorEstado(): string {
    const colores: Record<EstadoCita, string> = {
      PENDIENTE:  'estado-pendiente',
      CONFIRMADA: 'estado-confirmada',
      CANCELADA:  'estado-cancelada',
      FINALIZADA: 'estado-finalizada'
    };
    return colores[this.estado];
  }
}