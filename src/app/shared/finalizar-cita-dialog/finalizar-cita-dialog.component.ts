import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

// ─────────────────────────────────────────────────────────────────────────────
// ¿Qué datos recibe este dialog al abrirse?
// Solo necesita el nombre del paciente para personalizar el título.
// ─────────────────────────────────────────────────────────────────────────────
export interface FinalizarCitaDialogData {
  pacienteNombre: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ¿Qué devuelve al cerrarse?
// null     → el médico canceló sin guardar nada
// { diagnostico, indicaciones } → el médico confirmó con datos
// ─────────────────────────────────────────────────────────────────────────────
export interface FinalizarCitaDialogResult {
  diagnostico: string;
  indicaciones: string;
}

@Component({
  selector: 'app-finalizar-cita-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="dialog-container">

      <!-- ── Ícono superior ──────────────────────────────────── -->
      <div class="dialog-icon">
        <mat-icon>assignment_turned_in</mat-icon>
      </div>

      <!-- ── Título ─────────────────────────────────────────── -->
      <h2 mat-dialog-title>Finalizar Cita</h2>
      <p class="subtitulo">Paciente: <strong>{{ data.pacienteNombre }}</strong></p>

      <!-- ── Formulario ─────────────────────────────────────── -->
      <mat-dialog-content>
        <form [formGroup]="form" class="form-contenido">

          <!-- Campo 1: Diagnóstico / Observaciones -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Diagnóstico / Observaciones</mat-label>
            <!--
              textarea en lugar de input porque el médico puede escribir
              varios párrafos de diagnóstico. cdkTextareaAutosize expande
              automáticamente según el contenido.
            -->
            <textarea
              matInput
              formControlName="diagnostico"
              rows="4"
              placeholder="Describe el diagnóstico y los medicamentos a recetar...">
            </textarea>
            <mat-icon matSuffix>medical_information</mat-icon>
            @if (form.get('diagnostico')?.hasError('required') && form.get('diagnostico')?.touched) {
              <mat-error>El diagnóstico es requerido para finalizar la cita</mat-error>
            }
          </mat-form-field>

          <!-- Campo 2: Indicaciones -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Indicaciones</mat-label>
            <textarea
              matInput
              formControlName="indicaciones"
              rows="4"
              placeholder="Ej: Tomar 1 pastilla cada 8 horas por 7 días, con alimentos...">
            </textarea>
            <mat-icon matSuffix>list_alt</mat-icon>
            @if (form.get('indicaciones')?.hasError('required') && form.get('indicaciones')?.touched) {
              <mat-error>Las indicaciones son requeridas</mat-error>
            }
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <!-- ── Botones de acción ────────────────────────────── -->
      <mat-dialog-actions>
        <button mat-stroked-button (click)="cancelar()">
          <mat-icon>close</mat-icon> Cancelar
        </button>
        <button mat-raised-button color="primary" (click)="confirmar()">
          <mat-icon>check_circle</mat-icon> Finalizar Cita
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0.5rem;
      max-width: 480px;
    }

    .dialog-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
    }

    .dialog-icon mat-icon {
      font-size: 2rem; width: 2rem; height: 2rem;
      color: #2E7D32;
    }

    h2[mat-dialog-title] {
      text-align: center;
      margin: 0 0 0.25rem;
      color: #333;
    }

    .subtitulo {
      text-align: center;
      color: #666;
      font-size: 0.9rem;
      margin: 0 0 1rem;
    }

    .form-contenido {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 0.5rem;
    }

    .full-width { width: 100%; }

    mat-dialog-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding-top: 1rem !important;
    }
  `]
})
export class FinalizarCitaDialogComponent {

  // El FormBuilder lo inyectamos aquí porque este componente
  // es standalone — no usa el constructor de la forma tradicional.
  form: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FinalizarCitaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FinalizarCitaDialogData
  ) {
    this.form = this.fb.group({
      diagnostico:  ['', Validators.required],
      indicaciones: ['', Validators.required]
    });
  }

  confirmar() {
    // Forzamos que se muestren todos los errores antes de validar
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Devolvemos el resultado al componente que abrió el dialog
    const result: FinalizarCitaDialogResult = {
      diagnostico:  this.form.value.diagnostico!,
      indicaciones: this.form.value.indicaciones!
    };

    this.dialogRef.close(result);
  }

  cancelar() {
    // close(null) indica que el usuario canceló sin guardar
    this.dialogRef.close(null);
  }
}