export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

export interface CitaResponse {
  id: number;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  diagnostico: string | null;    // ← DIAGNOSTICO
  indicaciones: string | null;   // ← INDICACIONES
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

export interface FinalizarCitaRequest {
  diagnostico: string;
  indicaciones: string;
}