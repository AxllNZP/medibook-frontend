import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CitaService } from '../../../core/services/cita.service';
import { MedicoService } from '../../../core/services/medico.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { AuthService } from '../../../core/services/auth.service';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaz local para cada fila de estadística de estado
// Agrupa todo lo necesario para renderizar una fila: label, cantidad, color, etc.
// ─────────────────────────────────────────────────────────────────────────────
interface EstadoStat {
  label: string;
  cantidad: number;
  porcentaje: number;   // 0-100, calculado sobre el total de citas
  color: string;        // color de la barra de progreso
  icono: string;        // Material icon
  bgColor: string;      // color del fondo del icono
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatDividerModule
  ],
  template: `
    <div class="home-container">

      <!-- ── Saludo ─────────────────────────────────────────── -->
      <div class="bienvenida">
        <h2>Bienvenido, {{ usuario?.nombre }} 👋</h2>
        <p>Panel de estadísticas del sistema MediBook</p>
      </div>

      @if (cargando) {
        <div class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {

        <!-- ── Tarjetas de totales ─────────────────────────── -->
        <div class="stats-grid">

          <mat-card class="stat-card citas">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon citas-icon"><mat-icon>calendar_month</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalCitas }}</p>
                  <p class="stat-label">Citas totales</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/citas">Ver citas →</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card medicos">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon medicos-icon"><mat-icon>stethoscope</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalMedicos }}</p>
                  <p class="stat-label">Médicos registrados</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/medicos">Ver médicos →</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pacientes">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon pacientes-icon"><mat-icon>people</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalPacientes }}</p>
                  <p class="stat-label">Pacientes registrados</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/pacientes">Ver pacientes →</button>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card especialidades">
            <mat-card-content>
              <div class="stat-inner">
                <div class="stat-icon esp-icon"><mat-icon>medical_services</mat-icon></div>
                <div class="stat-info">
                  <p class="stat-numero">{{ totalEspecialidades }}</p>
                  <p class="stat-label">Especialidades</p>
                </div>
              </div>
              <button mat-stroked-button routerLink="/admin/especialidades">Ver especialidades →</button>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- ── Distribución de citas por estado ───────────── -->
        <div class="seccion-grid">

          <!-- Panel izquierdo: barras de progreso -->
          <mat-card class="distribucion-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>bar_chart</mat-icon>
              <mat-card-title>Distribución de Citas</mat-card-title>
              <mat-card-subtitle>{{ totalCitas }} citas en total</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>

              @if (totalCitas === 0) {
                <div class="sin-datos">
                  <mat-icon>event_busy</mat-icon>
                  <p>No hay citas registradas aún</p>
                </div>
              } @else {
                <div class="barras-lista">
                  @for (stat of estadoStats; track stat.label) {
                    <div class="barra-item">

                      <!-- Encabezado de la fila -->
                      <div class="barra-header">
                        <div class="barra-label">
                          <div class="barra-icono" [style.background]="stat.bgColor">
                            <mat-icon [style.color]="stat.color">{{ stat.icono }}</mat-icon>
                          </div>
                          <span>{{ stat.label }}</span>
                        </div>
                        <div class="barra-valores">
                          <!-- Cantidad y porcentaje a la derecha -->
                          <strong>{{ stat.cantidad }}</strong>
                          <span class="porcentaje-badge" [style.background]="stat.bgColor" [style.color]="stat.color">
                            {{ stat.porcentaje }}%
                          </span>
                        </div>
                      </div>

                      <!-- Barra de progreso de Angular Material -->
                      <!-- value esperado: 0-100. mode="determinate" = barra estática con valor fijo -->
                      <mat-progress-bar
                        mode="determinate"
                        [value]="stat.porcentaje"
                        [style.--mdc-linear-progress-active-indicator-color]="stat.color"
                        [style.--mdc-linear-progress-track-color]="stat.bgColor">
                      </mat-progress-bar>

                    </div>
                  }
                </div>
              }

            </mat-card-content>
          </mat-card>

          <!-- Panel derecho: tarjetas de estado individuales -->
          <div class="estados-col">
            @for (stat of estadoStats; track stat.label) {
              <div class="estado-mini-card" [style.border-left-color]="stat.color">
                <div class="estado-mini-icono" [style.background]="stat.bgColor">
                  <mat-icon [style.color]="stat.color">{{ stat.icono }}</mat-icon>
                </div>
                <div class="estado-mini-info">
                  <p class="estado-mini-num" [style.color]="stat.color">{{ stat.cantidad }}</p>
                  <p class="estado-mini-lbl">{{ stat.label }}</p>
                </div>
                <div class="estado-mini-pct">
                  <p [style.color]="stat.color">{{ stat.porcentaje }}%</p>
                </div>
              </div>
            }
          </div>

        </div>

      }
    </div>
  `,
  styles: [`
    .home-container { max-width: 1000px; margin: 0 auto; }

    /* ── Bienvenida ─────────────────────────── */
    .bienvenida { margin-bottom: 2rem; }
    .bienvenida h2 { margin: 0; color: #1565C0; font-size: 1.6rem; }
    .bienvenida p  { margin: 0.25rem 0 0; color: #666; }

    /* ── Grid de 4 tarjetas de totales ─────── */
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
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }

    /* Colores individuales por tipo */
    .citas-icon     { background: #e3f2fd; color: #1565C0; }
    .medicos-icon   { background: #e8f5e9; color: #2E7D32; }
    .pacientes-icon { background: #f3e5f5; color: #6A1B9A; }
    .esp-icon       { background: #fff3e0; color: #E65100; }

    .stat-numero { margin: 0; font-size: 2rem; font-weight: 700; color: #333; }
    .stat-label  { margin: 0; font-size: 0.85rem; color: #666; }

    /* ── Sección inferior: 2 columnas ────────── */
    .seccion-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
    }

    /* ── Card de barras ─────────────────────── */
    .distribucion-card { border-radius: 12px !important; }

    .barras-lista {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 0.5rem;
    }

    .barra-item { display: flex; flex-direction: column; gap: 0.5rem; }

    .barra-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .barra-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #444;
    }

    .barra-icono {
      width: 28px; height: 28px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .barra-icono mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .barra-valores {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .porcentaje-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    /* Forzamos el color de la barra usando CSS variable de MDC */
    mat-progress-bar {
      height: 8px !important;
      border-radius: 4px;
    }

    .sin-datos {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
    .sin-datos mat-icon { font-size: 3rem; width: 3rem; height: 3rem; }

    /* ── Mini tarjetas de estado ─────────────── */
    .estados-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .estado-mini-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      background: white;
      border-left: 4px solid;
      box-shadow: 0 1px 6px rgba(0,0,0,0.08);
    }

    .estado-mini-icono {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .estado-mini-icono mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }

    .estado-mini-info { flex: 1; }
    .estado-mini-num {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .estado-mini-lbl { margin: 0.2rem 0 0; font-size: 0.8rem; color: #666; }

    .estado-mini-pct p { margin: 0; font-weight: 600; font-size: 0.9rem; }

    .spinner-container { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class AdminHomeComponent implements OnInit {
  private citaService         = inject(CitaService);
  private medicoService       = inject(MedicoService);
  private pacienteService     = inject(PacienteService);
  private especialidadService = inject(EspecialidadService);
  private authService         = inject(AuthService);

  usuario = this.authService.getUsuario();

  totalCitas          = 0;
  totalMedicos        = 0;
  totalPacientes      = 0;
  totalEspecialidades = 0;

  // Array que alimenta las barras de progreso y mini-tarjetas.
  // Se construye en calcularEstadoStats() una vez que llegan las citas.
  estadoStats: EstadoStat[] = [];

  cargando = false;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;

    // ── Citas: necesitamos los conteos por estado ──
    this.citaService.listarTodas().subscribe({
      next: (citas) => {
        this.totalCitas = citas.length;

        const pendientes  = citas.filter(c => c.estado === 'PENDIENTE').length;
        const confirmadas = citas.filter(c => c.estado === 'CONFIRMADA').length;
        const finalizadas = citas.filter(c => c.estado === 'FINALIZADA').length;
        const canceladas  = citas.filter(c => c.estado === 'CANCELADA').length;

        // Calculamos porcentaje de cada estado respecto al total.
        // Si totalCitas === 0 devolvemos 0 para no dividir por cero.
        this.estadoStats = this.calcularEstadoStats(
          pendientes, confirmadas, finalizadas, canceladas
        );
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
        this.cargando = false;  // apagamos el spinner cuando el último request termina
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Construye el array de EstadoStat con porcentajes redondeados al entero.
  // Math.round() para no mostrar decimales (ej: 33% en vez de 33.33%)
  // ─────────────────────────────────────────────────────────────────────────
  private calcularEstadoStats(
    pendientes: number,
    confirmadas: number,
    finalizadas: number,
    canceladas: number
  ): EstadoStat[] {
    const total = this.totalCitas;
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

    return [
      {
        label: 'Pendientes',
        cantidad: pendientes,
        porcentaje: pct(pendientes),
        color: '#E65100',
        bgColor: '#FFF3E0',
        icono: 'schedule'
      },
      {
        label: 'Confirmadas',
        cantidad: confirmadas,
        porcentaje: pct(confirmadas),
        color: '#2E7D32',
        bgColor: '#E8F5E9',
        icono: 'check_circle'
      },
      {
        label: 'Finalizadas',
        cantidad: finalizadas,
        porcentaje: pct(finalizadas),
        color: '#1565C0',
        bgColor: '#E3F2FD',
        icono: 'task_alt'
      },
      {
        label: 'Canceladas',
        cantidad: canceladas,
        porcentaje: pct(canceladas),
        color: '#C62828',
        bgColor: '#FFEBEE',
        icono: 'cancel'
      }
    ];
  }
}