import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface ParqueaderoImagenResponse {
  idImagen: number;
  imageUrl: string;
  esPrincipal: boolean;
}

export interface ParqueaderoResponse {
  idParqueadero: number;
  idPropietario: number;
  titulo: string;
  direccion: string;
  referencia?: string;

  // BigDecimal puede venir como number o string
  latitud: number | string;
  longitud: number | string;

  tarifaHora: number | string;
  tarifaDia?: number | string;

  tieneCamara: boolean;
  tieneTecho: boolean;
  tieneGuardia: boolean;

  calificacionPromedio: number | string;
  esActivo: boolean;

  imagenes?: ParqueaderoImagenResponse[];
}

@Injectable({ providedIn: 'root' })
export class ParqueaderoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(): Observable<ParqueaderoResponse[]> {
    return this.http.get<ParqueaderoResponse[]>(`${this.baseUrl}/api/parqueaderos`);
  }

  obtenerPorId(idParqueadero: number): Observable<ParqueaderoResponse> {
    return this.http.get<ParqueaderoResponse>(`${this.baseUrl}/api/parqueaderos/${idParqueadero}`);
  }
}