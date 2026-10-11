# 🚀 03. Guía Paso a Paso: Cómo Ejecutar el Proyecto

Este instructivo explica de principio a fin cómo preparar el entorno en tu computadora, instalar las herramientas requeridas, cargar la base de datos inicial y poner en marcha tanto el **Backend (Django)** como el **Frontend (Angular)**.

---

## 📋 1. Requisitos Previos Necesarios

Antes de empezar, asegúrate de tener instaladas las siguientes herramientas en tu sistema operativo:

1. **Python 3.10+**: Necesario para el servidor de Django. [Descargar Python](https://www.python.org/)
2. **Node.js (versión 18+ o 20+) y NPM**: Necesario para ejecutar el cliente Angular. [Descargar Node.js](https://nodejs.org/)
3. **Git**: Para clonar o administrar el código fuente.

---

## ⚙️ 2. Paso 1: Preparación y Ejecución del Backend (Servidor Django)

Abre tu consola de comandos (Terminal o PowerShell) y sigue estos pasos:

### 1. NAVEGAR A LA CARPETA DEL BACKEND
```bash
cd backend
```

### 2. CREAR Y ACTIVAR UN ENTORNO VIRTUAL DE PYTHON (RECOMENDADO)
En Windows:
```bash
python -m venv venv
venv\Scripts\activate
```
En Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. INSTALAR LAS DEPENDENCIAS
```bash
pip install -r requirements.txt
```
*(Esto instalará Django, djangorestframework, django-cors-headers, etc.)*

### 4. CREAR LAS TABLAS EN LA BASE DE DATOS (MIGRACIONES)
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. CARGAR LOS DATOS INICIALES DE PRUEBA (SEEDING)
Para cargar automáticamente usuarios, laboratorios y reservas de demostración, ejecuta el script de semillas:
```bash
python seed_data.py
```
*Deberías ver en pantalla:* `Datos iniciales cargados con éxito en la base de datos.`

### 6. INICIAR EL SERVIDOR DE DESARROLLO
```bash
python manage.py runserver 8000
```
*¡Listo! Tu Backend estará escuchando peticiones en:* `http://127.0.0.1:8000/api/v1/`

---

## 🅰️ 3. Paso 2: Preparación y Ejecución del Frontend (Cliente Angular)

Abre **otra ventana de la consola de comandos** (sin cerrar el Backend) y realiza lo siguiente:

### 1. NAVEGAR A LA CARPETA DEL FRONTEND
```bash
cd frontend/sistema_gestion_espacios
```

### 2. INSTALAR LAS DEPENDENCIAS DE NPM
```bash
npm install
```

### 3. INICIAR EL SERVIDOR DE DESARROLLO DE ANGULAR
```bash
npm start
```
*(O alternativamente: `npx ng serve --open`)*

### 4. ABRIR LA APLICACIÓN EN EL NAVEGADOR
Abre tu navegador de preferencia y entra a la siguiente dirección:
👉 `http://localhost:4200/`

---

## 🔑 4. Cuentas de Acceso de Prueba (Cargadas por `seed_data.py`)

Puedes utilizar las siguientes credenciales para probar los diferentes roles del sistema:

| Rol | Correo Electrónico | Contraseña | ¿A qué panel ingresa? |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@demo.com` | `admin123` | Panel de Administración (`/dashboard/admin`) |
| **Docente 1** | `fede@demo.com` | `1234` | Panel del Docente (`/dashboard/user`) |
| **Docente 2** | `giselda@demo.com` | `1234` | Panel del Docente (`/dashboard/user`) |
| **Docente 3** | `andres@demo.com` | `1234` | Panel del Docente (`/dashboard/user`) |

---

## 🧪 5. Cómo Ejecutar las Pruebas Automáticas

### Pruebas del Backend (Django APITestCase)
Ubicado en la carpeta `backend/`:
```bash
python manage.py test
```
*Este comando ejecutará los test unitarios de usuarios, salas, reservas y reportes.*

### Pruebas del Frontend (Angular / Vitest)
Ubicado en la carpeta `frontend/sistema_gestion_espacios/`:
```bash
npm test
```

---

## 🚨 6. Solución de Problemas Frecuentes

### Error: `No module named 'rest_framework'` o `'corsheaders'`
- **Causa:** No instalaste las dependencias en el entorno virtual de Python o no activaste el entorno virtual.
- **Solución:** Ejecuta `pip install -r requirements.txt` dentro de la carpeta `backend`.

### Error: `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Causa:** El Backend no está permitiendo peticiones del Frontend.
- **Solución:** Revisa que `settings.py` contenga `CORS_ALLOW_ALL_ORIGINS = True` y que `corsheaders.middleware.CorsMiddleware` esté en la primera posición de `MIDDLEWARE`.

### Error: `Port 8000 is already in use`
- **Causa:** Tienes otra instancia del servidor Django corriendo en segundo plano.
- **Solución:** Cierra la consola anterior o ejecuta Django en otro puerto: `python manage.py runserver 8001`.

### Error al conectar Angular con el Backend
- **Causa:** El Backend no está corriendo o el archivo `environment.ts` apunta a un puerto incorrecto.
- **Solución:** Asegúrate de que el servidor Django responda en `http://127.0.0.1:8000/api/v1/`.
