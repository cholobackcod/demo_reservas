# 📝 README_CAMBIOS.md — Registro de Archivos y Modificaciones

Este documento proporciona una lista detallada y exacta de todos los archivos creados y modificados durante la integración del sistema fullstack (**Django REST Framework + MySQL + Angular 21**).

---

## 🆕 Archivos Nuevos Creados

### 🛠️ Backend (Django REST Framework)
- **`backend/config/__init__.py`**: Configuración inicial que registra `PyMySQL` como driver de MySQL y desactiva la restricción de versión en Django para compatibilidad con MySQL 8.0+.
- **`backend/config/settings.py`**: Configuración general del proyecto Django (CORS, DRF, Apps locales, conexión a la base de datos relacional MySQL `sistema_gestion_espacios` con usuario `root` y clave `R00t`).
- **`backend/config/urls.py`**: Enrutador principal de URLs con prefijo de nomenclatura REST `/api/v1/` y fallbacks `/api/`.
- **`backend/manage.py`**: Script de administración oficial de Django para comandos (`runserver`, `migrate`, `test`, `shell`).
- **`backend/requirements.txt`**: Lista de dependencias Python obligatorias (`Django`, `djangorestframework`, `django-cors-headers`, `pymysql`).
- **`backend/init_database.sql`**: Script DDL/DML relacional en SQL para MySQL/MariaDB con la creación de la base de datos, tablas (`usuarios_usuario`, `salas_sala`, `reservas_reserva`), claves foráneas, restricciones `CHECK` e inserción de datos iniciales.
- **`backend/seed_data.py`**: Script ejecutable en Python para sembrar datos iniciales de prueba en la base de datos mediante el ORM de Django.
- **`backend/README.md`**: Guía rápida de instalación y comandos del backend.

#### 👥 App `usuarios`
- `backend/usuarios/models.py`: Modelo `Usuario` con validaciones de nombre/apellido, email único, password y roles (`admin`, `docente`).
- `backend/usuarios/serializers.py`: Serializador `UsuarioSerializer` en DRF con ocultamiento de contraseña en lectura.
- `backend/usuarios/views.py`: Vistas basadas en `APIView` (`UsuarioListCreateAPIView`, `UsuarioDetailAPIView`, `LoginAPIView`, `RegisterAPIView`).
- `backend/usuarios/urls.py`: Mapeo de rutas REST (`/api/v1/usuarios/`, `/api/v1/auth/login/`, `/api/v1/auth/register/`).
- `backend/usuarios/tests.py`: Pruebas unitarias en DRF para verificar el comportamiento de usuarios y autenticación.

#### 🏢 App `salas`
- `backend/salas/models.py`: Modelo `Sala` con validación de capacidad mayor a 0 y nombre único.
- `backend/salas/serializers.py`: Serializador `SalaSerializer` para conversión JSON.
- `backend/salas/views.py`: Vistas basadas en `APIView` (`SalaListCreateAPIView`, `SalaDetailAPIView`).
- `backend/salas/urls.py`: Mapeo de rutas REST (`/api/v1/salas/` y alias `/api/v1/labs/`).
- `backend/salas/tests.py`: Pruebas unitarias para la gestión de laboratorios.

#### 📅 App `reservas`
- `backend/reservas/models.py`: Modelo `Reserva` con ForeignKeys y método `clean()` para validación de rango de fechas y solapamientos.
- `backend/reservas/serializers.py`: Serializador `ReservaSerializer` mapeando `usuarioId` y `salaId` con validación de solapamiento horario.
- `backend/reservas/views.py`: Vistas basadas en `APIView` (`ReservaListCreateAPIView`, `ReservaDetailAPIView`).
- `backend/reservas/urls.py`: Mapeo de rutas REST (`/api/v1/reservas/` y alias `/api/v1/reservation/`).
- `backend/reservas/tests.py`: Pruebas unitarias para validación de solapamiento de turnos.

#### 📊 App `reportes`
- `backend/reportes/views.py`: Vista basada en `APIView` (`ReportesAPIView`) para cálculo dinámico de porcentajes de ocupación y métricas.
- `backend/reportes/urls.py`: Mapeo de ruta `/api/v1/reportes/`.
- `backend/reportes/tests.py`: Pruebas unitarias para métricas y estadísticas.

---

## ✏️ Archivos Modificados

### 🅰️ Frontend (Angular)
- **`frontend/sistema_gestion_espacios/src/environments/environment.ts`**: Apuntado del `apiUrl` a `http://127.0.0.1:8000/api/v1`.
- **`frontend/sistema_gestion_espacios/src/environments/environment.development.ts`**: Apuntado del `apiUrl` de desarrollo a la API Django REST.
- **`frontend/sistema_gestion_espacios/src/app/services/auth.ts`**: Conexión de `login()` y `register()` al servidor Django vía `HttpClient`.
- **`frontend/sistema_gestion_espacios/src/app/services/labs.ts`**: Peticiones HTTP a `/api/v1/salas/`.
- **`frontend/sistema_gestion_espacios/src/app/services/users.ts`**: Peticiones HTTP a `/api/v1/usuarios/`.
- **`frontend/sistema_gestion_espacios/src/app/services/reservation.ts`**: Peticiones HTTP a `/api/v1/reservas/`.
- **`frontend/sistema_gestion_espacios/src/app/pages/login/login.ts`**: Manejo de autenticación reactiva consumiendo la respuesta del servidor.
- **`frontend/sistema_gestion_espacios/src/app/pages/register/register.ts`**: Registro de usuarios procesando respuestas y errores del servidor.
- **`frontend/sistema_gestion_espacios/src/app/pages/dashboard-admin/salas/salas.ts`**: Gestión CRUD de laboratorios conectada a la API sin IDs manuales.
- **`frontend/sistema_gestion_espacios/src/app/pages/dashboard-admin/usuarios/usuarios.ts`**: Gestión CRUD de usuarios con captura de errores del servidor.
- **`frontend/sistema_gestion_espacios/src/app/pages/dashboard-user/reservar-espacio/reservar-espacio.ts`**: Formularios de reserva enviando peticiones POST a la API REST.
