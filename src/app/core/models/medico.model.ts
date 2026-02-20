export interface MedicoResponse {
  id: number;
  cmp: string;
  telefono: string;
  usuarioId: number;
  nombre: string;
  apellidos: string;
  email: string;
  especialidadId: number;
  especialidadNombre: string;
}

// Agrega al final del archivo
export interface MedicoRequest {
  cmp: string;
  telefono: string;
  especialidadId: number;
  usuarioId: number;
}