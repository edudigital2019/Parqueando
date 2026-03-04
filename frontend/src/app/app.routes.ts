import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./features/auth/registro/registro.page').then((m) => m.RegistroPage),
      },
    ],
  },

  {
    path: 'app',
    canActivate: [authGuard], // ✅ protege toda la app
    children: [
      {
        path: 'tabs',
        loadComponent: () =>
          import('./features/tabs/tabs.page').then((m) => m.TabsPage),

        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./features/home/home.page').then((m) => m.HomePage),
          },
          {
            path: 'mapa',
            loadComponent: () =>
              import('./features/mapa/mapa.page').then((m) => m.MapaPage),
          },
          {
            path: 'historial',
            loadComponent: () =>
              import('./features/historial/historial.page').then((m) => m.HistorialPage),
          },
          {
            path: 'perfil',
            loadComponent: () =>
              import('./features/perfil/perfil.page').then((m) => m.PerfilPage),
          },

          { path: '', redirectTo: '/app/tabs/mapa', pathMatch: 'full' },
        ],
      },

      { path: '', redirectTo: '/app/tabs/mapa', pathMatch: 'full' },
    ],
  },

  {
    path: 'detalle-parqueadero',
    loadComponent: () =>
      import('./features/detalle-parqueadero/detalle-parqueadero.page').then(
        (m) => m.DetalleParqueaderoPage
      ),
  },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.page').then((m) => m.CheckoutPage),
  },

  {
    path: 'voucher',
    loadComponent: () =>
      import('./features/voucher/voucher.page').then((m) => m.VoucherPage),
  },

  {
    path: 'agregar-auto',
    loadComponent: () =>
      import('./features/perfil/agregar-auto/agregar-auto.page').then(
        (m) => m.AgregarAutoPage
      ),
  },

  {
    path: 'metodos-pago',
    loadComponent: () =>
      import('./features/perfil/metodos-pago/metodos-pago.page').then(
        (m) => m.MetodosPagoPage
      ),
  },

  {
    path: 'nuevo-metodo',
    loadComponent: () =>
      import('./features/perfil/metodos-pago/nuevo-metodo/nuevo-metodo.page').then(
        (m) => m.NuevoMetodoPage
      ),
  },

  {
    path: 'mis-autos',
    loadComponent: () =>
      import('./features/perfil/mis-autos/mis-autos.page').then(
        (m) => m.MisAutosPage
      ),
  },
];