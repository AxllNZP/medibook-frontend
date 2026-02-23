import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CitaService } from '../../../core/services/cita.service';
import { MedicoService } from '../../../core/services/medico.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="home-container">

      <!-- Saludo -->
      <div class="bienvenida">
        <h2>Bienvenido, {{ usuario?.nombre }} 👋</h2>
        <p>Resumen general del sistema MediBook</p>
      </div>

      <!-- Tarjetas de estadísticas -->
      @if (cargando) {
        <div class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="stats-grid">

          <mat-card class="stat-card citas">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon"><mat-icon>calendar_month</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalCitas }}</p>
                  <p class="stat-label">Citas totales</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/citas">Ver citas</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card medicos">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon"><mat-icon>stethoscope</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalMedicos }}</p>
                  <p class="stat-label">Médicos registrados</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/medicos">Ver médicos</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pacientes">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon"><mat-icon>people</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalPacientes }}</p>
                  <p class="stat-label">Pacientes registrados</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/pacientes">Ver pacientes</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card especialidades">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon"><mat-icon>medical_services</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalEspecialidades }}</p>
                  <p class="stat-label">Especialidades</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/especialidades">Ver especialidades</button>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Resumen de citas por estado -->
        <div class="estados-grid">
          <div class="estado-card pendiente">
            <mat-icon>schedule</mat-icon>
            <p class="estado-num">{{ citasPendientes }}</p>
            <p class="estado-lbl">Pendientes</p>
          </div>
          <div class="estado-card confirmada">
            <mat-icon>check_circle</mat-icon>
            <p class="estado-num">{{ citasConfirmadas }}</p>
            <p class="estado-lbl">Confirmadas</p>
          </div>
          <div class="estado-card finalizada">
            <mat-icon>task_alt</mat-icon>
            <p class="estado-num">{{ citasFinalizadas }}</p>
            <p class="estado-lbl">Finalizadas</p>
          </div>
          <div class="estado-card cancelada">
            <mat-icon>cancel</mat-icon>
            <p class="estado-num">{{ citasCanceladas }}</p>
            <p class="estado-lbl">Canceladas</p>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .home-container { max-width: 1000px; margin: 0 auto; }

    .bienvenida { margin-bottom: 2rem; }
    .bienvenida h2 { margin: 0; color: #1565C0; font-size: 1.6rem; }
    .bienvenida p  { margin: 0.25rem 0 0; color: #666; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card { border-radius: 12px !important; }

    .stat-inner {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }

    .stat-numero { margin: 0; font-size: 2rem; font-weight: 700; color: #333; }
    .stat-label  { margin: 0; font-size: 0.85rem; color: #666; }

    .citas       .stat-icon { background: #e3f2fd; color: #1565C0; }
    .medicos     .stat-icon { background: #e8f5e9; color: #2E7D32; }
    .pacientes   .stat-icon { background: #f3e5f5; color: #6A1B9A; }
    .especialidades .stat-icon { background: #fff3e0; color: #E65100; }

    /* Estados */
    .estados-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
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

    .spinner-container { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class AdminHomeComponent implements OnInit {
  private citaService       = inject(CitaService);
  private medicoService     = inject(MedicoService);
  private pacienteService   = inject(PacienteService);
  private especialidadService = inject(EspecialidadService);
  private authService       = inject(AuthService);

  usuario = this.authService.getUsuario();

  totalCitas         = 0;
  totalMedicos       = 0;
  totalPacientes     = 0;
  totalEspecialidades = 0;

  citasPendientes  = 0;
  citasConfirmadas = 0;
  citasFinalizadas = 0;
  citasCanceladas  = 0;

  cargando = false;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;

    this.citaService.listarTodas().subscribe({
      next: (citas) => {
        this.totalCitas      = citas.length;
        this.citasPendientes  = citas.filter(c => c.estado === 'PENDIENTE').length;
        this.citasConfirmadas = citas.filter(c => c.estado === 'CONFIRMADA').length;
        this.citasFinalizadas = citas.filter(c => c.estado === 'FINALIZADA').length;
        this.citasCanceladas  = citas.filter(c => c.estado === 'CANCELADA').length;
      }
    });

    this.medicoService.listarTodos().subscribe({
      next: (data) => this.totalMedicos = data.length
    });

    this.pacienteService.listarTodos().subscribe({
      next: (data) => this.totalPacientes = data.length
    });

    this.especialidadService.listarTodas().subscribe({
      next: (data) => {
        this.totalEspecialidades = data.length;
        this.cargando = false;
      }
    });
  }
}