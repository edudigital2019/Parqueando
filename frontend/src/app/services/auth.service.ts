import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface UsuarioResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  fotoPerfilUrl?: string;
  rolPrincipal: string;
  esActivo: boolean;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  usuario: UsuarioResponse;
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  telefono?: string;
  rolPrincipal?: 'CONDUCTOR' | 'PROPIETARIO' | 'ADMIN';
}

export interface RegisterResponse {
  ok: boolean;
  mensaje: string;
  uid: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/api/auth/login`, payload)
      .pipe(
        tap((res) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
          }
          if (res?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
        })
      );
  }

  getUserId(): number | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;

    try {
      const u: any = JSON.parse(raw);
      const id = u?.idUsuario ?? u?.id ?? u?.uid ?? u?.userId ?? null;
      return id != null ? Number(id) : null;
    } catch {
      return null;
    }
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/api/auth/register`,
      payload
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * ✅ Lee usuario desde localStorage y NORMALIZA campos
   * Soporta:
   * - Backend: { idUsuario, nombres, apellidos, correo, ... }
   * - Viejo/local: { uid, nombre, email, ... }
   */
  getUsuario(): UsuarioResponse | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;

    try {
      const u: any = JSON.parse(raw);
      if (!u) return null;

      // ---- Normalizar ID ----
      const idUsuario = u.idUsuario ?? u.id ?? u.uid ?? u.userId ?? null;
      if (idUsuario == null) return null;

      // ---- Normalizar correo ----
      const correo = (u.correo ?? u.email ?? '').trim();
      if (!correo) return null;

      // ---- Normalizar nombres/apellidos ----
      let nombres = (u.nombres ?? '').trim();
      let apellidos = (u.apellidos ?? '').trim();

      // Si viene como "nombre" o "nombreCompleto"
      const nombreCompleto = (u.nombreCompleto ?? u.nombre ?? '').trim();
      if ((!nombres || !apellidos) && nombreCompleto) {
        const parts = nombreCompleto.split(/\s+/);
        if (!nombres) nombres = parts[0] ?? 'Usuario';
        if (!apellidos) apellidos = parts.slice(1).join(' ');
      }

      return {
        idUsuario: Number(idUsuario),
        nombres: nombres || 'Usuario',
        apellidos: apellidos || '',
        correo,
        telefono: (u.telefono ?? '').toString(),
        fotoPerfilUrl: u.fotoPerfilUrl ?? u.fotoUrl ?? '',
        rolPrincipal: u.rolPrincipal ?? u.rol ?? 'CONDUCTOR',
        esActivo: u.esActivo ?? u.activo ?? true,
      } as UsuarioResponse;
    } catch (e) {
      console.error('Error leyendo usuario del localStorage', e);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}