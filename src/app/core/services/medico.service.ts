import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoResponse } from '../models/medico.model';
import { CitaResponse } from '../models/cita.model';
import { environment } from '../../../environments/environment';
import { MedicoRequest } from '../models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/medicos`;

  listarTodos(especialidad?: string): Observable<MedicoResponse[]> {
    const params = especialidad ? `?especialidad=${especialidad}` : '';
    return this.http.get<MedicoResponse[]>(`${this.url}${params}`);
  }

  obtenerPorId(id: number): Observable<MedicoResponse> {
    return this.http.get<MedicoResponse>(`${this.url}/${id}`);
  }

  misCitas(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.url}/mis-citas`);
  }

  crear(request: MedicoRequest): Observable<MedicoResponse> {
  return this.http.post<MedicoResponse>(this.url, request);
}
crearCompleto(request: {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  cmp: string;
  telefono: string;
  especialidadId: number;
}): Observable<MedicoResponse> {
  return this.http.post<MedicoResponse>(`${this.url}/crear-completo`, request);
}

actualizar(id: number, request: MedicoRequest): Observable<MedicoResponse> {
  return this.http.put<MedicoResponse>(`${this.url}/${id}`, request);
}

eliminar(id: number): Observable<void> {
  return this.http.delete<void>(`${this.url}/${id}`);
}
}