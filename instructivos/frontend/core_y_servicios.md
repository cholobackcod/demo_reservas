# 🚀 Instructivo Técnico: Frontend - Núcleo y Servicios de Datos (Angular 18)

Este documento analiza el archivo de entrada `main.ts`, la configuración global de Angular (`app.config.ts`), el enrutador (`app.routes.ts`) y los **4 servicios HTTP principales** (`auth.ts`, `labs.ts`, `reservation.ts`, `users.ts`).

---

## 📄 1. Punto de Entrada (`src/main.ts`)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```
- **Línea 1:** Importa `bootstrapApplication`, la función oficial de Angular para arrancar aplicaciones creadas con Componentes Standalone sin `NgModule`.
- **Línea 5:** Arranca el componente raíz `App` inyectando la configuración global `appConfig`.

---

## 📄 2. Configuración Global (`src/app/app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()) 
  ]
};
```
- **`provideRouter(routes)`:** Registra la tabla de rutas de navegación.
- **`provideHttpClient(withFetch())`:** Activa el cliente HTTP global utilizando la API moderna `fetch` del navegador para comunicarse con el backend.

---

## 📄 3. Servicio de Autenticación (`services/auth.ts`)

### ¿Qué es este archivo?
Administra la comunicación con la API de login/registro y mantiene la sesión activa en el navegador.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1-4** | `import { Injectable, inject } from '@angular/core'; ...` | Importa los decoradores de inyección de dependencias y el cliente HTTP de Angular. |
| **6-14**| `export interface User { ... }` | Interface de TypeScript que define el contrato del objeto `User` (`nombre`, `apellido`, `email`, `rol`). |
| **16-18**| `@Injectable({ providedIn: 'root' })` | Registra la clase `AuthService` como un **Singleton** disponible en toda la aplicación. |
| **20-21**| `private http = inject(HttpClient);` | Inyecta la herramienta para enviar peticiones web al servidor. |
| **23-25**| `login(email, password): Observable<User>` | Envía una petición `POST` a `${apiUrl}/auth/login/` con las credenciales y devuelve un `Observable` con los datos del usuario. |
| **27-29**| `register(userData): Observable<User>` | Envía una petición `POST` a `${apiUrl}/auth/register/` para dar de alta un nuevo docente. |
| **33-37**| `setCurrentUser(user: User): void` | Guarda los datos del usuario autenticado en el almacenamiento local del navegador (`localStorage.setItem('currentUser', ...)`). |
| **39-45**| `getCurrentUser(): User | null` | Lee y convierte el objeto en formato JSON guardado en `localStorage`. Si no hay sesión, devuelve `null`. |
| **47-51**| `logout(): void` | Elimina la clave `'currentUser'` de `localStorage` para cerrar la sesión. |
| **53-55**| `isAuthenticated(): boolean` | Devuelve `true` si hay un usuario logueado en la sesión actual. |

---

## 📄 4. Servicio de Laboratorios (`services/labs.ts`)

Proporciona las funciones CRUD para interactuar con `/api/v1/salas/`:
- **`getLabs(): Observable<Lab[]>`:** Petición `GET` para obtener el listado completo de salas.
- **`getLabById(id)`:** Petición `GET` para consultar una sala específica.
- **`createLab(labData)`:** Petición `POST` para registrar un laboratorio.
- **`updateLab(id, labData)`:** Petición `PATCH` para actualizar campos específicos.
- **`deleteLab(id)`:** Petición `DELETE` para eliminar una sala.

---

## 📄 5. Servicio de Reservas (`services/reservation.ts`)

Proporciona los métodos para gestionar la agenda de turnos:
- **`getAllReservations()`:** Petición `GET` a `/api/v1/reservas/`.
- **`getReservationsByUser(usuarioId)`:** Petición `GET` con query param `?usuarioId=` para filtrar las reservas pertenecientes al docente logueado.
- **`getReservationsByLab(salaId)`:** Petición `GET` con query param `?salaId=` para consultar la agenda de una sala específica.
- **`createReservation(reservationData)`:** Petición `POST` para solicitar un turno.

---

## 📄 6. Servicio de Usuarios (`services/users.ts`)

Permite al Administrador gestionar las cuentas del personal docente consumiendo los endpoints de `/api/v1/usuarios/`.
