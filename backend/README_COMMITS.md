# 📦 Asignación de Tareas y Commits de Valor por Integrante (Backend DRF)

Este documento detalla la distribución de aplicaciones, modelos, vistas `APIView`, serializadores, scripts SQL y documentación técnica para cada uno de los **6 integrantes** del equipo, estructurado según las convenciones estándar (**Conventional Commits**):

- `feat:` Nuevas funcionalidades, modelos o endpoints desarrollados.
- `fix:` Correcciones de bugs o validaciones.
- `docs:` Documentación técnica, manuales o guías de ejecución.
- `refactor:` Optimización o reestructuración de código sin alterar comportamiento.
- `test:` Pruebas unitarias automatizadas.

El orden de los commits respeta rigurosamente el **ciclo de vida cronológico de desarrollo de software**: desde la infraestructura base y persistencia, pasando por entidades independientes (usuarios, salas), la lógica de negocio central (reservas con validación antisolapamiento), analítica/seeding (reportes), hasta la integración fullstack con el frontend y documentación.

---

## 👩‍💻 1. Mondadori, Giselda Soledad (DNI: 29255135)
**Rol:** *Infraestructura Base, Configuración del Proyecto y Persistencia Relacional*  
**Orden cronológico:** 1º (Punto de partida del Backend)

### Archivos asignados:
- `backend/requirements.txt`
- `backend/manage.py`
- `backend/config/__init__.py`
- `backend/config/settings.py`
- `backend/config/urls.py`
- `backend/config/wsgi.py`
- `backend/config/asgi.py`
- `backend/init_database.sql`

### Valor aportado:
Inicialización de la arquitectura Django 5 con Django REST Framework y `django-cors-headers`. Configuración de la base de datos relacional MySQL (`sistema_gestion_espacios`), soporte de variables de entorno, y creación del script DDL/DML puro en SQL con integridad referencial, checks y constraints.

### Mensaje de commit sugerido:
```bash
feat(core): inicializar proyecto django con drf, cors y esquema relacional sql
```

---

## 👨‍💻 2. Pierrestegui, Federico Martin (DNI: 35257982)
**Rol:** *Módulo de Usuarios, Autenticación y Seguridad (`usuarios/`)*  
**Orden cronológico:** 2º (Identidad y Roles del Sistema)

### Archivos asignados:
- `backend/usuarios/__init__.py`
- `backend/usuarios/admin.py`
- `backend/usuarios/apps.py`
- `backend/usuarios/models.py` (Modelo `Usuario` con validaciones de email único y roles)
- `backend/usuarios/serializers.py` (`UsuarioSerializer` con password oculto)
- `backend/usuarios/views.py` (`UsuarioListCreateAPIView`, `UsuarioDetailAPIView`, `LoginAPIView`, `RegisterAPIView`)
- `backend/usuarios/urls.py`
- `backend/usuarios/tests.py`
- `backend/usuarios/migrations/`

### Valor aportado:
Implementación de la entidad base de usuarios con roles diferenciados (`admin` y `docente`). Vistas `APIView` seguras para login y registro, validaciones de contraseña mínima y formatos de nombres.

### Mensaje de commit sugerido:
```bash
feat(usuarios): implementar modelo usuario, serializadores y endpoints de autenticacion login y registro
```

---

## 👨‍💻 3. Osess, Gastón Faustino Alejandro (DNI: 35588172)
**Rol:** *Módulo de Espacios Físicos y Laboratorios (`salas/`)*  
**Orden cronológico:** 3º (Recursos Disponibles para Reserva)

### Archivos asignados:
- `backend/salas/__init__.py`
- `backend/salas/admin.py`
- `backend/salas/apps.py`
- `backend/salas/models.py` (Modelo `Sala` con ciclo, capacidad > 0 y nombre único)
- `backend/salas/serializers.py` (`SalaSerializer`)
- `backend/salas/views.py` (`SalaListCreateAPIView`, `SalaDetailAPIView`)
- `backend/salas/urls.py` (Rutas `/salas/` y alias `/labs/`)
- `backend/salas/tests.py`
- `backend/salas/migrations/`

### Valor aportado:
Gestión y persistencia de aulas y laboratorios de informática. Métodos CRUD para alta, baja, modificación y consulta de espacios, con validación estricta de capacidades positivas y estados activos.

### Mensaje de commit sugerido:
```bash
feat(salas): implementar modelo sala, serializadores y abm de laboratorios
```

---

## 👩‍💻 4. Monje, Sofía Florencia (DNI: 39420278)
**Rol:** *Lógica Central del Negocio: Reservas y Algoritmo Antisolapamiento (`reservas/`)*  
**Orden cronológico:** 4º (Reglas de Negocio Críticas)

### Archivos asignados:
- `backend/reservas/__init__.py`
- `backend/reservas/admin.py`
- `backend/reservas/apps.py`
- `backend/reservas/models.py` (Modelo `Reserva` vinculando Usuario y Sala)
- `backend/reservas/serializers.py` (`ReservaSerializer` con `usuarioId`, `salaId` y validación temporal)
- `backend/reservas/views.py` (`ReservaListCreateAPIView`, `ReservaDetailAPIView` con filtros por docente/sala/estado)
- `backend/reservas/urls.py` (Rutas `/reservas/` y alias `/reservation/`)
- `backend/reservas/tests.py` (Tests unitarios de solapamiento horario)
- `backend/reservas/migrations/`

### Valor aportado:
Desarrollo del corazón operativo del sistema: asignación de turnos. Implementación del algoritmo matemático de prevención de solapamientos horarios en el modelo (`clean`) y en el serializador (`validate`), rechazando reservas duplicadas con código `HTTP 400 Bad Request`.

### Mensaje de commit sugerido:
```bash
feat(reservas): implementar reservas y algoritmo de prevencion de solapamientos horarios
```

---

## 👨‍💻 5. Bianchi Nuñez, Víctor Andrés (DNI: 42258135)
**Rol:** *Módulo de Analítica, Reportes y Datos Iniciales (`reportes/` + `seed_data.py`)*  
**Orden cronológico:** 5º (Estadísticas y Poblado de Datos)

### Archivos asignados:
- `backend/reportes/__init__.py`
- `backend/reportes/admin.py`
- `backend/reportes/apps.py`
- `backend/reportes/models.py`
- `backend/reportes/views.py` (`ReportesAPIView` para cálculo de porcentajes y ocupación promedio)
- `backend/reportes/urls.py`
- `backend/reportes/tests.py`
- `backend/reportes/migrations/`
- `backend/seed_data.py` (Script ORM para sembrado de datos de prueba)

### Valor aportado:
Cálculo en tiempo real de estadísticas globales: total de reservas, docentes registrados, laboratorios disponibles, porcentaje de uso por laboratorio y ocupación media. Creación del script `seed_data.py` para inicializar el sistema con datos de prueba realistas.

### Mensaje de commit sugerido:
```bash
feat(reportes): agregar modulo de estadisticas de ocupacion y script orm de datos iniciales seed_data
```

---

## 👨‍💻 6. Udovich, Federico David (DNI: 42383964)
**Rol:** *Integración Fullstack, Pruebas Integrales y Documentación Técnica*  
**Orden cronológico:** 6º (Cierre, Integración y Manuales)

### Archivos asignados:
- `backend/README.md`
- `backend/README_COMMITS.md`
- `backend/GUIA_COMANDOS_GIT.md`
- `frontend/sistema_gestion_espacios/src/environments/environment.ts`
- `frontend/sistema_gestion_espacios/src/environments/environment.development.ts`
- `frontend/sistema_gestion_espacios/src/app/services/auth.ts`
- `frontend/sistema_gestion_espacios/src/app/services/labs.ts`
- `frontend/sistema_gestion_espacios/src/app/services/reservation.ts`
- `frontend/sistema_gestion_espacios/src/app/services/users.ts`
- `frontend/sistema_gestion_espacios/src/app/pages/login/login.ts`
- `frontend/sistema_gestion_espacios/src/app/pages/register/register.ts`
- `frontend/sistema_gestion_espacios/src/app/pages/dashboard-admin/salas/salas.ts`
- `frontend/sistema_gestion_espacios/src/app/pages/dashboard-admin/usuarios/usuarios.ts`
- `frontend/sistema_gestion_espacios/src/app/pages/dashboard-user/reservar-espacio/reservar-espacio.ts`
- `docs/` y `instructivos/`

### Valor aportado:
Conexión de punta a punta entre el cliente Angular y la API REST de Django. Adaptación de servicios HTTP, manejo de respuestas y errores, redacción de la documentación técnica y manuales de instalación para entrega académica.

### Mensaje de commit sugerido:
```bash
docs(integracion): conectar frontend angular con backend django y generar documentacion integral
```
