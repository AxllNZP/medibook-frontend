// Replica exactamente el AuthResponse.java del backend
export interface AuthResponse {
  token: string;
  tipo: string;
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
}