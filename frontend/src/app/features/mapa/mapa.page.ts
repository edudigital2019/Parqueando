import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';

import { ParqueaderoService, ParqueaderoResponse } from 'src/app/services/parqueadero.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnDestroy {

  private map?: L.Map;
  private layer?: L.LayerGroup;
  private todosParqueaderos: ParqueaderoResponse[] = [];

  constructor(
    private parqueaderoService: ParqueaderoService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  // ✅ En Ionic, Leaflet funciona mejor aquí que en ngAfterViewInit
  async ionViewDidEnter() {
    // si ya existe el mapa, solo arregla tamaño (cuando vuelves a esta pantalla)
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 200);
      return;
    }

    this.fixLeafletIcons();

    const loading = await this.loadingCtrl.create({ message: 'Cargando mapa...' });
    await loading.present();

    try {
      // 1) Cargar datos
      this.todosParqueaderos = await firstValueFrom(this.parqueaderoService.listar());
      const valid = this.normalizarParqueaderos(this.todosParqueaderos);

      const center = valid.length
        ? { lat: valid[0].lat, lng: valid[0].lng }
        : { lat: -0.1807, lng: -78.4678 };

      // 2) Asegurar que el div exista
      const el = document.getElementById('map');
      if (!el) {
        throw new Error('No existe el elemento #map en el DOM');
      }

      // 3) Crear mapa
      this.map = L.map('map', { zoomControl: true }).setView([center.lat, center.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.layer = L.layerGroup().addTo(this.map);

      // 4) Dibujar pines
      this.dibujarParqueaderos(valid);
      this.ajustarVista(valid);

      // 5) IMPORTANTÍSIMO: cuando el mapa está en contenedor dinámico (Ionic)
      setTimeout(() => this.map?.invalidateSize(), 250);

      if (valid.length === 0) {
        const t = await this.toastCtrl.create({
          message: 'No hay parqueaderos con coordenadas válidas.',
          duration: 2500,
          position: 'top',
          color: 'warning',
        });
        await t.present();
      }

    } catch (err: any) {
      console.error('MAPA ERROR =>', err);

      const msg =
        err?.error?.mensaje ||
        err?.error?.message ||
        err?.message ||
        'No se pudo cargar el mapa.';

      const t = await this.toastCtrl.create({
        message: msg,
        duration: 2500,
        position: 'top',
        color: 'danger',
      });
      await t.present();

    } finally {
      await loading.dismiss();
    }
  }

  // ✅ BÚSQUEDA (desde HTML con (ionInput)="buscar($event)")
  buscar(event: any) {
    const texto = (event?.target?.value ?? event?.detail?.value ?? '')
      .toString()
      .trim()
      .toLowerCase();

    const base = this.todosParqueaderos ?? [];

    const filtrados = !texto
      ? base
      : base.filter((p) => {
          const titulo = (p.titulo ?? '').toLowerCase();
          const direccion = (p.direccion ?? '').toLowerCase();
          const referencia = (p.referencia ?? '').toLowerCase();
          return titulo.includes(texto) || direccion.includes(texto) || referencia.includes(texto);
        });

    const valid = this.normalizarParqueaderos(filtrados);
    this.dibujarParqueaderos(valid);
    this.ajustarVista(valid);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  // =========================
  // Helpers
  // =========================

  private normalizarParqueaderos(lista: ParqueaderoResponse[]) {
    return (lista ?? [])
      .filter((p) => (p.esActivo ?? true) === true)
      .map((p) => ({
        ...p,
        lat: this.toNum(p.latitud),
        lng: this.toNum(p.longitud),
      }))
      .filter((p) => p.lat != null && p.lng != null) as Array<
        ParqueaderoResponse & { lat: number; lng: number }
      >;
  }

  private dibujarParqueaderos(lista: Array<ParqueaderoResponse & { lat: number; lng: number }>) {
    if (!this.layer) return;

    this.layer.clearLayers();

    lista.forEach((p) => {
      const popupHtml = `
        <div style="min-width:220px">
          <b>${this.safe(p.titulo)}</b><br/>
          ${this.safe(p.direccion)}<br/>
          <b>$${this.money(p.tarifaHora)}</b> / hora
          <br/><br/>

          <button 
            id="btn-detalle-${p.idParqueadero}" 
            style="
              background:#3880ff;
              color:white;
              border:none;
              padding:6px 10px;
              border-radius:6px;
              cursor:pointer;
            ">
            Ver detalle
          </button>
        </div>
      `;

      const priceIcon = L.divIcon({
        className: 'price-marker',
        html: `<div class="price-pin">$${this.money(p.tarifaHora)}</div>`,
        iconSize: [70, 30],
        iconAnchor: [35, 15],
      });

      const marker = L.marker([p.lat, p.lng], { icon: priceIcon })
        .addTo(this.layer!)
        .bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-detalle-${p.idParqueadero}`);
          if (btn) {
            btn.onclick = () => {
              this.router.navigate(['/detalle-parqueadero'], { state: { parqueadero: p } });
            };
          }
        }, 50);
      });
    });
  }

  private ajustarVista(lista: Array<ParqueaderoResponse & { lat: number; lng: number }>) {
    if (!this.map) return;

    if (lista.length > 1) {
      const bounds = L.latLngBounds(lista.map((p) => [p.lat, p.lng] as [number, number]));
      this.map.fitBounds(bounds, { padding: [30, 30] });
    } else if (lista.length === 1) {
      this.map.setView([lista[0].lat, lista[0].lng], 15);
    }
  }

  private fixLeafletIcons() {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
  }

  private toNum(v: any): number | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim().replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  private money(v: any): string {
    const n = this.toNum(v);
    return (n ?? 0).toFixed(2);
  }

  private safe(v: any): string {
    return String(v ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m] as string));
  }
}