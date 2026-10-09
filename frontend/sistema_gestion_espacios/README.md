# 🏰 Sistema de Gestión de Espacios (Guía Completa de Construcción Paso a Paso 👧👦)

¡Bienvenido a la guía maestra de construcción de nuestro proyecto! Aquí te explicamos **absolutamente todo**: desde qué herramientas usamos y por qué, hasta **cómo se crea un servicio, cómo se conecta con la base de datos, cómo se arman los formularios reactivos y cómo se junta todo en Angular** desde cero.

---

## 💡 1. ¿Cuál era el Problema y cuál fue nuestra Misión?

Imagina que en nuestra escuela hay **dos laboratorios de computación súper geniales** 💻. Todos los profesores quieren llevar a sus alumnos a usar las computadoras. 

Pero... **¡Oh no! 😱** Si dos profesores van al mismo laboratorio el mismo martes a las 10:00 de la mañana, ¡se armaba un lío gigante! Ninguno sabía quién había llegado primero.

**Nuestra Misión Mágica:**
Construimos un **Robot Asistente Digital** en la computadora (una aplicación Web). Este robot anotador guarda el turno de cada profesor, les muestra qué salas están libres y, si alguien intenta reservar una sala que ya está ocupada... **¡El robot da un aviso y no lo deja chocar! 🛑**

---

## 🛠️ 2. Las Herramientas Mágicas que Instalamos

| 🧰 Herramienta | ¿Qué es en el mundo real? | ¿Para qué sirve en el proyecto? |
| :--- | :--- | :--- |
| **Node.js** | 🏭 La Fábrica de Motores | Es el motor gigante que le da fuerza a la computadora para procesar todo nuestro código. |
| **Angular** | 🧱 La Caja de Legos Gigante | Es un conjunto de piezas de colores prefabricadas (botones, ventanas, formularios) para armar pantallas súper rápido. |
| **json-server** | 📓 El Cuaderno Mágico (`db.json`) | Es un cuaderno digital donde el robot escribe los nombres de los usuarios, las salas disponibles y todas las reservas realizadas. |
| **HttpClient & RxJS** | 🕊️ Las Palomas Mensajeras | Son pequeños mensajeros voladores que llevan lo que el usuario escribe en la pantalla hasta el Cuaderno Mágico (`db.json`) y traen la respuesta de inmediato. |

---

## 🔨 3. TUTORIAL PASO A PASO: ¿CÓMO CREAMOS Y CONECTAMOS CADA PARTE?

A continuación, te enseñamos la receta exacta de cómo construimos cada pieza del código:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CONFIGURACIÓN DE ENTORNO                                                 │
│    src/environments/environment.ts ➔ Define la URL de json-server           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. ENCHUFE GLOBAL HTTP                                                      │
│    src/app/app.config.ts ➔ provideHttpClient() habilita llamadas de red    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CREACIÓN DE SERVICIOS (@Injectable)                                      │
│    src/app/services/*.ts ➔ Realizan peticiones GET, POST, PUT, DELETE       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. FORMULARIOS REACTIVOS Y COMPONENTES                                      │
│    src/app/pages/* ➔ Inyectan el Servicio, leen datos y hacen .subscribe()   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. RUTAS Y NAVEGACIÓN                                                       │
│    src/app/app.routes.ts ➔ Conecta la URL del navegador con cada pantalla   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📍 PASO 1: Configurar la dirección del servidor (`environments/`)

Para no escribir la dirección `http://localhost:3000` en 50 archivos distintos (lo cual sería un peligro si la dirección cambia), la guardamos en un solo lugar secreto.

1. Abrimos o creamos el archivo `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000' // 👈 ¡Aquí vive nuestra base de datos!
   };
   ```
2. Hacemos lo mismo en `environment.development.ts`.
3. **¿Por qué sirve esto?** Si mañana el servidor cambia a `http://miservidor.com`, solo cambiamos una línea de código aquí y todo el sistema sigue funcionando.

---

### 🔌 PASO 2: Habilitar las llamadas HTTP en Angular (`app.config.ts`)

Por defecto, Angular no viene con los "walkie-talkies" de red encendidos para ahorrar memoria. Tenemos que avisarle que queremos hacer peticiones HTTP.

1. Abrimos el archivo principal de configuración `src/app/app.config.ts`.
2. Importamos `provideHttpClient`:
   ```typescript
   import { provideHttpClient } from '@angular/common/http';
   ```
3. Lo agregamos en el arreglo de `providers`:
   ```typescript
   export const appConfig: ApplicationConfig = {
     providers: [
       provideRouter(routes),
       provideHttpClient() // 👈 ¡Enchufamos las palomas mensajeras HTTP a toda la app!
     ]
   };
   ```

---

### 🧬 PASO 3: ¿Cómo se crea un Servicio en Angular desde Cero?

Un **Servicio** es como un robot especialista que sabe buscar datos, guardarlos y compartirlos entre componentes.

#### A. Comando para crear el servicio:
En la terminal escribimos:
```bash
ng generate service services/labs
```
Esto crea el archivo `src/app/services/labs.ts`.

#### B. Código interno del Servicio (`labs.ts`):
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 1. Interfaz: La plantilla que dice cómo es una Sala
export interface Lab {
  id: number;
  nombre: string;
  ciclo: string;
  descripcion: string;
  activa: boolean;
}

// 2. Decorador @Injectable: Le dice a Angular "¡Este servicio se puede usar en cualquier lugar!"
@Injectable({
  providedIn: 'root'
})
export class LabsService {
  // Inyectamos la paloma mensajera HttpClient
  private http = inject(HttpClient);
  
  // Leemos la URL base (http://localhost:3000/labs)
  private apiUrl = `${environment.apiUrl}/labs`;

  // MÉTODOS HTTP (Operaciones CRUD):

  // GET: Trae todas las salas del cuaderno db.json
  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl);
  }

  // POST: Guarda una sala nueva en db.json
  addLab(lab: Omit<Lab, 'id'>): Observable<Lab> {
    return this.http.post<Lab>(this.apiUrl, lab);
  }

  // DELETE: Borra una sala de db.json pasando su ID
  deleteLab(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

### 📝 PASO 4: ¿Cómo creamos un Formulario Reactivo y lo conectamos con el Servicio?

Ahora que tenemos el Servicio `LabsService`, vamos a ver cómo una pantalla (Componente) usa este servicio para guardar datos desde un formulario.

#### A. En el archivo TypeScript del Componente (`salas.ts`):
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabsService, Lab } from '../../../services/labs';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 👈 Importamos ReactiveFormsModule
  templateUrl: './salas.html'
})
export class SalasComponent implements OnInit {
  // Inyectamos el servicio y el armador de formularios
  private labsService = inject(LabsService);
  private fb = inject(FormBuilder);

  salas: Lab[] = [];
  salaForm: FormGroup;

  constructor() {
    // 1. Armamos el formulario reactivo con sus reglas de validación
    this.salaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciclo: ['Ciclo Básico', Validators.required],
      descripcion: ['', Validators.required],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarSalas();
  }

  // 2. Pedimos los datos al Servicio (LEER)
  cargarSalas(): void {
    this.labsService.getLabs().subscribe({
      next: (datos) => {
        this.salas = datos; // 👈 Cuando llegan los datos, los guardamos en la variable
      },
      error: (err) => console.error('Error al cargar salas', err)
    });
  }

  // 3. Enviamos el formulario al Servicio (GUARDAR)
  guardarSala(): void {
    if (this.salaForm.valid) {
      this.labsService.addLab(this.salaForm.value).subscribe({
        next: (nuevaSala) => {
          alert('¡Sala creada con éxito! 🎉');
          this.salaForm.reset({ ciclo: 'Ciclo Básico', activa: true });
          this.cargarSalas(); // Recargamos la lista
        },
        error: (err) => alert('Ocurrió un error al guardar')
      });
    }
  }
}
```

#### B. En la plantilla HTML (`salas.html`):
```html
<!-- Formulario Reactivo ligado con [formGroup] -->
<form [formGroup]="salaForm" (ngSubmit)="guardarSala()">
  
  <label>Nombre de la Sala:</label>
  <!-- Conectamos el input con formControlName -->
  <input type="text" formControlName="nombre" class="form-control">

  <label>Ciclo:</label>

```html
  <select formControlName="ciclo" class="form-select">
    <option value="Ciclo Básico">Ciclo Básico</option>
    <option value="Ciclo Orientado">Ciclo Orientado</option>
  </select>

  <!-- El botón solo se activa si el formulario es válido -->
  <button type="submit" [disabled]="salaForm.invalid" class="btn btn-primary mt-3">
    Guardar Nueva Sala 💾
  </button>
</form>

<!-- Lista de salas cargadas desde el servicio -->
<div class="row mt-4">
  @for (sala of salas; track sala.id) {
    <div class="col-md-6 mb-3">
      <div class="card p-3">
        <h3>{{ sala.nombre }}</h3>
        <p>{{ sala.descripcion }}</p>
        <span class="badge bg-success">{{ sala.ciclo }}</span>
      </div>
    </div>
  }
</div>
```

---

### 🚦 PASO 5: Conectar las Pantallas con el Enrutador (`app.routes.ts`)

El enrutador es como el letrero de calles de la ciudad. Decide qué componente mostrar según la dirección web que escriba el usuario en el navegador.

1. Abrimos `src/app/app.routes.ts`:
   ```typescript
   import { Routes } from '@angular/router';
   import { LoginComponent } from './pages/login/login';
   import { RegisterComponent } from './pages/register/register';
   import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user';
   import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin';

   export const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: 'register', component: RegisterComponent },
     { path: 'dashboard-user', component: DashboardUserComponent },
     { path: 'dashboard-admin', component: DashboardAdminComponent },
     { path: '', redirectTo: 'login', pathMatch: 'full' },
     { path: '**', redirectTo: 'login' } // Si escribe una ruta rara, vuelve al Login
   ];
   ```

2. **¿Cómo cambiamos de pantalla desde código?**
   En el servicio `AuthService`, cuando la contraseña es correcta, hacemos:
   ```typescript
   private router = inject(Router);

   login(email, password) {
     // ... validación ...
     if (usuario.rol === 'admin') {
       this.router.navigate(['/dashboard-admin']); // 👈 ¡Nos lleva al panel de admin!
     } else {
       this.router.navigate(['/dashboard-user']);  // 👈 ¡Nos lleva al panel de profe!
     }
   }
   ```

---

### 🗄️ PASO 6: Servidor Backend de Pruebas (`json-server` y `db.json`)

Para probar toda esta magia sin necesidad de programar un backend complejo en Java o C#, usamos `json-server`.

1. Creamos el archivo `db.json` en la raíz del proyecto:
   ```json
   {
     "users": [
       { "id": 1, "nombre": "Carla", "email": "carla@escuela.edu.ar", "rol": "admin" }
     ],
     "labs": [
       { "id": 1, "nombre": "Laboratorio Ciclo Básico", "activa": true }
     ],
     "reservation": []
   }
   ```
2. Ejecutamos en la consola:
   ```bash
   npx json-server db.json
   ```
3. `json-server` lee nuestro archivo y crea automáticamente las URL completas:
   - `GET /users` ➔ Trae usuarios.
   - `POST /reservation` ➔ Guarda una reserva nueva.
   - `DELETE /labs/1` ➔ Elimina la sala 1.

---

## 👾 4. Los Monstruos de los Errores que Vencimos (Bugs Solucionados)

Durante la construcción, aparecieron algunos "monstruos traviesos" (errores de código) que logramos vencer:

1. **El Monstruo de las Etiquetas Raras (IDs en texto)**:
   - *Problema:* La base de datos estaba guardando números de reserva con letras raras como `"RK5se2p_ztw"`.
   - *Solución:* Reparamos la fórmula para que los números de identificador siempre sean números limpios y ordenados: `1, 2, 3, 4...`

2. **El Monstruo de las Reservas Dobles (Solapamiento de Horarios)**:
   - *Problema:* Dos profesores podían reservar la misma sala a las 10:00 de la mañana.
   - *Solución:* Le enseñamos una regla matemática al robot: 
     `Si (HoraInicioNueva < HoraFinExistente) Y (HoraFinNueva > HoraInicioExistente) => ¡HAY CHOQUE!` 🛑

3. **El Monstruo de la Pantalla Congelada**:
   - *Problema:* Hacías una reserva y la pantalla no cambiaba hasta apretar la tecla `F5`.
   - *Solución:* Le agregamos un avisador instantáneo a Angular (`ChangeDetectorRef`) para que la pantalla se dibuje al instante apenas tocas el botón.

---

## 👥 5. ¿Quién Construyó Cada Parte del Castillo? (Los 6 Integrantes)

| Integrante | Rol y Parte del Castillo | Archivos Creados / Modificados |
| :--- | :--- | :--- |
| 👩‍💻 **Mondadori, Giselda** | **Los Cimientos y los Cables** (Servicios, configuraciones HttpClient y `db.json`). | `environment.ts`, `app.config.ts`, `auth.ts`, `labs.ts`, `reservation.ts`, `users.ts`, `db.json` |
| 👨‍💻 **Pierrestegui, Federico** | **La Puerta de Entrada** (Formularios Reactivos de Login y Registro). | `login.ts`, `login.html`, `login.css`, `register.ts`, `register.html`, `register.css` |
| 👨‍💻 **Osess, Gastón** | **La Máquina de Reservas** (Formulario de reserva y detector de choques de horario). | `reservar-espacio.ts`, `reservar-espacio.html`, `espacios-disponibles.ts`, `espacios-disponibles.html` |
| 👩‍💻 **Monje, Sofía** | **La Galería del Profesor** (Vistas de reservas confirmadas e historial). | `dashboard-user.ts`, `reservas-confirmadas.ts`, `historial-reservas.ts` y sus plantillas HTML |
| 👨‍💻 **Bianchi, Víctor** | **El Panel de Control del Director** (CRUD de Salas y Usuarios). | `dashboard-admin.ts`, `salas.ts`, `salas.html`, `usuarios.ts`, `usuarios.html` |
| 👨‍💻 **Udovich, Federico** | **El Cuadro de Mando y Manuales** (Barra de navegación `Navbar`, Pantalla de Reportes y Documentación). | `nav.ts`, `nav.html`, `reservas.ts`, `reportes.ts`, `README_COMMITS.md`, `GUIA_COMANDOS_GIT.md` |

---

## 🎮 6. ¿Cómo se Pone a Funcionar Todo? (¡A Jugar!)

### 1️⃣ Encender la Base de Datos (`json-server`)
```bash
npx json-server db.json
```
*(Servidor corriendo en `http://localhost:3000`)* 📓

### 2️⃣ Encender Angular
En otra consola:
```bash
ng serve
```
*(Aplicación corriendo en `http://localhost:4200`)* 🚀

### 3️⃣ Probar en el Navegador
Abre la dirección **`http://localhost:4200`** ¡y listo! 🎉🥳
