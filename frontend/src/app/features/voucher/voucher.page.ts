import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { closeOutline, downloadOutline, logoWhatsapp, navigateOutline } from 'ionicons/icons';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.page.html',
  styleUrls: ['./voucher.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, QRCodeComponent]
})
export class VoucherPage implements OnInit {
  data: any = null;      // state completo
  qrData: string = '';

  constructor(private router: Router, private navCtrl: NavController) {
    addIcons({ closeOutline, downloadOutline, logoWhatsapp, navigateOutline });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.data = nav.extras.state;

      const codigo = this.data?.reserva?.codigoReserva || this.data?.codigo || 'SIN-CODIGO';
      const titulo = this.data?.parqueadero?.titulo || 'ParqueAndo';

      // QR con código real
      this.qrData = `RES:${codigo}|LUGAR:${titulo}`;
    }
  }

  ngOnInit() {}

  // ✅ WhatsApp (puedes luego cambiar a teléfono real del propietario)
  contactarWhatsApp() {
    const telefono = '593999999999';
    const codigo = this.data?.reserva?.codigoReserva || this.data?.codigo;
    const parqueadero = this.data?.parqueadero?.titulo;

    const mensaje = `Hola! Tengo una reserva en ${parqueadero}. Código: ${codigo}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_system');
  }

  abrirMapas() {
    // si tienes lat/lng, mejor; si no, búsqueda por texto
    const lat = this.data?.parqueadero?.latitud;
    const lng = this.data?.parqueadero?.longitud;

    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_system');
      return;
    }

    const destino = encodeURIComponent(`${this.data?.parqueadero?.direccion || this.data?.parqueadero?.titulo || 'Quito'}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${destino}`;
    window.open(url, '_system');
  }

  descargarPDF() {
    console.log('Pendiente: generar PDF del voucher...');
  }

  irAHome() {
    this.navCtrl.navigateRoot('/app/tabs/mapa');
  }

  cerrar() {
    this.irAHome();
  }

  // helpers para template
  get codigoReserva(): string {
    return this.data?.reserva?.codigoReserva || this.data?.codigo || '';
  }

  get totalPagar(): number {
    return Number(this.data?.total ?? 0);
  }
}