import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';

import {
  gridOutline,
  mapOutline,
  bookmarkOutline,
  personOutline,
  settingsOutline,
  addOutline,
  carSportOutline,
  walletOutline,
  locationOutline,
  notificationsOutline,
  scanOutline,
  timeOutline,
  carOutline,
  arrowBackOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPage {

  public environmentInjector = inject(EnvironmentInjector);

  constructor() {

    // Registramos todos los iconos usados en la app
    addIcons({
      gridOutline,
      mapOutline,
      bookmarkOutline,
      personOutline,
      settingsOutline,
      addOutline,
      carSportOutline,
      walletOutline,
      locationOutline,
      notificationsOutline,
      scanOutline,
      timeOutline,
      carOutline,
      arrowBackOutline,
      createOutline,
      trashOutline
    });

  }

}