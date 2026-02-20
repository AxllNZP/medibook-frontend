export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

export interface CitaResponse {
  id: number;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  pacienteId: number;
  pacienteNombre: string;
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
}

export interface CitaRequest {
  fechaHora: string;
  motivo: string;
  medicoId: number;
}