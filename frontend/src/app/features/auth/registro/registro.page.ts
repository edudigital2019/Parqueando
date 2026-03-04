import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { carSport, personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class RegistroPage {
  usuario = { nombre: '', email: '', password: '' };
  verPassword = false;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private auth: AuthService
  ) {
    addIcons({ carSport, personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline });
  }

  async registrarUsuario() {
  if (!this.usuario.nombre || !this.usuario.email || !this.usuario.password) {
    this.mostrarToast('Por favor, completa todos los campos', 'warning');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.usuario.email)) {
    this.mostrarToast('Ingresa un correo electrónico válido', 'danger');
    return;
  }

  if (this.usuario.password.length < 6) {
    this.mostrarToast('La contraseña debe tener al menos 6 caracteres', 'warning');
    return;
  }

  const full = this.usuario.nombre.trim().replace(/\s+/g, ' ');
  const parts = full.split(' ');
  const apellidos = parts.length >= 2 ? parts.pop()! : full;
  const nombres = parts.length ? parts.join(' ') : full;

  const loading = await this.loadingCtrl.create({
    message: 'Creando tu cuenta...',
    spinner: 'crescent'
  });
  await loading.present();

  this.auth.register({
    nombres,
    apellidos,
    correo: this.usuario.email,
    password: this.usuario.password,
    rolPrincipal: 'CONDUCTOR'
  }).subscribe({
    next: async (res: any) => {
      await loading.dismiss();
      // backend -> RegisterResponse { ok, mensaje, uid }
      if (res?.ok) {
        await this.mostrarToast(res?.mensaje || 'Cuenta creada con éxito', 'success');
        this.navCtrl.navigateRoot('/auth/login');
      } else {
        this.mostrarToast(res?.mensaje || 'No se pudo registrar', 'danger');
      }
    },
    error: async (err) => {
      await loading.dismiss();
      console.log('REGISTER ERROR FULL =>', err);

      const msg =
        err?.error?.mensaje ||
        err?.error?.message ||
        (typeof err?.error === 'string' ? err.error : null) ||
        'Error registrando usuario';

      this.mostrarToast(msg, 'danger');
    }
  });
}

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }

  volverAlLogin() {
    this.navCtrl.back();
  }
}