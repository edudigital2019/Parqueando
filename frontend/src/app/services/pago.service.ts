import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface PagoCreateRequest {
  idReserva: number;
  monto: number;
  metodoPago?: string;
  transaccionId?: string;
}

export interface PagoResponse {
  idPago: number;
  idReserva: number;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  transaccionId?: string;
  fechaPago: string; // ISO string
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crear(payload: PagoCreateRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/api/pagos`, payload);
  }
}