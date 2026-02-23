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
    CommonModule, RouterLink,
    MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule,
    EstadoBadgeComponent
  ],
  template: `
    <div class="home-container">

      <!-- Saludo -->
      <div class="bienvenida">
        <h2>Hola, {{ usuario?.nombre }} 👋</h2>
        <p>Este es el resumen de tus citas médicas</p>
      </div>

      @if (cargando) {
        <div class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {

        <!-- Tarjetas resumen -->
        <div class="stats-grid">
          <div class="estado-card pendiente">
            <mat-icon>schedule</mat-icon>
            <p class="estado-num">{{ contar('PENDIENTE') }}</p>
            <p class="estado-lbl">Pendientes</p>
          </div>
          <div class="estado-card confirmada">
            <mat-icon>check_circle</mat-icon>
            <p class="estado-num">{{ contar('CONFIRMADA') }}</p>
            <p class="estado-lbl">Confirmadas</p>
          </div>
          <div class="estado-card finalizada">
            <mat-icon>task_alt</mat-icon>
            <p class="estado-num">{{ contar('FINALIZADA') }}</p>
            <p class="estado-lbl">Finalizadas</p>
          </div>
          <div class="estado-card cancelada">
            <mat-icon>cancel</mat-icon>
            <p class="estado-num">{{ contar('CANCELADA') }}</p>
            <p class="estado-lbl">Canceladas</p>
          </div>
        </div>

        <!-- Próxima cita -->
        <mat-card class="proxima-card">
          <mat-card-header>
            <mat-card-title>Próxima Cita</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (proximaCita) {
              <div class="proxima-info">
                <div class="proxima-fecha">
                  <mat-icon>calendar_today</mat-icon>
                  <span>{{ proximaCita.fechaHora | date:'EEEE dd/MM/yyyy HH:mm':'':'es' }}</span>
                </div>
                <div class="proxima-detalle">
                  <div class="info-row">
                    <mat-icon>person</mat-icon>
                    <span>Dr/Dra. {{ proximaCita.medicoNombre }}</span>
                  </div>
                  <div class="info-row">
                    <mat-icon>medical_services</mat-icon>
                    <span>{{ proximaCita.especialidad }}</span>
                  </div>
                  @if (proximaCita.motivo) {
                    <div class="info-row">
                      <mat-icon>notes</mat-icon>
                      <span>{{ proximaCita.motivo }}</span>
                    </div>
                  }
                </div>
                <app-estado-badge [estado]="proximaCita.estado" />
              </div>
            } @else {
              <div class="sin-cita">
                <mat-icon>event_busy</mat-icon>
                <p>No tienes citas próximas</p>
                <button mat-raised-button color="primary" routerLink="/paciente/nueva-cita">
                  <mat-icon>add</mat-icon> Agendar ahora
                </button>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Acceso rápido -->
        <div class="accesos-grid">
          <mat-card class="acceso-card" routerLink="/paciente/nueva-cita">
            <mat-card-content>
              <mat-icon>add_circle</mat-icon>
              <p>Nueva Cita</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="acceso-card" routerLink="/paciente/mis-citas">
            <mat-card-content>
              <mat-icon>calendar_month</mat-icon>
              <p>Mis Citas</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="acceso-card" routerLink="/paciente/perfil">
            <mat-card-content>
              <mat-icon>account_circle</mat-icon>
              <p>Mi Perfil</p>
            </mat-card-content>
          </mat-card>
        </div>

      }
    </div>
  `,
  styles: [`
    .home-container { max-width: 900px; margin: 0 auto; }

    .bienvenida { margin-bottom: 2rem; }
    .bienvenida h2 { margin: 0; color: #1565C0; font-size: 1.6rem; }
    .bienvenida p  { margin: 0.25rem 0 0; color: #666; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .estado-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      border-radius: 12px;
      color: white;
      gap: 0.25rem;
    }

    .estado-card mat-icon { font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    .estado-num { margin: 0; font-size: 1.8rem; font-weight: 700; }
    .estado-lbl { margin: 0; font-size: 0.85rem; opacity: 0.9; }

    .pendiente  { background: #F57C00; }
    .confirmada { background: #2E7D32; }
    .finalizada { background: #1565C0; }
    .cancelada  { background: #C62828; }

    .proxima-card {
      border-radius: 12px !important;
      margin-bottom: 1.5rem;
    }

    .proxima-info { display: flex; flex-direction: column; gap: 1rem; padding-top: 0.5rem; }

    .proxima-fecha {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1565C0;
    }

    .proxima-detalle { display: flex; flex-direction: column; gap: 0.4rem; }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #555;
    }

    .info-row mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #1565C0;
    }

    .sin-cita {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .sin-cita mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 0.5rem; }
    .sin-cita p { margin-bottom: 1rem; }

    .accesos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .acceso-card {
      border-radius: 12px !important;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .acceso-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; }

    .acceso-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem !important;
    }

    .acceso-card mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #1565C0;
    }

    .acceso-card p { margin: 0; font-weight: 500; color: #333; }

    .spinner-container { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class PacienteHomeComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private authService     = inject(AuthService);

  usuario    = this.authService.getUsuario();
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
        // Próxima cita = la más cercana con estado PENDIENTE o CONFIRMADA
        const ahora = new Date();
        this.proximaCita = data
          .filter(c =>
            (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') &&
            new Date(c.fechaHora) > ahora
          )
          .sort((a, b) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          )[0] || null;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  contar(estado: string): number {
    return this.citas.filter(c => c.estado === estado).length;
  }
}