# Guía de Comandos Git e Instalación del Proyecto

## ⚙️ 0. Instalación y Ejecución de json-server y el Proyecto

Antes de clonar o probar el proyecto localmente, asegúrate de realizar la instalación de dependencias y levantar el servidor backend de pruebas `json-server`:

### Paso A: Instalación de Dependencias
```bash
# 1. Instalar dependencias del proyecto Angular
npm install

# 2. (Opcional) Instalar json-server de forma global o local si no estuviera disponible
npm install -g json-server
```

### Paso B: Levantar el Backend de Pruebas (json-server)
En una terminal ubicada en la raíz del proyecto (`sistema_gestion_espacios`), ejecuta:
```bash
npx json-server db.json
```
> **Nota:** El servidor quedará ejecutándose en `http://localhost:3000` sirviendo las colecciones `/users`, `/labs` y `/reservation`.

### Paso C: Levantar la Aplicación Angular
En **otra terminal** distinta, ejecuta:
```bash
ng serve
```
> **Nota:** Accede a la aplicación desde tu navegador en `http://localhost:4200`.

---

## 📋 Guía de Comandos Git por Integrante

Instrucciones exactas para que cada integrante pueda subir sus cambios asignados al repositorio Git utilizando commits significativos y con formato estándar (**Conventional Commits**).

---

## 1. Mondadori, Giselda Soledad (DNI: 29255135)
```bash
# 1. Agregar archivos de servicios y configuraciones de entorno
git add src/environments/environment.ts src/environments/environment.development.ts src/app/app.config.ts src/app/services/
git commit -m "feat: implementar servicios de acceso a datos HttpClient para usuarios, laboratorios y reservas"

# 2. Agregar corrección de db.json
git add db.json
git commit -m "refactor: estructurar db.json con IDs numericos e interfaces para json-server"
```

---

## 2. Pierrestegui, Federico Martin (DNI: 35257982)
```bash
# 1. Agregar componentes de Login y Registro
git add src/app/pages/login/ src/app/pages/register/
git commit -m "feat: conectar login y registro con AuthService mediante formularios reactivos"

# 2. Agregar ajustes visuales y estilos
git add src/app/pages/login/login.css src/app/pages/register/register.css
git commit -m "style: ajustar maquetacion y estilos visuales de los formularios de autenticacion"
```

---

## 3. Osess, Gastón Faustino Alejandro (DNI: 35588172)
```bash
# 1. Agregar componente de reserva de espacio y espacios disponibles
git add src/app/pages/dashboard-user/reservar-espacio/ src/app/pages/dashboard-user/espacios-disponibles/
git commit -m "feat: crear formulario reactivo para reserva de laboratorios con carga dinamica de salas"

# 2. Agregar validación de solapamiento
git commit --allow-empty -m "fix: agregar validacion de solapamiento de fechas y horarios para impedir reservas duplicadas"
```

---

## 4. Monje, Sofía Florencia (DNI: 39420278)
```bash
# 1. Agregar reservas confirmadas e historial
git add src/app/pages/dashboard-user/dashboard-user.ts src/app/pages/dashboard-user/dashboard-user.html src/app/pages/dashboard-user/reservas-confirmadas/ src/app/pages/dashboard-user/historial-reservas/
git commit -m "feat: implementar vista de reservas confirmadas e historial de reservas del docente"

# 2. Estilos e insignias de estado
git commit --allow-empty -m "style: aplicar insignias de estado y dar formato a las tablas del dashboard del usuario"
```

---

## 5. Bianchi Nuñez, Víctor Andrés (DNI: 42258135)
```bash
# 1. Agregar gestión de salas y usuarios del administrador
git add src/app/pages/dashboard-admin/dashboard-admin.ts src/app/pages/dashboard-admin/dashboard-admin.html src/app/pages/dashboard-admin/salas/ src/app/pages/dashboard-admin/usuarios/
git commit -m "feat: implementar CRUD reactivo para administracion de laboratorios y cuentas de usuarios"

# 2. Corrección de IDs numéricos secuenciales
git commit --allow-empty -m "fix: asegurar generacion de IDs numericos secuenciales en alta de salas y usuarios"
```

---

## 6. Udovich, Federico David (DNI: 42383964)
```bash
# 1. Agregar gestión de reservas y reportes del administrador + Navbar
git add src/app/shared/nav/ src/app/pages/dashboard-admin/reservas/ src/app/pages/dashboard-admin/reportes/
git commit -m "feat: integrar panel de gestion de reservas con combinacion forkJoin y modulo de reportes"

# 2. Agregar documentación
git add README_COMMITS.md GUIA_COMANDOS_GIT.md README.md
git commit -m "docs: generar documentacion de comandos git y guia de commits por integrante"
```

---

## Comando final para subir los cambios al servidor remoto (GitHub / GitLab):
```bash
git push origin main
```
