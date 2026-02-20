import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicoService } from '../../../core/services/medico.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicoResponse } from '../../../core/models/medico.model';

@Component({
  selector: 'app-medico-perfil',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './medico-perfil.component.html',
  styleUrl: './medico-perfil.component.css'
})
export class MedicoPerfilComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private authService = inject(AuthService);

  perfil: MedicoResponse | null = null;
  cargando = false;
  usuario = this.authService.getUsuario();

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    // Buscamos al médico por el usuarioId del token
    this.medicoService.listarTodos().subscribe({
      next: (medicos) => {
        // Filtramos el médico cuyo usuarioId coincide con el usuario logueado
        this.perfil = medicos.find(m => m.usuarioId === this.usuario?.id) || null;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }
}