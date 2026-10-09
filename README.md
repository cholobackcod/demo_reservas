# 🏢 Syntax Error — Sistema de Gestión de Espacios

## 📌 Descripción general

Este repositorio contiene el proyecto de una aplicación web para gestionar la reserva y administración de espacios compartidos, con foco en laboratorios docentes de la institución. La solución está pensada para facilitar la consulta de disponibilidad, la reserva de turnos y la administración de usuarios y reportes.

La parte principal del desarrollo actual está en el frontend Angular, que presenta una landing page, paneles para docentes y administración, formularios y navegación por rutas.

---

## ✨ Funcionalidades principales

### 👤 Frontend
- Landing page institucional.
- Login, registro y recuperación de contraseña.
- Dashboard para usuario/docente.
- Dashboard para administrador.
- Visualización de laboratorios disponibles.
- Reserva de laboratorio con fecha y horario.
- Consulta de reservas confirmadas.
- Historial de reservas.
- Gestión de usuarios, reservas y reportes en la vista administrativa.
- Páginas de error 404 y navegación con Angular Router.

### 📅 Flujo de usuario
- Consultar laboratorios disponibles.
- Reservar un espacio con fecha y horario.
- Ver reservas confirmadas.
- Revisar el historial de reservas previas.

### 🛠️ Panel administrativo
- Administrar laboratorios.
- Gestionar reservas realizadas.
- Gestionar docentes/usuarios del sistema.
- Visualizar reportes y métricas de uso.

---

## 🧩 Tecnologías utilizadas

### Frontend
- Angular 21
- TypeScript
- HTML5
- CSS3
- Bootstrap 5
- Angular Router
- Reactive Forms
- RxJS

### Estructura general
- SPA con Angular
- Componentes standalone
- Rutas principales y rutas hijas
- Diseño responsive

### Backend
- El proyecto contempla una capa backend en desarrollo, con enfoque en integración futura con la aplicación web.

### Modelado
- Documentación y diagramas del sistema en la carpeta de modelado.

---

## 🚀 Requisitos previos

Necesitás tener instalado:

- Node.js 18 o superior
- npm 9 o superior
- Git
- Un navegador web moderno

Verificá la versión con:

```bash
node -v
npm -v
```

---

## 📥 Instalación

Cloná el repositorio:

```bash
git clone https://github.com/ISPC-TSDS/Syntax-Error.git
```

Entrá al proyecto:

```bash
cd Syntax-Error
```

Luego instalá las dependencias del frontend:

```bash
cd frontend/sistema_gestion_espacios
npm install
```

---

## ▶️ Ejecución en desarrollo

Para levantar la aplicación localmente:

```bash
npm start
```

O bien:

```bash
npx ng serve
```

La aplicación estará disponible en:

```text
http://localhost:4200/
```

---

## 🏗️ Generación de build

Para compilar el proyecto para producción:

```bash
npm run build
```

El resultado se genera en la carpeta:

```text
dist/
```

---

## 🧪 Ejecución de pruebas

Para correr las pruebas del proyecto:

```bash
npm test
```

---

## 🧭 Rutas principales actuales

La aplicación Angular utiliza rutas como estas:

| Ruta | Descripción |
| --- | --- |
| `/` | Landing page |
| `/about` | Quiénes somos |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/recover-password` | Recuperar contraseña |
| `/dashboard/admin` | Dashboard administrador |
| `/dashboard/admin/salas` | Administrar salas/laboratorios |
| `/dashboard/admin/reservas` | Gestionar reservas |
| `/dashboard/admin/usuarios` | Gestionar usuarios/docentes |
| `/dashboard/admin/reportes` | Ver reportes |
| `/dashboard/user` | Dashboard docente/usuario |
| `/dashboard/user/espacios` | Laboratorios disponibles |
| `/dashboard/user/reservar` | Reservar laboratorio |
| `/dashboard/user/reservas` | Reservas confirmadas |
| `/dashboard/user/historial` | Historial de reservas |

Las rutas inexistentes se manejan con una página 404 personalizada.

---

## 📁 Estructura del repositorio

```text
Syntax-Error/
├── README.md
├── frontend/
│   └── sistema_gestion_espacios/
│       ├── angular.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── public/
│       └── src/
│           ├── app/
│           │   ├── pages/
│           │   │   ├── landing/
│           │   │   ├── about/
│           │   │   ├── login/
│           │   │   ├── register/
│           │   │   ├── recover-password/
│           │   │   ├── dashboard-admin/
│           │   │   ├── dashboard-user/
│           │   │   └── not-found/
│           │   ├── shared/
│           │   ├── app.routes.ts
│           │   ├── app.ts
│           │   └── app.css
│           ├── index.html
│           ├── main.ts
│           └── styles.css
├── backend/
│   └── ...
├── modelado/
│   └── ...
└── maqueta/
    └── ...
```

---

## 👥 Equipo

| Apellido y Nombre | DNI | Usuario GitHub |
| --- | ---: | --- |
| Bianchi Nuñez, Víctor Andrés | 42258135 | [@andresbianchiispc](https://github.com/andresbianchiispc) |
| Mondadori, Giselda Soledad | 29255135 | [@G-Mon4](https://github.com/G-Mon4) |
| Monje, Sofía Florencia | 39420278 | [@somonje](https://github.com/somonje) |
| Osess, Gastón Faustino Alejandro | 35588172 | [@cholobackcod](https://github.com/cholobackcod) |
| Pierrestegui, Federico Martín | 35257982 | [@pierresteguifederico](https://github.com/pierresteguifederico) |
| Udovich, Federico David | 42383964 | [@FedeUdovich](https://github.com/FedeUdovich) |

### 🎓 Docentes a cargo
- Ivana Córsico
- Carolina Ahumada

---

## 📄 Licencia

Proyecto educativo desarrollado en el marco del ciclo lectivo 2026 del ISPC — Tecnicatura Superior en Desarrollo de Software.

Todos los derechos reservados al equipo Syntax Error.
