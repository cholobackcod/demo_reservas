import { Routes } from '@angular/router';
import { NotFound } from './pages/not-found/not-found';
import { Landing } from './pages/landing/landing';
import { About } from './pages/about/about';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { RecoverPassword } from './pages/recover-password/recover-password';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { Salas } from './pages/dashboard-admin/salas/salas';
import { Reservas } from './pages/dashboard-admin/reservas/reservas';
import { Usuarios } from './pages/dashboard-admin/usuarios/usuarios';
import { Reportes } from './pages/dashboard-admin/reportes/reportes';
import { DashboardUser } from './pages/dashboard-user/dashboard-user';

import { EspaciosDisponibles } from './pages/dashboard-user/espacios-disponibles/espacios-disponibles';
import { ReservarEspacio } from './pages/dashboard-user/reservar-espacio/reservar-espacio';
import { ReservasConfirmadas } from './pages/dashboard-user/reservas-confirmadas/reservas-confirmadas';
import { HistorialReservas } from './pages/dashboard-user/historial-reservas/historial-reservas';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    data: { title: 'Inicio' },
  },

  {
    path: 'about',
    component: About,
    data: { title: 'Acerca de' },
  },

  {
    path: 'login',
    component: Login,
    data: { title: 'Iniciar Sesión' },
  },

  {
    path: 'register',
    component: Register,
    data: { title: 'Registrarse' },
  },

  {
    path: 'recover-password',
    component: RecoverPassword,
    data: { title: 'Recuperar Contraseña' },
  },

  {
  path: 'dashboard/admin',
  component: DashboardAdmin,
  data: { title: 'Panel de Administrador' },

  children: [

      {
        path: '',
        redirectTo: 'salas',
        pathMatch: 'full',
      },

      {
        path: 'salas',
        component: Salas,
        data: {
          title: 'Administrar Salas'
        },
      },

      {
        path: 'reservas',
        component: Reservas,
        data: {
          title: 'Gestionar Reservas'
        },
      },

      {
        path: 'usuarios',
        component: Usuarios,
        data: {
          title: 'Gestionar Usuarios'
        },
      },

      {
        path: 'reportes',
        component: Reportes,
        data: {
          title: 'Ver Reportes'
        },
      },

    ],
  },

  {
    path: 'dashboard/user',
    component: DashboardUser,
    data: { title: 'Panel del Usuario' },
    children: [
      {
        path: '',
        redirectTo: 'espacios',
        pathMatch: 'full',
      },
      {
        path: 'espacios',
        component: EspaciosDisponibles,
        data: { title: 'Espacios Disponibles' },
      },
      {
        path: 'reservar',
        component: ReservarEspacio,
        data: { title: 'Reservar Espacio' },
      },
      {
        path: 'reservas',
        component: ReservasConfirmadas,
        data: { title: 'Reservas Confirmadas' },
      },
      {
        path: 'historial',
        component: HistorialReservas,
        data: { title: 'Historial de Reservas' },
      },
    ],
  },

  {
    path: '**',
    component: NotFound,
  },
];
