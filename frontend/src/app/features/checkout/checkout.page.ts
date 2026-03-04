import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cardOutline,
  walletOutline,
  checkmarkCircle,
  shieldCheckmarkOutline,
  scanCircleOutline
} from 'ionicons/icons';

import { VehiculoService, Vehiculo } from 'src/app/services/vehiculo.service';
import { ReservaService } from 'src/app/services/reserva.service';
import { PagoService, PagoCreateRequest } from 'src/app/services/pago.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CheckoutPage implements OnInit {
  reserva: any; // { parqueadero, horas, total }

  metodosPago = [
    { id: 'deuna', nombre: 'Deuna!', descripcion: 'Pago directo', icono: 'scan-circle-outline' },
    { id: 'tarjeta', nombre: 'Visa •••• 4242', descripcion: 'Crédito / Débito', icono: 'card-outline' },
    { id: 'efectivo', nombre: 'Efectivo', descripcion: 'Pagar en sitio', icono: 'wallet-outline' }
  ];

  metodoSeleccionado: string = 'deuna';

  // ✅ vehículos
  vehiculos: Vehiculo[] = [];
  idVehiculoSeleccionado?: number;
  vehiculoSeleccionado?: Vehiculo;

  // ✅ usuario
  idConductor?: number;

  // ✅ evita duplicados
  private reservaCreada: any = null; // ReservaResponse
  private creando = false;
  private reintentoHorario = false;

  constructor(
    private router: Router,
    private vehiculoService: VehiculoService,
    private reservaService: ReservaService,
    private pagoService: PagoService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBackOutline, cardOutline, walletOutline, checkmarkCircle, shieldCheckmarkOutline, scanCircleOutline });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.reserva = nav.extras.state;
    }
  }

  ngOnInit() {
    // ✅ obtener conductor desde localStorage
    const raw = localStorage.getItem('usuario');
    if (!raw) {
      this.toast('No se encontró conductor. Inicia sesión otra vez.', 'danger');
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const u = JSON.parse(raw);
      const id = u?.idUsuario ?? u?.uid ?? u?.id;
      this.idConductor = id ? Number(id) : undefined;
    } catch {
      this.idConductor = undefined;
    }

    if (!this.idConductor) {
      this.toast('No se encontró conductor. Inicia sesión otra vez.', 'danger');
      this.router.navigate(['/auth/login']);
      return;
    }

    // ✅ cargar vehículos
    this.cargarVehiculos();
  }

  seleccionarMetodo(id: string) {
    this.metodoSeleccionado = id;
  }

  // ✅ LocalDateTime sin "Z" ni offset
  private toLocalDateTimeString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  private async cargarVehiculos() {
    if (!this.idConductor) return;

    const loading = await this.loadingCtrl.create({
      message: 'Cargando vehículos...',
      spinner: 'crescent'
    });
    await loading.present();

    this.vehiculoService.listarPorUsuario(this.idConductor).subscribe({
      next: async (list) => {
        await loading.dismiss();
        this.vehiculos = list || [];

        if (!this.vehiculos.length) {
          await this.toast('No tienes vehículos registrados. Agrega uno para reservar.', 'warning');
          this.router.navigate(['/agregar-auto']);
          return;
        }

        const principal = this.vehiculos.find(v => (v as any).principal);
        this.idVehiculoSeleccionado = (principal?.id ?? this.vehiculos[0].id) as number;
        this.vehiculoSeleccionado = principal ?? this.vehiculos[0];
      },
      error: async (err) => {
        await loading.dismiss();
        console.log('VEHICULOS ERROR =>', err?.error || err);
        await this.toast('No se pudo cargar tus vehículos', 'danger');
      }
    });
  }

  // ✅ crea reserva (solo una vez) y luego crea pago con monto EXACTO del backend
  async confirmarPago() {
    if (this.creando) return;
    this.creando = true;

    if (!this.idConductor) {
      this.creando = false;
      await this.toast('No se encontró conductor. Inicia sesión otra vez.', 'danger');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.idVehiculoSeleccionado) {
      this.creando = false;
      await this.toast('Selecciona un vehículo para reservar.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Procesando...', spinner: 'crescent' });
    await loading.present();

    try {
      // 1) ✅ crear reserva si no existe
      if (!this.reservaCreada) {
        await this.crearReservaConHorario(new Date()); // intenta con "ahora"
      }

      // 2) ✅ crear pago con monto EXACTO del backend
      const montoExacto = Number(this.reservaCreada?.totalEstimado);
      if (!montoExacto || Number.isNaN(montoExacto)) {
        throw { error: { message: 'No se pudo obtener el total estimado de la reserva' } };
      }

      const payloadPago: PagoCreateRequest = {
        idReserva: Number(this.reservaCreada.idReserva),
        monto: montoExacto,
        metodoPago: this.metodoSeleccionado,
        transaccionId: `TX-${Date.now()}`
      };

      console.log('PAYLOAD PAGO =>', payloadPago);

      const pagoResp = await firstValueFrom(this.pagoService.crear(payloadPago));

      await loading.dismiss();
      this.creando = false;

      // 3) ✅ navegar a voucher con data real
      this.router.navigate(['/voucher'], {
        state: {
          ...this.reserva, // parqueadero/horas/total(front)
          metodoPago: this.metodoSeleccionado,
          reserva: this.reservaCreada, // ReservaResponse backend
          pago: pagoResp,
          total: montoExacto
        }
      });

    } catch (err: any) {
      await loading.dismiss();
      this.creando = false;

      const backendMsg = err?.error?.message || err?.error?.mensaje || (typeof err?.error === 'string' ? err.error : '');
      console.log('CHECKOUT ERROR =>', err?.error || err);

      await this.toast(backendMsg || 'Error procesando la compra', 'danger');
      // ✅ IMPORTANTE: si falló pago, NO recrees reserva (reservaCreada queda guardada para reintentar pago)
    }
  }

  seleccionarVehiculo(v: Vehiculo) {
  this.idVehiculoSeleccionado = v.id;
  this.vehiculoSeleccionado = v;
}

irAgregarAuto() {
  this.router.navigate(['/agregar-auto'], {
    state: { volverA: '/checkout', checkoutState: this.reserva }
  });
}

  // ------------------------
  // Helpers
  // ------------------------

  private async crearReservaConHorario(inicioBase: Date) {
    const horas = Number(this.reserva?.horas ?? 1);

    let inicio = new Date(inicioBase);
    let fin = new Date(inicio.getTime() + horas * 60 * 60 * 1000);

    const payloadReserva = {
      idParqueadero: Number(this.reserva?.parqueadero?.idParqueadero),
      idVehiculo: Number(this.idVehiculoSeleccionado),
      idConductor: Number(this.idConductor),
      fechaHoraInicio: this.toLocalDateTimeString(inicio),
      fechaHoraFin: this.toLocalDateTimeString(fin)
    };

    console.log('PAYLOAD RESERVA =>', payloadReserva);

    try {
      this.reservaCreada = await firstValueFrom(this.reservaService.crear(payloadReserva));
      return;
    } catch (err: any) {
      const msg = err?.error?.message || err?.error?.mensaje || '';
      console.log('RESERVA ERROR BODY =>', err?.error || err);

      // ✅ si el rango está ocupado, reintenta 1 sola vez +1 hora
      if (msg.includes('ya está reservado') && !this.reintentoHorario) {
        this.reintentoHorario = true;
        await this.toast('Ese horario está ocupado. Probando el siguiente horario disponible...', 'warning');

        inicio.setHours(inicio.getHours() + 1);
        fin = new Date(inicio.getTime() + horas * 60 * 60 * 1000);

        const retryPayload = {
          ...payloadReserva,
          fechaHoraInicio: this.toLocalDateTimeString(inicio),
          fechaHoraFin: this.toLocalDateTimeString(fin)
        };

        console.log('REINTENTO PAYLOAD RESERVA =>', retryPayload);

        this.reservaCreada = await firstValueFrom(this.reservaService.crear(retryPayload));
        return;
      }

      throw err;
    }
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top',
      mode: 'ios'
    });
    await t.present();
  }
}