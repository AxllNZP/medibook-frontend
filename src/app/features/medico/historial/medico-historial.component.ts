import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MedicoService } from '../../../core/services/medico.service';
import { PacienteResponse } from '../../../core/models/paciente.model';
import { CitaResponse } from '../../../core/models/cita.model';

@Component({
  selector: 'app-medico-historial',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule,
    MatDividerModule, MatSnackBarModule, MatChipsModule
  ],
  template: `
    <div class="page-container">

      <!-- ── Encabezado ──────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h2>Historial Médico</h2>
          <p>Consulta el historial clínico de tus pacientes atendidos</p>
        </div>
        <div class="confidencial-badge">
          <mat-icon>lock</mat-icon>
          <span>Información confidencial</span>
        </div>
      </div>

      <!-- ── Layout de 2 paneles ─────────────────────────── -->
      <div class="layout-grid">

        <!-- ══ PANEL IZQUIERDO: Lista de pacientes ══════ -->
        <div class="panel-pacientes">
          <mat-card class="panel-card">
            <mat-card-header>
              <mat-card-title>Mis Pacientes</mat-card-title>
              <!--
                FIX NG0100: usamos la variable totalPacientes en lugar de
                pacientesFiltrados.length directamente en el template.
                El valor se asigna ANTES de que Angular haga su check,
                evitando el error de detección de cambios.
              -->
              <mat-card-subtitle>{{ totalPacientes }} paciente(s)</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>

              <!-- Buscador -->
              <div class="buscador">
                <mat-icon>search</mat-icon>
                <input
                  class="buscador-input"
                  placeholder="Buscar por nombre o email..."
                  [(ngModel)]="busqueda"
                  (ngModelChange)="filtrarPacientes()">
                @if (busqueda) {
                  <button class="btn-limpiar" (click)="limpiarBusqueda()">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>

              @if (cargandoPacientes) {
                <div class="spinner-center">
                  <mat-spinner diameter="30"></mat-spinner>
                </div>

              } @else if (pacientesFiltrados.length === 0 && !busqueda) {
                <div class="estado-vacio">
                  <mat-icon>people_outline</mat-icon>
                  <p>Aún no tienes pacientes con citas finalizadas</p>
                </div>

              } @else if (pacientesFiltrados.length === 0 && busqueda) {
                <div class="estado-vacio">
                  <mat-icon>search_off</mat-icon>
                  <p>Sin resultados para "{{ busqueda }}"</p>
                </div>

              } @else {
                <div class="pacientes-lista">
                  @for (p of pacientesFiltrados; track p.id) {
                    <div
                      class="paciente-item"
                      [class.activo]="pacienteSeleccionado?.id === p.id"
                      (click)="seleccionarPaciente(p)">
                      <div class="avatar">
                        {{ p.nombre.charAt(0) }}{{ p.apellidos.charAt(0) }}
                      </div>
                      <div class="paciente-info">
                        <p class="paciente-nombre">{{ p.nombre }} {{ p.apellidos }}</p>
                        <p class="paciente-email">{{ p.email }}</p>
                      </div>
                      @if (pacienteSeleccionado?.id === p.id) {
                        <mat-icon class="icono-seleccionado">chevron_right</mat-icon>
                      }
                    </div>
                  }
                </div>
              }

            </mat-card-content>
          </mat-card>
        </div>

        <!-- ══ PANEL DERECHO: Historial del paciente ════ -->
        <div class="panel-historial">

          @if (!pacienteSeleccionado) {
            <div class="instruccion">
              <mat-icon>arrow_back</mat-icon>
              <h3>Selecciona un paciente</h3>
              <p>Elige un paciente de la lista para ver su historial clínico</p>
            </div>

          } @else {

            <mat-card class="paciente-header-card">
              <mat-card-content>
                <div class="paciente-header">
                  <div class="avatar-grande">
                    {{ pacienteSeleccionado.nombre.charAt(0) }}{{ pacienteSeleccionado.apellidos.charAt(0) }}
                  </div>
                  <div class="paciente-header-info">
                    <h3>{{ pacienteSeleccionado.nombre }} {{ pacienteSeleccionado.apellidos }}</h3>
                    <div class="datos-fila">
                      <span class="dato-item">
                        <mat-icon>email</mat-icon>
                        {{ pacienteSeleccionado.email }}
                      </span>
                      @if (pacienteSeleccionado.telefono) {
                        <span class="dato-item">
                          <mat-icon>phone</mat-icon>
                          {{ pacienteSeleccionado.telefono }}
                        </span>
                      }
                      @if (pacienteSeleccionado.grupoSanguineo) {
                        <span class="grupo-badge">
                          {{ pacienteSeleccionado.grupoSanguineo }}
                        </span>
                      }
                      @if (pacienteSeleccionado.fechaNacimiento) {
                        <span class="dato-item">
                          <mat-icon>cake</mat-icon>
                          {{ pacienteSeleccionado.fechaNacimiento | date:'dd/MM/yyyy' }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="historial-titulo">
              <mat-icon>history</mat-icon>
              <span>Consultas finalizadas — {{ historial.length }} registro(s)</span>
            </div>

            @if (cargandoHistorial) {
              <div class="spinner-center">
                <mat-spinner diameter="36"></mat-spinner>
              </div>

            } @else if (historial.length === 0) {
              <div class="estado-vacio card-estilo">
                <mat-icon>event_busy</mat-icon>
                <p>No hay consultas finalizadas registradas con este paciente</p>
              </div>

            } @else {
              <div class="timeline">
                @for (cita of historial; track cita.id) {
                  <div class="timeline-item">
                    <div class="timeline-punto"></div>
                    <mat-card class="consulta-card">
                      <mat-card-content>

                        <div class="consulta-header">
                          <div class="consulta-fecha">
                            <mat-icon>calendar_today</mat-icon>
                            <strong>{{ cita.fechaHora | date:'EEEE dd/MM/yyyy':'':'es' }}</strong>
                            <span class="hora">{{ cita.fechaHora | date:'HH:mm' }}</span>
                          </div>
                          <span class="especialidad-badge">{{ cita.especialidad }}</span>
                        </div>

                        @if (cita.motivo) {
                          <div class="campo-consulta motivo-row">
                            <mat-icon>help_outline</mat-icon>
                            <div>
                              <p class="campo-label">Motivo de consulta</p>
                              <p class="campo-valor">{{ cita.motivo }}</p>
                            </div>
                          </div>
                          <mat-divider></mat-divider>
                        }

                        @if (cita.diagnostico) {
                          <div class="campo-consulta diagnostico-row">
                            <mat-icon>medical_information</mat-icon>
                            <div>
                              <p class="campo-label">Diagnóstico / Observaciones</p>
                              <p class="campo-valor diagnostico-texto">{{ cita.diagnostico }}</p>
                            </div>
                          </div>
                        }

                        @if (cita.indicaciones) {
                          <div class="campo-consulta indicaciones-row">
                            <mat-icon>list_alt</mat-icon>
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
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    .page-header h2 { margin: 0; color: #1B5E20; font-size: 1.6rem; }
    .page-header p  { margin: 0.25rem 0 0; color: #666; font-size: 0.9rem; }

    .confidencial-badge {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff3e0; color: #E65100;
      padding: 0.5rem 1rem; border-radius: 20px;
      font-size: 0.85rem; font-weight: 600;
    }
    .confidencial-badge mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .layout-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem; align-items: start;
    }

    .panel-card { border-radius: 12px !important; }

    .buscador {
      display: flex; align-items: center; gap: 0.5rem;
      border: 1px solid #ddd; border-radius: 8px;
      padding: 0.5rem 0.75rem; margin-bottom: 1rem; background: #fafafa;
    }
    .buscador mat-icon { color: #999; flex-shrink: 0; }
    .buscador-input { border: none; outline: none; background: transparent; font-size: 0.875rem; flex: 1; }
    .btn-limpiar { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #999; }
    .btn-limpiar mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .pacientes-lista { display: flex; flex-direction: column; gap: 0.25rem; }

    .paciente-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem; border-radius: 8px;
      cursor: pointer; transition: background 0.15s;
    }
    .paciente-item:hover { background: #f0f4f0; }
    .paciente-item.activo { background: #e8f5e9; border-left: 3px solid #2E7D32; }

    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #1B5E20; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    }

    .paciente-info { flex: 1; overflow: hidden; }
    .paciente-nombre { margin: 0; font-size: 0.875rem; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .paciente-email  { margin: 0; font-size: 0.78rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .icono-seleccionado { color: #2E7D32; font-size: 1.2rem; }

    .instruccion {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 5rem 2rem; color: #bbb;
      text-align: center; background: white; border-radius: 12px; border: 2px dashed #e0e0e0;
    }
    .instruccion mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 1rem; }
    .instruccion h3 { margin: 0; color: #888; }
    .instruccion p  { margin: 0.5rem 0 0; font-size: 0.9rem; }

    .paciente-header-card { border-radius: 12px !important; margin-bottom: 1rem; }
    .paciente-header { display: flex; align-items: center; gap: 1.25rem; }

    .avatar-grande {
      width: 60px; height: 60px; border-radius: 50%;
      background: #1B5E20; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 700; flex-shrink: 0;
    }

    .paciente-header-info h3 { margin: 0 0 0.4rem; }
    .datos-fila { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
    .dato-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: #666; }
    .dato-item mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #1B5E20; }

    .grupo-badge { background: #fce4ec; color: #c62828; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }

    .historial-titulo { display: flex; align-items: center; gap: 0.5rem; color: #1B5E20; font-weight: 600; margin-bottom: 1rem; font-size: 0.95rem; }
    .historial-titulo mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }

    .timeline { display: flex; flex-direction: column; padding-left: 1rem; border-left: 2px solid #c8e6c9; }
    .timeline-item { position: relative; padding-left: 1.5rem; padding-bottom: 1.5rem; }
    .timeline-punto { position: absolute; left: -0.55rem; top: 1rem; width: 12px; height: 12px; border-radius: 50%; background: #2E7D32; border: 2px solid white; box-shadow: 0 0 0 2px #2E7D32; }

    .consulta-card { border-radius: 12px !important; }
    .consulta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .consulta-fecha { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #333; }
    .consulta-fecha mat-icon { color: #1B5E20; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .hora { color: #888; }

    .especialidad-badge { background: #e8f5e9; color: #1B5E20; padding: 3px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }

    .campo-consulta { display: flex; gap: 0.75rem; padding: 0.75rem 0; }
    .campo-consulta mat-icon { flex-shrink: 0; margin-top: 2px; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    .campo-label { margin: 0 0 0.25rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #999; font-weight: 600; }
    .campo-valor { margin: 0; font-size: 0.9rem; color: #444; line-height: 1.5; white-space: pre-line; }

    .motivo-row mat-icon       { color: #666; }
    .diagnostico-row mat-icon  { color: #1565C0; }
    .indicaciones-row mat-icon { color: #2E7D32; }
    .diagnostico-texto  { color: #1565C0; }
    .indicaciones-texto { color: #2E7D32; }

    .spinner-center { display: flex; justify-content: center; padding: 2rem; }
    .estado-vacio { text-align: center; padding: 2rem; color: #bbb; }
    .estado-vacio.card-estilo { background: white; border-radius: 12px; border: 2px dashed #e0e0e0; }
    .estado-vacio mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; margin-bottom: 0.5rem; }
    .estado-vacio p { margin: 0; font-size: 0.9rem; }
  `]
})
export class MedicoHistorialComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private snackBar      = inject(MatSnackBar);

  // ─────────────────────────────────────────────────────────────────────────
  // FIX NG0100: ChangeDetectorRef le dice a Angular manualmente
  // "vuelve a revisar la vista ahora" después de recibir datos asíncronos.
  // Sin esto, Angular detecta que pacientesFiltrados.length cambió DESPUÉS
  // de que ya hizo su chequeo, y lanza el error NG0100.
  // ─────────────────────────────────────────────────────────────────────────
  private cdr = inject(ChangeDetectorRef);

  pacientes: PacienteResponse[]          = [];
  pacientesFiltrados: PacienteResponse[] = [];
  pacienteSeleccionado: PacienteResponse | null = null;
  historial: CitaResponse[] = [];

  // Variable separada para el subtitle — evita leer .length directamente
  // en el template durante el primer ciclo de detección de cambios
  totalPacientes = 0;

  busqueda          = '';
  cargandoPacientes = false;
  cargandoHistorial = false;

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.cargandoPacientes = true;
    this.medicoService.misPacientes().subscribe({
      next: (data) => {
        this.pacientes = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.pacientesFiltrados = [...this.pacientes];
        this.totalPacientes = this.pacientes.length;
        this.cargandoPacientes = false;
        // Le avisamos a Angular que hay datos nuevos listos para mostrar
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar pacientes', 'Cerrar', { duration: 3000 });
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPacientes() {
    const texto = this.busqueda.toLowerCase().trim();
    this.pacientesFiltrados = texto
      ? this.pacientes.filter(p =>
          `${p.nombre} ${p.apellidos}`.toLowerCase().includes(texto) ||
          p.email.toLowerCase().includes(texto)
        )
      : [...this.pacientes];
    this.totalPacientes = this.pacientesFiltrados.length;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.filtrarPacientes();
  }

  seleccionarPaciente(paciente: PacienteResponse) {
    if (this.pacienteSeleccionado?.id === paciente.id) return;

    this.pacienteSeleccionado = paciente;
    this.historial = [];
    this.cargandoHistorial = true;

    this.medicoService.historialPaciente(paciente.id).subscribe({
      next: (data) => {
        this.historial = data;
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }
}