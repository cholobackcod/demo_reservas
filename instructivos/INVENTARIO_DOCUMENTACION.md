# 📋 Inventario y Cobertura de Documentación del Proyecto

Este archivo constituye la lista de control de auditoría de todo el repositorio **Sistema de Gestión de Espacios y Reservas**. Registra el estado de análisis y documentación de cada archivo fuente del proyecto.

---

## 📊 Resumen General de Cobertura

- **Total de archivos relevantes catalogados:** 58
- **Archivos documentados en detalle (línea por línea):** 42
- **Archivos documentados por secciones / arquitectura:** 16
- **Archivos excluidos justificadamente (generados/temporales/binarios):** Directorios `node_modules/`, `.angular/`, `dist/`, `__pycache__/`, `.git/`, `.zip`.

---

## 🗂️ Registro Detallado por Componente

### 1. Archivos Raíz y Documentación Original

| Ruta del Archivo Fuente | Tipo de Archivo | Función en el Proyecto | Instructivo Donde se Explica | Estado de Documentación | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `README.md` (Raíz) | Markdown | Descripción original del proyecto | [08. Configuración y Vars](08configuracionyvariablesde_entorno.md) | Documentado por secciones | Leído e integrado en la nueva documentación |
| `docs/README_CAMBIOS.md` | Markdown | Historial de actualizaciones | [08. Configuración y Vars](08configuracionyvariablesde_entorno.md) | Documentado por secciones | Registro histórico de cambios |
| `docs/README_GENERAL.md` | Markdown | Documentación general previa | [08. Configuración y Vars](08configuracionyvariablesde_entorno.md) | Documentado por secciones | Referencia conceptual |
| `docs/README_LOGICA.md` | Markdown | Explicación previa de lógica | [08. Configuración y Vars](08configuracionyvariablesde_entorno.md) | Documentado por secciones | Explicación de reglas de negocio |
| `docs/TUTORIAL_DESDE_CERO.md` | Markdown | Tutorial previo para alumnos | [03. Cómo Ejecutar](03comoejecutarelproyecto.md) | Documentado por secciones | Integrado y ampliado en el instructivo 03 |

---

### 2. Backend (Python / Django 5 REST Framework)

| Ruta del Archivo Fuente | Tipo de Archivo | Función en el Proyecto | Instructivo Donde se Explica | Estado de Documentación | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/manage.py` | Python Script | Script administrativo de Django | [manage_y_config.md](backend/manage_y_config.md) | Documentado línea por línea | Entrada CLI principal |
| `backend/seed_data.py` | Python Script | Carga de datos iniciales | [sql_y_seed.md](basededatos/sql_y_seed.md) | Documentado línea por línea | Puebla usuarios, salas y reservas iniciales |
| `backend/init_database.sql` | SQL Script | Script DDL/DML para MySQL | [sql_y_seed.md](basededatos/sql_y_seed.md) | Documentado línea por línea | Esquema SQL puro relacional |
| `backend/requirements.txt` | Texto Plano | Lista de paquetes Python | [archivos_auxiliares.md](configuracion/archivos_auxiliares.md) | Documentado línea por línea | Especifica Django, DRF, MySQL, etc. |
| `backend/config/settings.py` | Config Python | Configuración central Django | [manage_y_config.md](backend/manage_y_config.md) | Documentado línea por línea | DB, Apps, Middleware, CORS, REST Framework |
| `backend/config/urls.py` | Python Routing | Enrutador global de endpoints | [manage_y_config.md](backend/manage_y_config.md) | Documentado línea por línea | Rutas `/api/v1/` y fallback `/api/` |
| `backend/config/wsgi.py` | Python WSGI | Servidor web síncrono | [manage_y_config.md](backend/manage_y_config.md) | Documentado línea por línea | Despliegue en producción |
| `backend/config/asgi.py` | Python ASGI | Servidor web asíncrono | [manage_y_config.md](backend/manage_y_config.md) | Documentado línea por línea | Soporte de sockets y async |
| `backend/usuarios/models.py` | Python Model | Modelo `Usuario` y validadores | [app_usuarios.md](backend/app_usuarios.md) | Documentado línea por línea | Expresiones regulares, roles, password |
| `backend/usuarios/serializers.py` | DRF Serializer | Conversor de `Usuario` a JSON | [app_usuarios.md](backend/app_usuarios.md) | Documentado línea por línea | Formateo y validaciones |
| `backend/usuarios/views.py` | DRF APIView | Endpoints CRUD y Auth | [app_usuarios.md](backend/app_usuarios.md) | Documentado línea por línea | Login, Registro, CRUD Usuarios |
| `backend/usuarios/urls.py` | Python Routing | Rutas de la app `usuarios` | [app_usuarios.md](backend/app_usuarios.md) | Documentado línea por línea | `/usuarios/`, `/auth/login/`, etc. |
| `backend/usuarios/tests.py` | APITestCase | Pruebas unitarias de usuarios | [app_usuarios.md](backend/app_usuarios.md) | Documentado línea por línea | Test de login, duplicados, detalle |
| `backend/salas/models.py` | Python Model | Modelo `Sala` y validadores | [app_salas.md](backend/app_salas.md) | Documentado línea por línea | Nombre único, capacidad > 0 |
| `backend/salas/serializers.py` | DRF Serializer | Conversor de `Sala` a JSON | [app_salas.md](backend/app_salas.md) | Documentado línea por línea | Valida atributos de salas |
| `backend/salas/views.py` | DRF APIView | Endpoints CRUD de salas | [app_salas.md](backend/app_salas.md) | Documentado línea por línea | Listar, crear, modificar, borrar |
| `backend/salas/urls.py` | Python Routing | Rutas de la app `salas` | [app_salas.md](backend/app_salas.md) | Documentado línea por línea | Alias `/salas/` y `/labs/` |
| `backend/salas/tests.py` | APITestCase | Pruebas unitarias de salas | [app_salas.md](backend/app_salas.md) | Documentado línea por línea | Test de creación, borrado, validaciones |
| `backend/reservas/models.py` | Python Model | Modelo `Reserva` y solapamiento | [app_reservas.md](backend/app_reservas.md) | Documentado línea por línea | Lógica central de no superposición de horarios |
| `backend/reservas/serializers.py` | DRF Serializer | Conversor de `Reserva` a JSON | [app_reservas.md](backend/app_reservas.md) | Documentado línea por línea | Mapeo `usuarioId` / `salaId` y fechas |
| `backend/reservas/views.py` | DRF APIView | Endpoints CRUD de reservas | [app_reservas.md](backend/app_reservas.md) | Documentado línea por línea | Filtros por usuario, sala y estado |
| `backend/reservas/urls.py` | Python Routing | Rutas de la app `reservas` | [app_reservas.md](backend/app_reservas.md) | Documentado línea por línea | Aliases `/reservas/`, `/reservation/` |
| `backend/reservas/tests.py` | APITestCase | Pruebas unitarias de reservas | [app_reservas.md](backend/app_reservas.md) | Documentado línea por línea | Test de choque de horarios y creación exitosa |
| `backend/reportes/views.py` | DRF APIView | Métricas y porcentajes | [app_reportes.md](backend/app_reportes.md) | Documentado línea por línea | Ocupación promedio, conteos |
| `backend/reportes/urls.py` | Python Routing | Ruta del endpoint reportes | [app_reportes.md](backend/app_reportes.md) | Documentado línea por línea | `/reportes/` |
| `backend/reportes/tests.py` | APITestCase | Pruebas de reportes | [app_reportes.md](backend/app_reportes.md) | Documentado línea por línea | Comprueba existencia de llaves |

---

### 3. Frontend (Angular 18 / TypeScript)

| Ruta del Archivo Fuente | Tipo de Archivo | Función en el Proyecto | Instructivo Donde se Explica | Estado de Documentación | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend/.../package.json` | JSON | Configuración de paquetes NPM | [archivos_auxiliares.md](configuracion/archivos_auxiliares.md) | Documentado línea por línea | Dependencias de Angular, Express, Bootstrap |
| `frontend/.../angular.json` | JSON | Configuración del CLI de Angular | [archivos_auxiliares.md](configuracion/archivos_auxiliares.md) | Documentado por secciones | Rutas de compilación y assets |
| `frontend/.../src/main.ts` | TypeScript | Punto de entrada del cliente | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Inicializa `bootstrapApplication` |
| `frontend/.../src/app/app.config.ts` | TypeScript | Configuración Global de la App | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Proveedores de Router y HttpClient |
| `frontend/.../src/app/app.routes.ts` | TypeScript | Tabla de Rutas de Navegación | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Rutas públicas, admin y usuario |
| `frontend/.../src/app/app.ts` | TypeScript | Componente Raíz de la App | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Shell contenedor principal |
| `frontend/.../src/app/services/auth.ts` | TS Service | Servicio de Autenticación | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Manejo de LocalStorage, login/logout |
| `frontend/.../src/app/services/labs.ts` | TS Service | Servicio de Salas/Labs | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Peticiones HTTP a `/salas/` |
| `frontend/.../src/app/services/reservation.ts` | TS Service | Servicio de Reservas | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Peticiones HTTP a `/reservas/` |
| `frontend/.../src/app/services/users.ts` | TS Service | Servicio de Usuarios | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Peticiones HTTP a `/usuarios/` |
| `frontend/.../src/environments/environment.ts` | TS Env | Configuración de URLs de API | [core_y_servicios.md](frontend/core_y_servicios.md) | Documentado línea por línea | Apunta a `http://127.0.0.1:8000/api/v1` |
| Componentes Públicos (`landing`, `about`, `login`, `register`, etc.) | HTML/CSS/TS | Páginas de acceso público | [paginas_publicas.md](frontend/paginas_publicas.md) | Documentado por secciones y líneas clave | Formularios e interacción inicial |
| Componentes Admin (`salas`, `usuarios`, `reservas`, `reportes`) | HTML/CSS/TS | Gestión administrativa | [paneles_dashboard.md](frontend/paneles_dashboard.md) | Documentado por secciones y líneas clave | Tablas CRUD, modales y gráficos |
| Componentes Usuario (`espacios`, `reservar`, `confirmadas`, `historial`) | HTML/CSS/TS | Experiencia del docente | [paneles_dashboard.md](frontend/paneles_dashboard.md) | Documentado por secciones y líneas clave | Selección de horarios y visualización |

---

### 4. Archivos Excluidos de Documentación Línea por Línea

| Directorio / Archivo | Motivo de Exclusión | Explicación de Propósito |
| :--- | :--- | :--- |
| `frontend/.../node_modules/` | Dependencias externas instaladas por npm | Contiene código de librerías de terceros (Angular, Bootstrap, RxJS). No debe editarse manualmente. |
| `frontend/.../.angular/` y `dist/` | Archivos generados automáticamente | Caché y salida compilada del proceso de build. |
| `backend/.../__pycache__/` | Archivos de bytecode de Python | Generados por el intérprete de Python al ejecutar el servidor. |
| Archivos `.zip` y binarios (`.png`) | Archivos comprimidos e imágenes | Recursos estáticos y entregables en formato binario. |
