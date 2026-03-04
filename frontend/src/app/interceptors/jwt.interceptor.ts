import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Endpoints públicos donde NO se debe adjuntar token
  private readonly publicEndpoints = ['/api/auth/login', '/api/auth/register'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si es un endpoint público, no adjuntes Authorization
    const isPublic = this.publicEndpoints.some((p) => req.url.includes(p));
    if (isPublic) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req);
  }
}