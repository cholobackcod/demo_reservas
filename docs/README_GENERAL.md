# 🌐 README_GENERAL.md — Documentación Global del Proyecto

## 📌 Descripción General
El **Sistema de Gestión de Espacios (Syntax Error)** es una solución web integral diseñada para administrar la reserva y disponibilidad de laboratorios y espacios compartidos en instituciones educativas. Permite a los docentes consultar la disponibilidad de laboratorios y reservar turnos, mientras otorga a los administradores el control total sobre usuarios, laboratorios, reservas y reportes estadísticos.

---

## 🛠️ Arquitectura Global del Sistema

El sistema está dividido en dos capas claramente separadas que se comunican mediante una **API REST**:

```text
  [ Frontend: Angular 21 SPA ]
              │
              │ Peticiones HTTP / JSON (CORS)
              ▼
  [ Backend: Django REST Framework ]
              │
              │ SQL Query / PyMySQL
              ▼
  [ Base de Datos: MySQL 8.0 / MariaDB ]
```

---

## ⚙️ 1. Sección Backend (Django REST Framework & MySQL)

### Tecnologías:
- **Python 3.14+**
- **Django 5.0+**
- **Django REST Framework**
- **PyMySQL** (Driver MySQL)
- **Base de Datos Relacional**: MySQL / MariaDB (`sistema_gestion_espacios`)

### Responsabilidades del Backend:
1. **Persistencia y Modelo Relacional**: Definir la estructura de la base de datos con restricciones de unicidad, tipos de datos y relaciones mediante Foreign Keys.
2. **Lógica de Negocio y Validación**: Validar que los datos recibidos sean correctos, procesar reglas de negocio (ej. prevención de solapamientos horarios) y garantizar la seguridad de contraseñas.
3. **Exposición de Endpoints REST**: Proveer una interfaz de comunicación estándar en JSON bajo la nomenclatura `/api/v1/`:
   - `/api/v1/auth/login/`: Autenticación de usuarios.
   - `/api/v1/auth/register/`: Registro de nuevos usuarios docentes.
   - `/api/v1/usuarios/`: Gestión CRUD de usuarios.
   - `/api/v1/salas/`: Gestión CRUD de laboratorios/espacios.
   - `/api/v1/reservas/`: Gestión CRUD de reservas.
   - `/api/v1/reportes/`: Métricas y porcentajes de ocupación por sala.

---

## 🅰️ 2. Sección Frontend (Angular 21 SPA)

### Tecnologías:
- **Angular 21** (Standalone Components)
- **TypeScript**
- **HTML5 & CSS3** (Diseño 100% Responsive, glassmorphism, gradient UI)
- **Bootstrap 5**
- **Reactive Forms & Angular Router**
- **RxJS** (`HttpClient`, `Observables`, `forkJoin`)

### Responsabilidades del Frontend:
1. **Interfaz de Usuario (UI/UX)**: Brindar una experiencia responsive, dinámica y visualmente atractiva adaptada a dispositivos móviles, tablets y computadoras.
2. **Navegación SPA y Control de Roles**: Renderizar paneles y vistas personalizadas según el rol de la sesión iniciada (`admin` vs `docente`).
3. **Consumo de Servicios REST**: Realizar peticiones HTTP asíncronas hacia la API REST de Django para consultar, crear, modificar y eliminar datos en tiempo real sin recargar la página.

---

## 🔄 Comunicación entre Backend y Frontend
- La comunicación se realiza de forma asíncrona mediante llamadas `HTTP` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- El formato de intercambio de información es estrictamente `JSON`.
- Para permitir la comunicación entre el puerto del frontend (`http://localhost:4200`) y el del backend (`http://127.0.0.1:8000`), el backend tiene habilitado el middleware `django-cors-headers`.
