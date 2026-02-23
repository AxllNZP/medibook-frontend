import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-icon" [ngClass]="'icon-' + data.tipo">
        <mat-icon>{{ getIcono() }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.titulo }}</h2>

      <mat-dialog-content>
        <p>{{ data.mensaje }}</p>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button (click)="cancelar()">
          {{ data.textoCancelar || 'Cancelar' }}
        </button>
        <button mat-raised-button
                [color]="getColor()"
                (click)="confirmar()">
          {{ data.textoConfirmar || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 1rem;
      text-align: center;
      max-width: 360px;
    }

    .dialog-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .dialog-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .icon-danger  { background: #ffebee; color: #c62828; }
    .icon-warning { background: #fff3e0; color: #e65100; }
    .icon-info    { background: #e3f2fd; color: #1565c0; }

    h2 { margin: 0 0 0.5rem; font-size: 1.2rem; }

    mat-dialog-content p {
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding-top: 1.5rem !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    if (!data.tipo) this.data.tipo = 'danger';
  }

  getIcono(): string {
    const iconos = { danger: 'delete', warning: 'warning', info: 'info' };
    return iconos[this.data.tipo!];
  }

  getColor(): string {
    return this.data.tipo === 'danger' ? 'warn' : 'primary';
  }

  confirmar() { this.dialogRef.close(true); }
  cancelar()  { this.dialogRef.close(false); }
}