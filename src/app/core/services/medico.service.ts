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
}