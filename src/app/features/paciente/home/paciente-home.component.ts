import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaResponse } from '../../../core/models/cita.model';
import { EstadoBadgeComponent } from '../../../shared/estado-badge/estado-badge.component';

@Component({
  selector: 'app-paciente-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    EstadoBadgeComponent
  ],
  templateUrl: './paciente-home.component.html',
  styleUrls: ['./paciente-home.component.css']
})
export class PacienteHomeComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private authService = inject(AuthService);

  usuario = this.authService.getUsuario();
  citas: CitaResponse[] = [];
  proximaCita: CitaResponse | null = null;
  cargando = false;

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.pacienteService.misCitas().subscribe({
      next: (data) => {
        this.citas = data;

        const ahora = new Date();
        this.proximaCita =
          data
            .filter(
              (c) =>
                (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') &&
                new Date(c.fechaHora) > ahora
            )
            .sort(
              (a, b) =>
                new Date(a.fechaHora).getTime() -
                new Date(b.fechaHora).getTime()
            )[0] || null;

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  contar(estado: string): number {
    return this.citas.filter((c) => c.estado === estado).length;
  }
}