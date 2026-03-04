import { Component } from '@angular/core'; // ✅ Importación vital
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nuevo-metodo',
  templateUrl: './nuevo-metodo.page.html',
  styleUrls: ['./nuevo-metodo.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class NuevoMetodoPage {
  tipo: 'tarjeta' | 'deuna' = 'tarjeta';
  form = { franquicia: 'Visa', numero: '', expiracion: '', usuarioDeuna: '' };

  constructor(private modalCtrl: ModalController) {}

  cerrar() { this.modalCtrl.dismiss(); }

  guardar() {
    const nuevo = {
      id: Date.now(),
      tipo: this.tipo,
      franquicia: this.form.franquicia,
      nombre: 'Deuna!',
      numero: this.tipo === 'tarjeta' ? `•••• ${this.form.numero.slice(-4)}` : '',
      usuario: this.tipo === 'deuna' ? this.form.usuarioDeuna : '',
      expiracion: this.form.expiracion,
      color: this.tipo === 'tarjeta' ? 'linear-gradient(135deg, #1e3c72, #2a5298)' : 'linear-gradient(135deg, #00c853, #b2ff59)',
      principal: false
    };
    this.modalCtrl.dismiss(nuevo);
  }
}