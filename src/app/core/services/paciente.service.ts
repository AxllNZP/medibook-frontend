import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse } from '../models/paciente.model';
import { CitaResponse } from '../models/cita.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteService {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pacientes`;

  crearPerfil(request: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(`${this.url}/perfil`, request);
  }

  miPerfil(): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.url}/mi-perfil`);
  }

  actualizarPerfil(request: PacienteRequest): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.url}/mi-perfil`, request);
  }

  misCitas(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.url}/mis-citas`);
  }

  listarTodos(): Observable<PacienteResponse[]> {
  return this.http.get<PacienteResponse[]>(this.url);
}

historialCompleto(pacienteId: number): Observable<CitaResponse[]> {
  return this.http.get<CitaResponse[]>(`${this.url}/${pacienteId}/historial`);
}
}