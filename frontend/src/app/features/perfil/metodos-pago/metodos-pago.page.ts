import { Component, OnInit } from '@angular/core'; //
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cardOutline, 
  addOutline, 
  ellipsisVertical, 
  trashOutline, 
  checkmarkCircle,
  walletOutline,
  chevronBackOutline,
  closeOutline 
} from 'ionicons/icons';

// ✅ Importamos el componente del modal
import { NuevoMetodoPage } from './nuevo-metodo/nuevo-metodo.page';

@Component({
  selector: 'app-metodos-pago',
  templateUrl: './metodos-pago.page.html',
  styleUrls: ['./metodos-pago.page.scss'],
  standalone: true,
  // 🔴 CRÍTICO: Añadimos NuevoMetodoPage a los imports para Standalone
  imports: [CommonModule, IonicModule, NuevoMetodoPage] 
})
export class MetodosPagoPage implements OnInit {

  metodos = [
    { 
      id: 1, 
      tipo: 'tarjeta', 
      franquicia: 'Visa', 
      numero: '•••• 4242', 
      expiracion: '12/26', 
      color: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
      principal: true 
    },
    { 
      id: 2, 
      tipo: 'deuna', 
      nombre: 'Deuna!', 
      usuario: '099XXXX890', 
      color: 'linear-gradient(135deg, #00c853, #b2ff59)',
      principal: false 
    }
  ];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController 
  ) {
    addIcons({ cardOutline, addOutline, ellipsisVertical, trashOutline, checkmarkCircle, walletOutline, chevronBackOutline, closeOutline });
  }

  ngOnInit() {}

  // Lógica para el menú de cada tarjeta
  async opcionesMetodo(metodo: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: metodo.tipo === 'tarjeta' ? `Tarjeta ${metodo.franquicia}` : 'Cuenta Deuna!',
      buttons: [
        {
          text: 'Establecer como principal',
          icon: 'checkmark-circle',
          handler: () => { this.hacerPrincipal(metodo); }
        },
        {
          text: 'Eliminar método',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => { this.eliminarMetodo(metodo); }
        },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  hacerPrincipal(metodo: any) {
    this.metodos.forEach(m => m.principal = false);
    metodo.principal = true;
  }

  eliminarMetodo(metodo: any) {
    this.metodos = this.metodos.filter(m => m.id !== metodo.id);
  }

  // 🚀 Lógica de apertura y recepción de datos
  async agregarMetodo() {
    const modal = await this.modalCtrl.create({
      component: NuevoMetodoPage,
      breakpoints: [0, 0.85],
      initialBreakpoint: 0.85
    });

    await modal.present();

    // Capturamos el objeto que viene del modal
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      // Si no hay métodos, el primero es principal
      if (this.metodos.length === 0) data.principal = true;
      this.metodos.push(data); // Se añade a la lista y se ve en el HTML
    }
  }
}