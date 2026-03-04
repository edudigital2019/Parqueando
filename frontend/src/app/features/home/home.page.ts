import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, firstValueFrom } from 'rxjs';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AuthService, UsuarioResponse } from 'src/app/services/auth.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { ReservaResponse } from 'src/app/models/reserva-response';

type ReservaActivaVM = {
  activa: boolean;
  lugar: string;
  placa: string;
  total: number;
  tiempoRestante: string;
  progreso: number; // 0..100
  idReserva?: number;
  fechaInicio?: string;
  fechaFin?: string;
};

type RecienteVM = {
  idParqueadero: number;
  titulo: string;
  direccion: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnDestroy {

  nombre = 'Usuario';
  avatarUrl = 'https://i.pravatar.cc/150?u=parqueando';

  reservaActiva: ReservaActivaVM = {
    activa: false,
    lugar: '',
    placa: '',
    total: 0,
    tiempoRestante: '',
    progreso: 0
  };

  recientes: RecienteVM[] = [];

  private tickSub?: Subscription;

  // Hoy: activa solo si está CONFIRMADA (PENDIENTE lo dejamos para después)
  private readonly ESTADO_ACTIVO = new Set(['CONFIRMADA']);

  constructor(
    private auth: AuthService,
    private reservaService: ReservaService,
    private router: Router
  ) {}

  async ionViewWillEnter() {
    await this.cargarHome();
    this.iniciarTimer();
  }

  ngOnDestroy() {
    this.tickSub?.unsubscribe();
  }

  private async cargarHome() {
    const u: UsuarioResponse | null = this.auth.getUsuario();

    if (!u) {
      this.nombre = 'Usuario';
      this.reservaActiva.activa = false;
      this.recientes = [];
      return;
    }

    this.nombre = u.nombres || 'Usuario';
    this.avatarUrl = u.fotoPerfilUrl || this.avatarUrl;

    const idConductor = u.idUsuario;

    const lista = await firstValueFrom(
      this.reservaService.listarPorConductor(idConductor)
    );

    // 1) Activa (CONFIRMADA)
    const activa = this.encontrarActiva(lista);
    if (activa) {
      this.setReservaActiva(activa);
    } else {
      this.reservaActiva = {
        activa: false,
        lugar: '',
        placa: '',
        total: 0,
        tiempoRestante: '',
        progreso: 0
      };
    }

    // 2) Recientes (últimas 5 por fechaCreacion desc)
    const ordenadas = [...lista].sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );

    this.recientes = ordenadas.slice(0, 5).map((r) => ({
      idParqueadero: r.idParqueadero,
      titulo: r.codigoReserva
        ? `Reserva ${r.codigoReserva}`
        : `Parqueadero #${r.idParqueadero}`,
      direccion: `Estado: ${r.estado} • Inicio: ${this.formatoFechaCorta(r.fechaHoraInicio)}`
    }));
  }

  private encontrarActiva(lista: ReservaResponse[]): ReservaResponse | undefined {
    const activas = lista.filter(r =>
      this.ESTADO_ACTIVO.has(String(r.estado).toUpperCase())
    );
    if (activas.length === 0) return undefined;

    activas.sort((a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
    return activas[0];
  }

  private setReservaActiva(r: ReservaResponse) {
    this.reservaActiva = {
      activa: true,
      lugar: `Parqueadero #${r.idParqueadero}`,
      placa: `Vehículo #${r.idVehiculo}`,
      total: Number(r.totalEstimado ?? 0),
      tiempoRestante: this.calcularTiempoRestante(r.fechaHoraFin),
      progreso: this.calcularProgreso(r.fechaHoraInicio, r.fechaHoraFin),
      idReserva: r.idReserva,
      fechaInicio: r.fechaHoraInicio,
      fechaFin: r.fechaHoraFin
    };
  }

  private iniciarTimer() {
    this.tickSub?.unsubscribe();

    this.tickSub = interval(1000).subscribe(() => {
      if (!this.reservaActiva.activa) return;
      if (!this.reservaActiva.fechaInicio || !this.reservaActiva.fechaFin) return;

      this.reservaActiva.tiempoRestante = this.calcularTiempoRestante(this.reservaActiva.fechaFin);
      this.reservaActiva.progreso = this.calcularProgreso(this.reservaActiva.fechaInicio, this.reservaActiva.fechaFin);

      if (this.reservaActiva.tiempoRestante === 'Finalizada') {
        this.reservaActiva.activa = false;
      }
    });
  }

  private calcularTiempoRestante(fechaFinIso: string): string {
    const fin = new Date(fechaFinIso).getTime();
    const ahora = Date.now();
    const diff = fin - ahora;

    if (diff <= 0) return 'Finalizada';

    const totalSeg = Math.floor(diff / 1000);
    const h = Math.floor(totalSeg / 3600);
    const m = Math.floor((totalSeg % 3600) / 60);
    const s = totalSeg % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private calcularProgreso(inicioIso: string, finIso: string): number {
    const t0 = new Date(inicioIso).getTime();
    const t1 = new Date(finIso).getTime();
    const now = Date.now();

    if (now <= t0) return 0;
    if (now >= t1) return 100;

    return Math.max(0, Math.min(100, Math.round(((now - t0) / (t1 - t0)) * 100)));
  }

  private formatoFechaCorta(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  }

  // -------- Acciones UI --------
  irEscanearQR() {
    // si aún no tienes ruta QR, puedes llevarlo al mapa por ahora
    this.router.navigate(['/app/tabs/mapa']);
  }

  irMisAutos() {
    this.router.navigate(['/mis-autos']);
  }

  irRecargar() {
    this.router.navigate(['/metodos-pago']); // tu ruta existente para pagos
  }

  irParqueadero(idParqueadero: number) {
    // tu ruta actual no tiene :id, por ahora solo navega al detalle
    // luego lo mejor es cambiar ruta a /detalle-parqueadero/:id
    this.router.navigate(['/detalle-parqueadero'], {
      queryParams: { idParqueadero }
    });
  }

  extenderReserva() {
    // aún no tienes ruta de extender, lo dejamos para después
    // por ahora lo mandamos al checkout como placeholder
    this.router.navigate(['/checkout'], {
      queryParams: { idReserva: this.reservaActiva.idReserva }
    });
  }
}