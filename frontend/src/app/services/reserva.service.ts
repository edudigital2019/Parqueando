import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface ReservaCreateRequest {
  idParqueadero: number;
  idVehiculo: number;
  idConductor: number;
  fechaHoraInicio: string; // LocalDateTime string
  fechaHoraFin: string;    // LocalDateTime string
}

export interface ReservaResponse {
  idReserva: number;
  codigoReserva: string;
  idParqueadero: number;
  idVehiculo: number;
  idConductor: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  totalEstimado: number;
  estado: string;
  urlComprobante?: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crear(payload: ReservaCreateRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(`${this.baseUrl}/api/reservas`, payload);
  }

  listarPorConductor(idConductor: number): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(
      `${this.baseUrl}/api/reservas/conductor/${idConductor}`
    );
  }
}