import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticasResponse } from '../models/estadisticas.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  obtener(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(this.url);
  }
}