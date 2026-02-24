import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaRequest, CitaResponse, FinalizarCitaRequest } from '../models/cita.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitaService {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/citas`;

  crearCita(request: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.url, request);
  }

  listarTodas(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(this.url);
  }

  actualizarEstado(id: number, estado: string): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.url}/${id}/estado`, { estado });
  }

  cancelarCita(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/cancelar`, {});
  }

finalizarCita(id: number, request: FinalizarCitaRequest): Observable<CitaResponse> {
  return this.http.patch<CitaResponse>(`${this.url}/${id}/finalizar`, request);
}
}