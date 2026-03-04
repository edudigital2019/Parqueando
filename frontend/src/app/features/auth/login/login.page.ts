import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mail, lockClosed, carSport } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {

  correo = '';
  password = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ mail, lockClosed, carSport });
  }

  ngOnInit() {}

  async ingresar() {
    if (!this.correo || !this.password) {
      return this.mostrarToast('Ingresa correo y contraseña', 'warning');
    }

    const loading = await this.loadingCtrl.create({
      message: 'Ingresando...',
      spinner: 'crescent'
    });
    await loading.present();

    this.auth.login({ correo: this.correo, password: this.password }).subscribe({
      next: async (res) => {
        await loading.dismiss();
        if (res?.ok) {
          this.router.navigate(['/app/tabs/mapa']);
        } else {
          this.mostrarToast('Credenciales inválidas', 'danger');
        }
      },
      error: async (err) => {
  await loading.dismiss();

  console.log('LOGIN ERROR FULL =>', err);

  const status = err?.status;
  const backendMsg =
    err?.error?.mensaje ||
    err?.error?.message ||
    err?.error?.error ||
    (typeof err?.error === 'string' ? err.error : null);

  const msg = backendMsg || `No se pudo iniciar sesión (HTTP ${status ?? 'sin status'})`;
  this.mostrarToast(msg, 'danger');
}
    });
  }

  crearCuenta() {
    this.router.navigate(['/auth/registro']);
  }

  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }
}