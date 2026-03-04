import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  color?: string;
  principal?: boolean;
  imagen?: string;
}

// ✅ esto es lo que espera tu backend
export interface VehiculoRequest {
  placa: string;
  marca: string;
  modelo: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * ✅ Método principal (ya lo tenías).
   * GET /api/usuarios/{idUsuario}/vehiculos
   */
  listarPorUsuario(idUsuario: number): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(
      `${this.baseUrl}/api/usuarios/${idUsuario}/vehiculos`
    );
  }

  /**
   * ✅ Alias para usarlo desde otras pantallas sin cambiar mucho código.
   * (Equivalente a listarPorUsuario)
   */
  listarVehiculos(idUsuario: number): Observable<Vehiculo[]> {
    return this.listarPorUsuario(idUsuario);
  }

  actualizar(
  idUsuario: number,
  idVehiculo: number,
  data: VehiculoRequest,
  files?: File[]
): Observable<any> {
  const form = new FormData();
  form.append('data', JSON.stringify(data));

  if (files?.length) {
    for (const f of files) form.append('files', f);
  }

  return this.http.put<any>(
    `${this.baseUrl}/api/usuarios/${idUsuario}/vehiculos/${idVehiculo}`,
    form
  );
}

  eliminar(idUsuario: number, idVehiculo: number): Observable<void> {
  return this.http.delete<void>(
    `${this.baseUrl}/api/usuarios/${idUsuario}/vehiculos/${idVehiculo}`
  );
}

  /**
   * ✅ Alias opcional (por si en algún lado llamaste "listar")
   * (Equivalente a listarPorUsuario)
   */
  listar(idUsuario: number): Observable<Vehiculo[]> {
    return this.listarPorUsuario(idUsuario);
  }

  /**
   * ✅ Crear vehículo con multipart:
   * POST /api/usuarios/{idUsuario}/vehiculos
   * form-data:
   *  - data: JSON string
   *  - files: 0..n
   */
  crear(idUsuario: number, data: VehiculoRequest, files?: File[]): Observable<Vehiculo> {
    const form = new FormData();
    form.append('data', JSON.stringify(data));

    if (files?.length) {
      for (const f of files) form.append('files', f);
    }

    return this.http.post<Vehiculo>(
      `${this.baseUrl}/api/usuarios/${idUsuario}/vehiculos`,
      form
    );
  }
}