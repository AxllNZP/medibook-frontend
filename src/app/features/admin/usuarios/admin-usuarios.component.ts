import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaz local para mostrar admins en la tabla.
// Solo necesitamos id, nombre, apellidos y email — que ya vienen en AuthResponse.
// ─────────────────────────────────────────────────────────────────────────────
interface AdminUsuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatTableModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatChipsModule, MatDividerModule
  ],
  template: `
    <div class="page-container">

      <!-- ── Encabezado ───────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h2>Administradores</h2>
          <p>Crea y gestiona las cuentas de administrador del sistema</p>
        </div>
        <button mat-raised-button color="primary" (click)="toggleFormulario()">
          <mat-icon>{{ mostrarFormulario ? 'close' : 'person_add' }}</mat-icon>
          {{ mostrarFormulario ? 'Cancelar' : 'Nuevo Administrador' }}
        </button>
      </div>

      <!-- ── Aviso informativo ─────────────────────────────── -->
      <div class="info-box">
        <mat-icon>info</mat-icon>
        <span>
          Los administradores tienen acceso total al sistema.
          Crea estas cuentas solo para personal de confianza.
        </span>
      </div>

      <!-- ── Formulario de creación ───────────────────────── -->
      @if (mostrarFormulario) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>admin_panel_settings</mat-icon>
            <mat-card-title>Nuevo Administrador</mat-card-title>
            <mat-card-subtitle>El nuevo admin podrá gestionar todo el sistema</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="crearAdmin()">

              <div class="form-grid">

                <mat-form-field appearance="outline">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="nombre">
                  <mat-icon matSuffix>person</mat-icon>
                  @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
                    <mat-error>El nombre es requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Apellidos</mat-label>
                  <input matInput formControlName="apellidos">
                  @if (form.get('apellidos')?.hasError('required') && form.get('apellidos')?.touched) {
                    <mat-error>Los apellidos son requeridos</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput formControlName="email" type="email">
                  <mat-icon matSuffix>email</mat-icon>
                  @if (form.get('email')?.hasError('email')) {
                    <mat-error>Ingresa un email válido</mat-error>
                  }
                  @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                    <mat-error>El email es requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Contraseña temporal</mat-label>
                  <input matInput formControlName="password"
                         [type]="ocultarPassword ? 'password' : 'text'">
                  <button mat-icon-button matSuffix type="button"
                          (click)="ocultarPassword = !ocultarPassword">
                    <mat-icon>{{ ocultarPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (form.get('password')?.hasError('minlength')) {
                    <mat-error>Mínimo 8 caracteres</mat-error>
                  }
                  <mat-hint>El admin podrá cambiarla después</mat-hint>
                </mat-form-field>

              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="toggleFormulario()">
                  Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="guardando">
                  @if (guardando) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <ng-container>
                      <mat-icon>admin_panel_settings</mat-icon>
                      Crear Administrador
                    </ng-container>
                  }
                </button>
              </div>

            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- ── Tabla de admins creados en esta sesión ────────── -->
      <!--
        NOTA IMPORTANTE: Esta tabla solo muestra los admins creados
        en la sesión actual. No existe un endpoint GET /admins en el backend.
        Si necesitas listar todos los admins persistidos, habría que crear
        ese endpoint en el backend como paso adicional.
      -->
      @if (adminsCreados.length > 0) {
        <mat-card class="tabla-card">
          <mat-card-header>
            <mat-card-title>Administradores creados en esta sesión</mat-card-title>
            <mat-card-subtitle>{{ adminsCreados.length }} admin(s) nuevo(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="adminsCreados" class="tabla">

              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let a">
                  <div class="admin-nombre">
                    <div class="avatar">{{ a.nombre.charAt(0) }}{{ a.apellidos.charAt(0) }}</div>
                    <span>{{ a.nombre }} {{ a.apellidos }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let a">
                  <div class="email-cell">
                    <mat-icon>email</mat-icon>
                    {{ a.email }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="rol">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let a">
                  <!-- mat-chip muestra una etiqueta visual tipo "badge" -->
                  <span class="rol-badge">
                    <mat-icon>shield</mat-icon> ADMIN
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnas"></tr>
              <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }

      <!-- ── Estado vacío (si no ha creado ninguno aún) ──────── -->
      @if (adminsCreados.length === 0 && !mostrarFormulario) {
        <div class="estado-vacio">
          <mat-icon>admin_panel_settings</mat-icon>
          <h3>No has creado nuevos administradores</h3>
          <p>Usa el botón superior para agregar un nuevo admin al sistema.</p>
        </div>
      }

    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; }

    /* ── Encabezado ─────────────────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .page-header h2 { margin: 0; color: #1565C0; font-size: 1.6rem; }
    .page-header p  { margin: 0.25rem 0 0; color: #666; font-size: 0.9rem; }

    /* ── Aviso informativo ──────────────── */
    .info-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fff3e0;
      color: #E65100;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .info-box mat-icon { flex-shrink: 0; }

    /* ── Formulario ─────────────────────── */
    .form-card { border-radius: 12px !important; margin-bottom: 1.5rem; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    /* ── Tabla ──────────────────────────── */
    .tabla-card { border-radius: 12px !important; overflow: hidden; }
    .tabla { width: 100%; }

    .admin-nombre {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #1565C0;
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: #555;
    }
    .email-cell mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .rol-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #e3f2fd;
      color: #1565C0;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .rol-badge mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }

    th.mat-header-cell { background: #f5f7fa; font-weight: 600; color: #333; }

    /* ── Estado vacío ───────────────────── */
    .estado-vacio {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .estado-vacio mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; margin-bottom: 1rem; }
    .estado-vacio h3 { margin: 0; color: #555; }
    .estado-vacio p  { margin: 0.5rem 0 0; }
  `]
})
export class AdminUsuariosComponent {
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);
  private snackBar    = inject(MatSnackBar);

  mostrarFormulario = false;
  guardando         = false;
  ocultarPassword   = true;

  // Lista local de admins creados en esta sesión para mostrarlos en tabla.
  // Se acumula con cada creación exitosa.
  adminsCreados: AdminUsuario[] = [];

  columnas = ['nombre', 'email', 'rol'];

  form = this.fb.group({
    nombre:    ['', Validators.required],
    apellidos: ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]]
  });

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    // Al cerrar el formulario lo limpiamos para que no queden datos anteriores
    if (!this.mostrarFormulario) {
      this.form.reset();
      this.ocultarPassword = true;
    }
  }

  crearAdmin() {
    // Marcamos todos los campos como "tocados" para que se muestren los errores
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    this.authService.crearAdmin(this.form.value as any).subscribe({
      next: (response) => {
        // Guardamos en la lista local para mostrar en tabla
        this.adminsCreados.push({
          id:        response.id,
          nombre:    response.nombre,
          apellidos: response.apellidos,
          email:     response.email
        });

        this.snackBar.open(
          `Administrador ${response.nombre} creado exitosamente`,
          'Cerrar',
          { duration: 4000, panelClass: ['snack-ok'] }
        );

        this.guardando = false;
        this.toggleFormulario(); // cierra y limpia el formulario
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.mensaje || 'Error al crear el administrador',
          'Cerrar',
          { duration: 4000, panelClass: ['snack-error'] }
        );
        this.guardando = false;
      }
    });
  }
}