import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PacienteService } from '../../../core/services/paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaResponse } from '../../../core/models/cita.model';

@Component({
  selector: 'app-paciente-historial',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">

      <!-- ── Encabezado ─────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h2>Mi Historial Clínico</h2>
          <p>Registro de todas tus consultas médicas finalizadas</p>
        </div>
        <div class="confidencial-badge">
          <mat-icon>lock</mat-icon>
          <span>Información confidencial</span>
        </div>
      </div>

      <!-- ── Spinner ────────────────────────────────────── -->
      @if (cargando) {
        <div class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

      <!-- ── Sin historial ──────────────────────────────── -->
      } @else if (historial.length === 0) {
        <div class="estado-vacio">
          <div class="vacio-icono">
            <mat-icon>folder_open</mat-icon>
          </div>
          <h3>Sin historial clínico</h3>
          <p>Aquí aparecerán tus consultas una vez que sean finalizadas por el médico</p>
        </div>

      <!-- ── Contenido ──────────────────────────────────── -->
      } @else {

        <!-- Resumen numérico -->
        <div class="resumen-strip">
          <div class="resumen-item">
            <mat-icon>assignment_turned_in</mat-icon>
            <span><strong>{{ historial.length }}</strong> consulta(s) registrada(s)</span>
          </div>
          <div class="resumen-item">
            <mat-icon>calendar_today</mat-icon>
            <span>Última: <strong>{{ historial[0].fechaHora | date:'dd/MM/yyyy' }}</strong></span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          @for (cita of historial; track cita.id) {
            <div class="timeline-item">

              <!-- Punto de la línea -->
              <div class="timeline-punto"></div>

              <!-- Tarjeta de consulta -->
              <mat-card class="consulta-card">
                <mat-card-content>

                  <!-- Cabecera de la tarjeta -->
                  <div class="consulta-header">
                    <div class="consulta-fecha">
                      <mat-icon>calendar_today</mat-icon>
                      <strong>{{ cita.fechaHora | date:'EEEE dd/MM/yyyy' }}</strong>
                      <span class="hora">{{ cita.fechaHora | date:'HH:mm' }}</span>
                    </div>
                    <span class="especialidad-badge">{{ cita.especialidad }}</span>
                  </div>

                  <!-- Médico -->
                  <div class="medico-row">
                    <mat-icon>account_circle</mat-icon>
                    <span>Dr/Dra. <strong>{{ cita.medicoNombre }}</strong></span>
                  </div>

                  <mat-divider style="margin: 0.75rem 0"></mat-divider>

                  <!-- Motivo -->
                  @if (cita.motivo) {
                    <div class="campo-consulta motivo-row">
                      <div class="campo-icono motivo-icono">
                        <mat-icon>help_outline</mat-icon>
                      </div>
                      <div>
                        <p class="campo-label">Motivo de consulta</p>
                        <p class="campo-valor">{{ cita.motivo }}</p>
                      </div>
                    </div>
                  }

                  <!-- Diagnóstico -->
                  @if (cita.diagnostico) {
                    <div class="campo-consulta diagnostico-row">
                      <div class="campo-icono diagnostico-icono">
                        <mat-icon>medical_information</mat-icon>
                      </div>
                      <div>
                        <p class="campo-label">Diagnóstico</p>
                        <p class="campo-valor diagnostico-texto">{{ cita.diagnostico }}</p>
                      </div>
                    </div>
                  }

                  <!-- Indicaciones -->
                  @if (cita.indicaciones) {
                    <div class="campo-consulta indicaciones-row">
                      <div class="campo-icono indicaciones-icono">
                        <mat-icon>list_alt</mat-icon>
                      </div>
                      <div>
                        <p class="campo-label">Indicaciones médicas</p>
                        <p class="campo-valor indicaciones-texto">{{ cita.indicaciones }}</p>
                      </div>
                    </div>
                  }

                </mat-card-content>
              </mat-card>

            </div>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────── */
    .page-container { max-width: 750px; margin: 0 auto; }

    /* ── Encabezado ─────────────────────────────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h2 { margin: 0; color: #1565C0; font-size: 1.6rem; }
    .page-header p  { margin: 0.25rem 0 0; color: #666; font-size: 0.9rem; }

    .confidencial-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #fff3e0;
      color: #E65100;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .confidencial-badge mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* ── Resumen strip ──────────────────────────────── */
    .resumen-strip {
      display: flex;
      gap: 2rem;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .resumen-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #555;
    }
    .resumen-item mat-icon { color: #1565C0; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }

    /* ── Timeline ───────────────────────────────────── */
    .timeline {
      display: flex;
      flex-direction: column;
      padding-left: 1.25rem;
      border-left: 2px solid #BBDEFB;
    }

    .timeline-item {
      position: relative;
      padding-left: 1.75rem;
      padding-bottom: 1.5rem;
    }

    .timeline-punto {
      position: absolute;
      left: -0.6rem;
      top: 1.1rem;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1565C0;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #1565C0;
    }

    /* ── Tarjeta de consulta ────────────────────────── */
    .consulta-card { border-radius: 12px !important; }

    .consulta-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .consulta-fecha {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #333;
    }
    .consulta-fecha mat-icon {
      color: #1565C0;
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }
    .hora { color: #888; font-size: 0.85rem; }

    .especialidad-badge {
      background: #e3f2fd;
      color: #1565C0;
      padding: 3px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* ── Fila del médico ────────────────────────────── */
    .medico-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 0.25rem;
    }
    .medico-row mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: #1565C0;
    }

    /* ── Campos clínicos ────────────────────────────── */
    .campo-consulta {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0;
    }

    .campo-icono {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .campo-icono mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .motivo-icono      { background: #f5f5f5; color: #666; }
    .motivo-icono mat-icon { color: #666; }

    .diagnostico-icono { background: #e3f2fd; }
    .diagnostico-icono mat-icon { color: #1565C0; }

    .indicaciones-icono { background: #e8f5e9; }
    .indicaciones-icono mat-icon { color: #2E7D32; }

    .campo-label {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      font-weight: 600;
    }

    .campo-valor {
      margin: 0;
      font-size: 0.9rem;
      color: #444;
      line-height: 1.6;
      white-space: pre-line;
    }

    .diagnostico-texto  { color: #1565C0; }
    .indicaciones-texto { color: #2E7D32; }

    /* ── Estado vacío ───────────────────────────────── */
    .estado-vacio {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .vacio-icono {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .vacio-icono mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #1565C0;
    }
    .estado-vacio h3 { margin: 0; color: #555; font-size: 1.2rem; }
    .estado-vacio p  { margin: 0.5rem 0 0; color: #999; font-size: 0.9rem; }

    /* ── Spinner ────────────────────────────────────── */
    .spinner-container { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class PacienteHistorialComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private authService     = inject(AuthService);
  private snackBar        = inject(MatSnackBar);

  historial: CitaResponse[] = [];
  cargando = false;

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargando = true;

    // Primero obtenemos el perfil del paciente para tener su ID
    this.pacienteService.miPerfil().subscribe({
      next: (perfil) => {
        // Con el ID del perfil llamamos al endpoint de historial
        this.pacienteService.historialCompleto(perfil.id).subscribe({
          next: (data) => {
            this.historial = data;
            this.cargando  = false;
          },
          error: () => {
            this.snackBar.open('Error al cargar el historial', 'Cerrar', { duration: 3000 });
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.snackBar.open('Completa tu perfil primero', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }
}