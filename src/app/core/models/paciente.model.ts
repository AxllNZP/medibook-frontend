export interface PacienteResponse {
  id: number;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  grupoSanguineo: string;
  usuarioId: number;
  nombre: string;
  apellidos: string;
  email: string;
}

export interface PacienteRequest {
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  grupoSanguineo: string;
}