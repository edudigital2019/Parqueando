import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { ReservaResponse } from 'src/app/models/reserva-response';

type EstadoFiltro = 'TODOS' | 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

type ReservaVM = {
  idReserva: number;
  codigo: string;
  parqueadero: string;
  vehiculo: string;
  estado: string;
  total: number;
  inicio: string;
  fin: string;
  fechaCreacion: string;
};

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class HistorialPage implements OnInit {

  filtro: EstadoFiltro = 'TODOS';

  reservas: ReservaResponse[] = [];
  reservasFiltradas: ReservaVM[] = [];

  constructor(
    private auth: AuthService,
    private reservaService: ReservaService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  ionViewWillEnter() {
    this.cargarHistorial();
  }

  async cargarHistorial(event?: any) {
    const idUsuario = this.auth.getUserId();

    if (!idUsuario) {
      const t = await this.toastCtrl.create({
        message: 'Tu sesión no está lista. Inicia sesión otra vez.',
        duration: 1800,
        position: 'bottom'
      });
      await t.present();
      this.router.navigate(['/auth/login']);
      event?.target?.complete?.();
      return;
    }

    let loading: HTMLIonLoadingElement | null = null;
    if (!event) {
      loading = await this.loadingCtrl.create({ message: 'Cargando historial...' });
      await loading.present();
    }

    try {
      const data = await firstValueFrom(this.reservaService.listarPorConductor(idUsuario));
      this.reservas = (data || []).sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );
      this.aplicarFiltro();
    } catch {
      const t = await this.toastCtrl.create({
        message: 'No se pudo cargar el historial.',
        duration: 2000,
        position: 'bottom'
      });
      await t.present();
    } finally {
      if (loading) await loading.dismiss();
      event?.target?.complete?.();
    }
  }

  onFiltroChange() {
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    const f = this.filtro;

    const filtradas = f === 'TODOS'
      ? this.reservas
      : this.reservas.filter(r => String(r.estado).toUpperCase() === f);

    this.reservasFiltradas = filtradas.map(r => ({
      idReserva: r.idReserva,
      codigo: r.codigoReserva || `#${r.idReserva}`,
      parqueadero: `Parqueadero #${r.idParqueadero}`,
      vehiculo: `Vehículo #${r.idVehiculo}`,
      estado: String(r.estado),
      total: Number(r.totalEstimado ?? 0),
      inicio: this.formatoFechaCorta(r.fechaHoraInicio),
      fin: this.formatoFechaCorta(r.fechaHoraFin),
      fechaCreacion: this.formatoFechaCorta(r.fechaCreacion),
    }));
  }

  abrirReserva(item: ReservaVM) {
    // por ahora lo mandamos a checkout; luego puedes hacer detalle-reserva
    this.router.navigate(['/checkout'], { queryParams: { idReserva: item.idReserva } });
  }

  badgeColor(estado: string): string {
    const e = String(estado).toUpperCase();
    if (e === 'CONFIRMADA') return 'success';
    if (e === 'PENDIENTE') return 'warning';
    if (e === 'CANCELADA') return 'danger';
    if (e === 'COMPLETADA') return 'medium';
    return 'primary';
  }

  private formatoFechaCorta(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  }
}