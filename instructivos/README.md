# 📚 Centro de Instructivos y Guías del Proyecto: Sistema de Gestión de Espacios y Reservas

Bienvenido/a a la documentación técnica, didáctica y educativa integral del **Sistema de Gestión de Espacios y Reservas** (desarrollado por la cátedra/equipo *Syntax Error*).

Este conjunto de instructivos está redactado especialmente para personas que **están dando sus primeros pasos en la programación** (estudiantes de secundaria, principiantes o curiosos del software). Aquí no solo aprenderás qué hace el proyecto, sino **cómo funciona cada pieza por dentro, por qué se programó de esa forma y cómo cada línea de código cumple un propósito vital**.

---

## 🗺️ Mapa de Navegación del Conocimiento

Para estudiar este proyecto sin frustraciones, te recomendamos seguir los documentos en este orden progresivo:

| Orden | Instructivo | ¿Qué aprenderás en este documento? |
| :---: | :--- | :--- |
| 00 | [00. Primeros Pasos y Conceptos Clave](00primerospasos.md) | Aprenderás desde cero qué es una variable, una función, una API, el Frontend, el Backend y la Base de Datos con ejemplos del mundo real. |
| 01 | [01. Mapa Completo del Proyecto](01mapacompletodelproyecto.md) | Diagramas conceptuales e interactivos (Mermaid) sobre la arquitectura global del sistema y la ruta del dato. |
| 02 | [02. Tecnologías y Herramientas](02tecnologiasy_herramientas.md) | Explicación sencilla de Python, Django, DRF, Angular, TypeScript, HTML/CSS, SQL y Git. |
| 03 | [03. Cómo Ejecutar el Proyecto](03comoejecutarelproyecto.md) | Guía paso a paso para instalar dependencias, iniciar la base de datos, levantar el servidor Backend y el cliente Frontend. |
| 04 | [04. Frontend Desde Cero](04frontenddesde_cero.md) | Guía sobre la arquitectura visual construida en Angular 18 (Componentes, Rutas, Servicios, Formularios). |
| 05 | [05. Backend Desde Cero](05backenddesde_cero.md) | Guía sobre el servidor construido con Django 5 y Django REST Framework (Modelos, Vistas, Serializadores, Rutas). |
| 06 | [06. Comunicación Frontend-Backend](06comunicacionfrontend_backend.md) | Cómo viaja la información desde los clicks del usuario hasta la base de datos mediante solicitudes HTTP y JSON. |
| 07 | [07. Base de Datos y Persistencia](07basede_datos.md) | Explicación del modelo relacional, las tablas (`usuarios_usuario`, `salas_sala`, `reservas_reserva`) y consultas SQL. |
| 08 | [08. Configuración y Variables de Entorno](08configuracionyvariablesde_entorno.md) | Cómo están configurados `settings.py`, `package.json`, `angular.json`, `environment.ts` y dependencias. |
| 09 | [09. Seguridad y Permisos](09seguridady_permisos.md) | Reglas de autenticación, roles (`admin` y `docente`), prevención de reservas duplicadas o solapadas. |
| 10 | [10. Pruebas y Solución de Problemas](10pruebasysolucionde_problemas.md) | Cómo ejecutar los tests automáticos y cómo resolver los errores más comunes de desarrollo. |
| 11 | [11. Cómo Modificar y Ampliar el Proyecto](11comomodificaryampliarelproyecto.md) | Tutorial práctico para agregar un nuevo campo, una nueva página o una nueva función sin romper la aplicación. |

---

## 🔍 Instructivos de Código Detallado (Línea por Línea)

Para entender exactamente qué hace cada archivo del proyecto, consulta los instructivos desglosados en las subcarpetas:

### ⚙️ Backend (Python + Django REST Framework)
- 📄 [manage.py y Archivos de Configuración](backend/manage_y_config.md): Explicación línea por línea de `manage.py`, `settings.py`, `urls.py`, `wsgi.py` y `asgi.py`.
- 👥 [Módulo de Usuarios](backend/app_usuarios.md): Modelos, serializadores, vistas, URLs y tests de la app `usuarios`.
- 🏫 [Módulo de Salas y Laboratorios](backend/app_salas.md): Gestión de espacios físicos, capacidades, estados y endpoints.
- 📅 [Módulo de Reservas](backend/app_reservas.md): Lógica de agendamiento, detección de conflictos de horario y validaciones.
- 📊 [Módulo de Reportes](backend/app_reportes.md): Cálculo de métricas y estadísticas globales para administradores.

### 🌐 Frontend (Angular 18 + TypeScript)
- 🚀 [Núcleo y Servicios de Angular](frontend/core_y_servicios.md): Explicación de `main.ts`, `app.config.ts`, `app.routes.ts` y los servicios HTTP (`auth.ts`, `labs.ts`, `reservation.ts`, `users.ts`).
- 🏠 [Páginas Públicas y Componentes Reutilizables](frontend/paginas_publicas.md): Funcionamiento de `landing`, `about`, `login`, `register`, `recover-password`, `not-found`, `nav` y `footer`.
- 📊 [Paneles y Dashboards](frontend/paneles_dashboard.md): Funcionamiento de `dashboard-admin` (gestión de salas, usuarios, reservas, reportes) y `dashboard-user` (reserva de espacios y consultas).

### 🗄️ Base de Datos y Scripts
- 📜 [SQL de Inicialización y Poblado de Datos](basededatos/sql_y_seed.md): Análisis detallado de `init_database.sql` y `seed_data.py`.

### 🛠️ Archivos de Configuración y Auxiliares
- 🔧 [Configuración del Sistema y Maquetado](configuracion/archivos_auxiliares.md): Análisis de `package.json`, `angular.json`, `tsconfig.json`, `requirements.txt` y archivos HTML de maqueta.

---

## 📋 Control de Cobertura y Auditoría
Si deseas comprobar qué archivos del proyecto han sido analizados y bajo qué nivel de detalle, visita el [Inventario de Documentación](INVENTARIO_DOCUMENTACION.md).

---

## 💡 ¿Por dónde empezar a estudiar?

1. Si eres **principiante absoluto**, lee primero el documentador [00. Primeros Pasos](00primerospasos.md).
2. Luego instala y ejecuta la aplicación siguiendo la [Guía de Ejecución](03comoejecutarelproyecto.md).
3. Con la aplicación corriendo en tu computadora, abre la guía del [Mapa Completo](01mapacompletodelproyecto.md) para comprender la interacción entre el navegador y el servidor.
4. Explora las secciones de código detallado cuando desees saber exactamente qué realiza una línea específica de TypeScript, Python o SQL.
