# Asignación de Tareas y Commits por Integrante

Este documento detalla la distribución de componentes, servicios y archivos para cada uno de los 6 integrantes del equipo, estructurado según las convenciones de commit estándar (**Conventional Commits**):

- `feat:` Nuevas funcionalidades desarrolladas.
- `fix:` Corrección de fallos o bugs.
- `docs:` Cambios o agregados en documentación.
- `style:` Formato, identación, visual o retoques de plantilla sin alterar lógica.
- `refactor:` Reestructuración u optimización del código sin cambiar comportamiento.

---

## 1. Mondadori, Giselda Soledad (DNI: 29255135)
**Sección:** *Servicios de Datos y Configuración Global (API / HTTP / Environment)*

### Archivos asignados:
- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/app/app.config.ts`
- `src/app/services/auth.ts`
- `src/app/services/labs.ts`
- `src/app/services/reservation.ts`
- `src/app/services/users.ts`
- `db.json`

### Mensajes de commit sugeridos:
1. `feat: implementar servicios de acceso a datos HttpClient para usuarios, laboratorios y reservas`
2. `fix: corregir apiUrl en environment.development.ts para resolver errores de compilacion`
3. `refactor: estructurar db.json con IDs numericos e interfaces para json-server`

---

## 2. Pierrestegui, Federico Martin (DNI: 35257982)
**Sección:** *Autenticación y Registro con Formularios Reactivos*

### Archivos asignados:
- `src/app/pages/login/login.ts`
- `src/app/pages/login/login.html`
- `src/app/pages/login/login.css`
- `src/app/pages/register/register.ts`
- `src/app/pages/register/register.html`
- `src/app/pages/register/register.css`

### Mensajes de commit sugeridos:
1. `feat: conectar login y registro con AuthService mediante formularios reactivos`
2. `fix: manejar mensajes de error y redireccion dinamica segun rol de usuario`
3. `style: ajustar maquetacion y estilos visuales de los formularios de autenticacion`

---

## 3. Osess, Gastón Faustino Alejandro (DNI: 35588172)
**Sección:** *Dashboard de Usuario - Reserva de Espacios y Validaciones*

### Archivos asignados:
- `src/app/pages/dashboard-user/reservar-espacio/reservar-espacio.ts`
- `src/app/pages/dashboard-user/reservar-espacio/reservar-espacio.html`
- `src/app/pages/dashboard-user/reservar-espacio/reservar-espacio.css`
- `src/app/pages/dashboard-user/espacios-disponibles/espacios-disponibles.ts`
- `src/app/pages/dashboard-user/espacios-disponibles/espacios-disponibles.html`

### Mensajes de commit sugeridos:
1. `feat: crear formulario reactivo para reserva de laboratorios con carga dinamica de salas`
2. `fix: agregar validacion de solapamiento de fechas y horarios para impedir reservas duplicadas`
3. `refactor: implementar ChangeDetectorRef en espacios disponibles para renderizado inmediato`

---

## 4. Monje, Sofía Florencia (DNI: 39420278)
**Sección:** *Dashboard de Usuario - Historial y Reservas Confirmadas*

### Archivos asignados:
- `src/app/pages/dashboard-user/dashboard-user.ts`
- `src/app/pages/dashboard-user/dashboard-user.html`
- `src/app/pages/dashboard-user/reservas-confirmadas/reservas-confirmadas.ts`
- `src/app/pages/dashboard-user/reservas-confirmadas/reservas-confirmadas.html`
- `src/app/pages/dashboard-user/historial-reservas/historial-reservas.ts`
- `src/app/pages/dashboard-user/historial-reservas/historial-reservas.html`

### Mensajes de commit sugeridos:
1. `feat: implementar vista de reservas confirmadas e historial de reservas del docente`
2. `fix: habilitar cancelacion de reservas mediante llamada DELETE a la API`
3. `style: aplicar insignias de estado y dar formato a las tablas del dashboard del usuario`

---

## 5. Bianchi Nuñez, Víctor Andrés (DNI: 42258135)
**Sección:** *Dashboard de Administración - Gestión de Salas y Usuarios*

### Archivos asignados:
- `src/app/pages/dashboard-admin/dashboard-admin.ts`
- `src/app/pages/dashboard-admin/dashboard-admin.html`
- `src/app/pages/dashboard-admin/salas/salas.ts`
- `src/app/pages/dashboard-admin/salas/salas.html`
- `src/app/pages/dashboard-admin/usuarios/usuarios.ts`
- `src/app/pages/dashboard-admin/usuarios/usuarios.html`

### Mensajes de commit sugeridos:
1. `feat: implementar CRUD reactivo para administracion de laboratorios y cuentas de usuarios`
2. `fix: asegurar generacion de IDs numericos secuenciales en alta de salas y usuarios`
3. `style: estructurar panel de administracion y formularios desplegables`

---

## 6. Udovich, Federico David (DNI: 42383964)
**Sección:** *Dashboard de Administración - Reservas, Reportes y Navegación Global*

### Archivos asignados:
- `src/app/shared/nav/nav.ts`
- `src/app/shared/nav/nav.html`
- `src/app/pages/dashboard-admin/reservas/reservas.ts`
- `src/app/pages/dashboard-admin/reservas/reservas.html`
- `src/app/pages/dashboard-admin/reportes/reportes.ts`
- `src/app/pages/dashboard-admin/reportes/reportes.html`

### Mensajes de commit sugeridos:
1. `feat: integrar panel de gestion de reservas con combinacion forkJoin y modulo de reportes`
2. `fix: actualizar barra de navegacion con estado de usuario activo y funcion de logout`
3. `docs: generar documentacion de comandos git y guia de commits por integrante`
