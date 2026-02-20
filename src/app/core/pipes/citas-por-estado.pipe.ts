import { Pipe, PipeTransform } from '@angular/core';
import { CitaResponse, EstadoCita } from '../models/cita.model';

// Un Pipe transforma datos en el HTML sin modificar el componente
// {{ citas | citasPorEstado:'PENDIENTE' }} → número de citas pendientes
@Pipe({ name: 'citasPorEstado', standalone: true })
export class CitasPorEstadoPipe implements PipeTransform {
  transform(citas: CitaResponse[], estado: EstadoCita): number {
    return citas.filter(c => c.estado === estado).length;
  }
}