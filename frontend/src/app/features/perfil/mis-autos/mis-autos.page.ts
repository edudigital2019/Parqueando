import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { VehiculoService, Vehiculo } from 'src/app/services/vehiculo.service';

@Component({
  selector: 'app-mis-autos',
  templateUrl: './mis-autos.page.html',
  styleUrls: ['./mis-autos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MisAutosPage implements OnInit {

  autos: Vehiculo[] = [];

  constructor(
    private vehiculoService: VehiculoService,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarAutos();
  }

  ionViewWillEnter() {
    this.cargarAutos();
  }

  async cargarAutos() {
    const idUsuario = this.auth.getUserId();

    if (!idUsuario) {
      const t = await this.toastCtrl.create({
        message: 'No se encontró tu sesión. Inicia sesión otra vez.',
        duration: 2000,
        position: 'bottom'
      });
      await t.present();
      this.router.navigate(['/auth/login']);
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Cargando autos...' });
    await loading.present();

    try {
      const data = await firstValueFrom(this.vehiculoService.listarPorUsuario(idUsuario));
      this.autos = data || [];
    } catch {
      const t = await this.toastCtrl.create({
        message: 'No se pudieron cargar tus autos.',
        duration: 2000,
        position: 'bottom'
      });
      await t.present();
    } finally {
      await loading.dismiss();
    }
  }

  agregarAuto() {
    this.router.navigate(['/agregar-auto']);
  }

  irMapa() {
  this.router.navigate(['/app/tabs/mapa']);
}


  editarAuto(auto: Vehiculo) {
    // ✅ Abre tu pantalla existente pero en "modo editar"
    // (Luego en agregar-auto.page.ts lees queryParams y precargas)
    this.router.navigate(['/agregar-auto'], {
      queryParams: {
        modo: 'editar',
        idVehiculo: auto.id,
        marca: auto.marca,
        modelo: auto.modelo,
        placa: auto.placa,
        color: auto.color || ''
      }
    });
  }

  async confirmarEliminar(auto: Vehiculo) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar vehículo',
      message: `¿Seguro que quieres eliminar el vehículo con placa <strong>${auto.placa}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarAuto(auto)
        }
      ]
    });

    await alert.present();
  }

  private async eliminarAuto(auto: Vehiculo) {
    const idUsuario = this.auth.getUserId();
    if (!idUsuario) return;

    const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
    await loading.present();

    try {
      // ✅ Este método lo agregamos en el service (abajo)
      await firstValueFrom(this.vehiculoService.eliminar(idUsuario, auto.id));

      this.autos = this.autos.filter(a => a.id !== auto.id);

      const t = await this.toastCtrl.create({
        message: 'Vehículo eliminado.',
        duration: 1500,
        position: 'bottom'
      });
      await t.present();
    } catch {
      const t = await this.toastCtrl.create({
        message: 'No se pudo eliminar (revisa si tu backend tiene DELETE).',
        duration: 2000,
        position: 'bottom'
      });
      await t.present();
    } finally {
      await loading.dismiss();
    }
  }
}