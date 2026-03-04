import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';

export interface ParqueaderoApiResponse {
  idParqueadero: number;
  idPropietario: number;
  titulo: string;
  direccion: string;
  referencia?: string;
  latitud: number;
  longitud: number;
  tarifaHora: number;
  tarifaDia?: number;
  tieneCamara?: boolean;
  tieneTecho?: boolean;
  tieneGuardia?: boolean;
  calificacionPromedio?: number;
  esActivo?: boolean;
  imagenes?: { idImagen: number; imageUrl: string; esPrincipal: boolean }[];
}

export interface Parqueadero {
  idParqueadero: number;
  titulo: string;
  direccion: string;
  tarifaHora: number;

  imagenUrl: string;
  calificacion: number;

  // ✅ campos directos (sin amenidades)
  camara: boolean;
  techo: boolean;
  guardia: boolean;

  referencia?: string;
  latitud?: number;
  longitud?: number;
  tarifaDia?: number;
}

@Injectable({ providedIn: 'root' })
export class ParqueaderoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerParqueaderos(): Observable<Parqueadero[]> {
    return this.http.get<ParqueaderoApiResponse[]>(`${this.baseUrl}/api/parqueaderos`).pipe(
      map((items) => items.map((p) => this.toUiModel(p)))
    );
  }

  private toUiModel(p: ParqueaderoApiResponse): Parqueadero {
  const principal = p.imagenes?.find(i => i.esPrincipal)?.imageUrl;
  const primera = p.imagenes?.[0]?.imageUrl;

  return {
    idParqueadero: p.idParqueadero,
    titulo: p.titulo,
    direccion: p.direccion,
    tarifaHora: Number(p.tarifaHora ?? 0),

    imagenUrl: principal || primera || 'https://via.placeholder.com/600x400?text=ParqueAndo',
    calificacion: Number(p.calificacionPromedio ?? 0),

    // ✅ directos
    camara: !!p.tieneCamara,
    techo: !!p.tieneTecho,
    guardia: !!p.tieneGuardia,

    referencia: p.referencia,
    latitud: p.latitud,
    longitud: p.longitud,
    tarifaDia: p.tarifaDia,
  };
}
}