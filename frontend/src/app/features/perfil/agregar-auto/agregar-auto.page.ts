import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { VehiculoService, VehiculoRequest } from 'src/app/services/vehiculo.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-agregar-auto',
  templateUrl: './agregar-auto.page.html',
  styleUrls: ['./agregar-auto.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AgregarAutoPage implements OnInit {

  // formulario
  nuevoAuto: VehiculoRequest = {
    marca: '',
    modelo: '',
    placa: '',
    color: ''
  };

  // modo edición
  modo: 'crear' | 'editar' = 'crear';
  idVehiculo?: number;

  // imágenes
  files: File[] = [];

  // UI
  titulo = 'Agregar Auto';
  textoBoton = 'Guardar';

  constructor(
    private vehiculoService: VehiculoService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // ✅ Lee los queryParams enviados desde Mis Autos
    this.route.queryParamMap.subscribe((params) => {
      const modo = (params.get('modo') || 'crear').toLowerCase();
      this.modo = modo === 'editar' ? 'editar' : 'crear';

      const idVehiculoStr = params.get('idVehiculo');
      this.idVehiculo = idVehiculoStr ? Number(idVehiculoStr) : undefined;

      if (this.modo === 'editar') {
        this.titulo = 'Editar Auto';
        this.textoBoton = 'Actualizar';

        // ✅ precargar campos (si vienen por queryParams)
        this.nuevoAuto = {
          marca: params.get('marca') || '',
          modelo: params.get('modelo') || '',
          placa: params.get('placa') || '',
          color: params.get('color') || ''
        };
      } else {
        this.titulo = 'Agregar Auto';
        this.textoBoton = 'Guardar';
      }
    });
  }

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const list = input.files;
    if (!list || list.length === 0) return;

    this.files = Array.from(list);
  }

  async guardar() {
    const idUsuario = this.auth.getUserId();
    if (!idUsuario) {
      const t = await this.toastCtrl.create({
        message: 'Tu sesión no está lista. Inicia sesión otra vez.',
        duration: 1800,
        position: 'bottom'
      });
      await t.present();
      this.router.navigate(['/auth/login']);
      return;
    }

    // Validación mínima
    if (!this.nuevoAuto.marca || !this.nuevoAuto.modelo || !this.nuevoAuto.placa) {
      const t = await this.toastCtrl.create({
        message: 'Marca, modelo y placa son obligatorios.',
        duration: 1800,
        position: 'bottom'
      });
      await t.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.modo === 'editar' ? 'Actualizando...' : 'Guardando...'
    });
    await loading.present();

    try {
      if (this.modo === 'editar') {
        if (!this.idVehiculo) {
          throw new Error('Falta idVehiculo para editar');
        }

        // ✅ intenta actualizar (requiere endpoint PUT en backend)
        await this.vehiculoService
          .actualizar(idUsuario, this.idVehiculo, this.nuevoAuto, this.files)
          .toPromise();

        const t = await this.toastCtrl.create({
          message: 'Vehículo actualizado.',
          duration: 1500,
          position: 'bottom'
        });
        await t.present();
      } else {
        await this.vehiculoService
          .crear(idUsuario, this.nuevoAuto, this.files)
          .toPromise();

        const t = await this.toastCtrl.create({
          message: 'Vehículo creado.',
          duration: 1500,
          position: 'bottom'
        });
        await t.present();
      }

      // volver a lista
      this.router.navigate(['/mis-autos']);
    } catch (e: any) {
      const msg = this.modo === 'editar'
        ? 'No se pudo actualizar. (Si tu backend no tiene PUT aún, toca implementarlo).'
        : 'No se pudo guardar el vehículo.';

      const t = await this.toastCtrl.create({
        message: msg,
        duration: 2200,
        position: 'bottom'
      });
      await t.present();
    } finally {
      await loading.dismiss();
    }
  }

  cancelar() {
    this.router.navigate(['/mis-autos']);
  }
}