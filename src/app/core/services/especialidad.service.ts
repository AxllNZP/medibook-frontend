import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadResponse } from '../models/especialidad.model';
import { environment } from '../../../environments/environment';

export interface EspecialidadRequest {
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/especialidades`;

  listarTodas(): Observable<EspecialidadResponse[]> {
    return this.http.get<EspecialidadResponse[]>(this.url);
  }

  crear(request: EspecialidadRequest): Observable<EspecialidadResponse> {
    return this.http.post<EspecialidadResponse>(this.url, request);
  }

  actualizar(id: number, request: EspecialidadRequest): Observable<EspecialidadResponse> {
    return this.http.put<EspecialidadResponse>(`${this.url}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}