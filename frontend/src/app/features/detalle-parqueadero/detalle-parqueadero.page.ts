import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  heartOutline,
  star,
  locationSharp,
  videocamOutline,
  shieldCheckmarkOutline,
  umbrellaOutline,
  calendarOutline,
  timeOutline,
  chevronForward,
  carOutline
} from 'ionicons/icons';

import { Parqueadero } from '../../services/parqueadero';

@Component({
  selector: 'app-detalle-parqueadero',
  templateUrl: './detalle-parqueadero.page.html',
  styleUrls: ['./detalle-parqueadero.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DetalleParqueaderoPage implements OnInit {

  parqueadero?: any;

  // ✅ modales
  openInicio = false;
  openFin = false;

  // ✅ fechas (ISO local)
  fechaInicioIso: string = '';
  fechaFinIso: string = '';

  horas: number = 1;
  total: number = 0;

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline, heartOutline, star, locationSharp, videocamOutline,
      shieldCheckmarkOutline, umbrellaOutline, calendarOutline, timeOutline,
      chevronForward, carOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const state = history.state;

    if (state?.parqueadero) this.parqueadero = state.parqueadero;
    else if (state?.data) this.parqueadero = state.data;
    else {
      this.router.navigate(['/app/tabs/mapa']);
      return;
    }

    const now = new Date();
    const plus1h = new Date(now.getTime() + 60 * 60 * 1000);

    this.fechaInicioIso = this.toLocalIso(now);
    this.fechaFinIso = this.toLocalIso(plus1h);

    this.recalcularHorasYTotal();
  }

  getImagenPrincipal(): string {
    if (this.parqueadero?.imagenUrl) return this.parqueadero.imagenUrl;
    const imgs = this.parqueadero?.imagenes ?? [];
    if (!Array.isArray(imgs) || imgs.length === 0) return 'assets/no-image.png';
    const principal = imgs.find((i: any) => i?.esPrincipal === true);
    return principal?.imageUrl || imgs[0]?.imageUrl || 'assets/no-image.png';
  }

  onImgError(ev: any) {
    ev.target.src = 'assets/no-image.png';
  }

  onCambioInicio(ev: any) {
    const v = ev?.detail?.value;
    if (!v) return;
    this.fechaInicioIso = v;

    const ini = new Date(this.fechaInicioIso);
    const fin = new Date(this.fechaFinIso);
    if (fin.getTime() <= ini.getTime()) {
      this.fechaFinIso = this.toLocalIso(new Date(ini.getTime() + 60 * 60 * 1000));
    }
    this.recalcularHorasYTotal();
  }

  onCambioFin(ev: any) {
    const v = ev?.detail?.value;
    if (!v) return;
    this.fechaFinIso = v;

    const ini = new Date(this.fechaInicioIso);
    const fin = new Date(this.fechaFinIso);
    if (fin.getTime() <= ini.getTime()) {
      this.fechaFinIso = this.toLocalIso(new Date(ini.getTime() + 60 * 60 * 1000));
    }
    this.recalcularHorasYTotal();
  }

  ajustarHoras(val: number) {
    const nuevas = Math.max(1, this.horas + val);
    this.horas = nuevas;

    const ini = new Date(this.fechaInicioIso);
    const fin = new Date(ini.getTime() + this.horas * 60 * 60 * 1000);
    this.fechaFinIso = this.toLocalIso(fin);

    this.calcularTotal();
  }

  private recalcularHorasYTotal() {
    const ini = new Date(this.fechaInicioIso);
    const fin = new Date(this.fechaFinIso);

    const diffMs = fin.getTime() - ini.getTime();
    const diffHoras = Math.max(1, Math.ceil(diffMs / (60 * 60 * 1000)));

    this.horas = diffHoras;
    this.calcularTotal();
  }

  private calcularTotal() {
    const tarifa = this.toNum(this.parqueadero?.tarifaHora);
    this.total = tarifa * this.horas;
  }

  formatFecha(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    // formato corto bonito
    return d.toLocaleString('es-EC', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  volver() {
    this.router.navigate(['/app/tabs/mapa']);
  }

  confirmarReserva() {
    this.router.navigate(['/checkout'], {
      state: {
        parqueadero: this.parqueadero,
        horas: this.horas,
        total: this.total,
        fechaInicio: this.fechaInicioIso,
        fechaFin: this.fechaFinIso
      }
    });
  }

  private toNum(v: any): number {
    if (v === null || v === undefined) return 0;
    const s = String(v).trim().replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  private toLocalIso(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}