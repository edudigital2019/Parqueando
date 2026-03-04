import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  logOutOutline,
  cameraOutline,
  createOutline,
  mailOutline,
  callOutline,
} from 'ionicons/icons';

import { AuthService, UsuarioResponse } from 'src/app/services/auth.service';

type PerfilView = {
  nombreCompleto: string;
  email: string;
  telefono?: string;
  fotoUrl?: string;
  rol?: string;
  activo?: boolean;
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  perfil: PerfilView = {
    nombreCompleto: 'Cargando...',
    email: 'Cargando...',
    telefono: '',
    fotoUrl: '',
    rol: '',
    activo: true,
  };

  private usuarioRaw: UsuarioResponse | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit(): void {
    addIcons({
      personCircleOutline,
      logOutOutline,
      cameraOutline,
      createOutline,
      mailOutline,
      callOutline,
    });

    this.cargarPerfilDesdeSesion();
  }

  ionViewWillEnter() {
    // ✅ cada vez que entras a Perfil, refresca datos del localStorage
    this.cargarPerfilDesdeSesion();
  }

  private cargarPerfilDesdeSesion() {
  // 1) Si no hay token => login (esto sí es correcto)
  if (!this.auth.isLoggedIn()) {
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    return;
  }

  // 2) Hay token, intentamos leer usuario
  const u = this.auth.getUsuario();

  // Si el usuario no está listo, NO lo mandes al login
  if (!u) {
    this.perfil = {
      nombreCompleto: 'Usuario',
      email: 'Sin datos',
      telefono: '',
      fotoUrl: '',
      rol: '',
      activo: true,
    };
    return;
  }

  this.usuarioRaw = u;

  this.perfil = {
    nombreCompleto: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || 'Usuario',
    email: u.correo ?? '',
    telefono: u.telefono ?? '',
    fotoUrl: u.fotoPerfilUrl ?? '',
    rol: u.rolPrincipal ?? '',
    activo: u.esActivo ?? true,
  };
}

  async cambiarFoto() {
    // ✅ Aquí luego conectamos Capacitor Camera + subir a backend
    const t = await this.toastCtrl.create({
      message: 'Pendiente: seleccionar foto y subirla al backend',
      duration: 2000,
      position: 'bottom',
    });
    await t.present();
  }

  async editarPerfil() {
    if (!this.usuarioRaw) {
      const t = await this.toastCtrl.create({
        message: 'No se pudo leer la sesión del usuario',
        duration: 2000,
        position: 'bottom',
      });
      await t.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Editar perfil',
      inputs: [
        {
          name: 'nombres',
          type: 'text',
          placeholder: 'Nombres',
          value: this.usuarioRaw.nombres ?? '',
        },
        {
          name: 'apellidos',
          type: 'text',
          placeholder: 'Apellidos',
          value: this.usuarioRaw.apellidos ?? '',
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono',
          value: this.usuarioRaw.telefono ?? '',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            // ✅ Por ahora actualiza solo visualmente y en localStorage (mock)
            // Luego lo conectamos a tu endpoint real de actualización (PUT/PATCH)
            const nuevos: UsuarioResponse = {
              ...this.usuarioRaw!,
              nombres: (data.nombres ?? '').trim() || this.usuarioRaw!.nombres,
              apellidos: (data.apellidos ?? '').trim() || this.usuarioRaw!.apellidos,
              telefono: (data.telefono ?? '').trim(),
            };

            localStorage.setItem('usuario', JSON.stringify(nuevos));
            this.cargarPerfilDesdeSesion();

            const t = await this.toastCtrl.create({
              message: 'Perfil actualizado (local)',
              duration: 1500,
              position: 'bottom',
            });
            await t.present();
          },
        },
      ],
    });

    await alert.present();
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, salir',
          role: 'destructive',
          handler: async () => {
            this.auth.logout();
            await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }
}