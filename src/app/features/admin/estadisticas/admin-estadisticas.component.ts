import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EstadisticasService } from '../../../core/services/estadisticas.service';
import { EstadisticasResponse } from '../../../core/models/estadisticas.model';

@Component({
  selector: 'app-admin-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-estadisticas.component.html',
  styleUrl: './admin-estadisticas.component.css'
})
export class AdminEstadisticasComponent implements OnInit {
  private estadisticasService = inject(EstadisticasService);

  datos: EstadisticasResponse | null = null;
  cargando = false;

  // Orden fijo para los días de la semana en español
  diasOrden = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  // Horas con actividad (solo las que tienen citas)
  horasConCitas: { hora: string; cantidad: number; porcentaje: number }[] = [];

  // Días con actividad
  diasConCitas: { dia: string; cantidad: number; porcentaje: number }[] = [];

  // Médicos con citas finalizadas
  medicosConCitas: { nombre: string; cantidad: number; porcentaje: number }[] = [];

  // Especialidades con citas finalizadas
  especialidadesConCitas: { nombre: string; cantidad: number; porcentaje: number }[] = [];

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;
    this.estadisticasService.obtener().subscribe({
      next: (data) => {
        this.datos = data;
        this.procesarHoras(data);
        this.procesarDias(data);
        this.cargando = false;
        this.procesarMedicos(data);
        this.procesarEspecialidades(data);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  // Convierte el mapa de horas en array ordenado con porcentajes
  private procesarHoras(data: EstadisticasResponse) {
    const entradas = Object.entries(data.citasPorHora)
      .map(([hora, cantidad]) => ({ hora: `${hora}:00`, cantidad }))
      .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));

    const maxHora = Math.max(...entradas.map(e => e.cantidad));

    this.horasConCitas = entradas.map(e => ({
      ...e,
      porcentaje: maxHora > 0 ? Math.round((e.cantidad / maxHora) * 100) : 0
    }));
  }

  // Convierte el mapa de días en array con el orden correcto
  private procesarDias(data: EstadisticasResponse) {
    const maxDia = Math.max(...Object.values(data.citasPorDiaSemana));

    this.diasConCitas = this.diasOrden
      .filter(dia => data.citasPorDiaSemana[dia] !== undefined)
      .map(dia => ({
        dia,
        cantidad: data.citasPorDiaSemana[dia],
        porcentaje: maxDia > 0
          ? Math.round((data.citasPorDiaSemana[dia] / maxDia) * 100)
          : 0
      }));
  }

private procesarMedicos(data: EstadisticasResponse) {
  const entradas = Object.entries(data.citasPorMedico)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const max = Math.max(...entradas.map(e => e.cantidad));

  this.medicosConCitas = entradas.map(e => ({
    ...e,
    porcentaje: max > 0 ? Math.round((e.cantidad / max) * 100) : 0
  }));
}

private procesarEspecialidades(data: EstadisticasResponse) {
  const entradas = Object.entries(data.citasPorEspecialidad)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const max = Math.max(...entradas.map(e => e.cantidad));

  this.especialidadesConCitas = entradas.map(e => ({
    ...e,
    porcentaje: max > 0 ? Math.round((e.cantidad / max) * 100) : 0
  }));
}

  // Color de la barra de no-show según el porcentaje
  colorNoShow(): string {
    if (!this.datos) return '#999';
    if (this.datos.porcentajeNoShow >= 20) return '#C62828';
    if (this.datos.porcentajeNoShow >= 10) return '#E65100';
    return '#2E7D32';
  }

  bgColorNoShow(): string {
    if (!this.datos) return '#f5f5f5';
    if (this.datos.porcentajeNoShow >= 20) return '#FFEBEE';
    if (this.datos.porcentajeNoShow >= 10) return '#FFF3E0';
    return '#E8F5E9';
  }
}