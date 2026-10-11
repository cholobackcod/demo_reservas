# ⚙️ 08. Configuración y Variables de Entorno

Este instructivo analiza los archivos de configuración que rigen el comportamiento tanto del **Backend (Django)** como del **Frontend (Angular)**.

---

## 🐍 1. Configuración del Backend (`config/settings.py`)

El archivo `settings.py` controla la configuración central de Django:

- **`SECRET_KEY`:** Clave criptográfica utilizada para firmar sesiones y cookies. *Nota de seguridad: en entornos de producción reales debe leerse desde una variable de entorno privada y nunca estar escrita en código fuente.*
- **`DEBUG = True`:** Modo de depuración activado para desarrollo. Muestra mensajes de error detallados en consola y navegador.
- **`ALLOWED_HOSTS = ['*']`:** Define qué dominios o IPs pueden conectarse al servidor.
- **`INSTALLED_APPS`:** Registra las aplicaciones propias (`usuarios`, `salas`, `reservas`, `reportes`) y de terceros (`rest_framework`, `corsheaders`).
- **`DATABASES`:** Configura el motor relacional. Por defecto está preparado para conectarse a **MySQL/MariaDB** en `localhost:3306` con la base de datos `sistema_gestion_espacios`. Permite sobreescribir usuario, clave e IP mediante variables de entorno (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).
- **`TIME_ZONE = 'America/Argentina/Buenos_Aires'`:** Define la zona horaria del servidor para la marca de tiempo de las reservas.

---

## 🅰️ 2. Configuración del Frontend (Angular & NPM)

### A. Entornos de Angular (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api/v1'
};
```
Define la dirección base de la API Backend. Si la aplicación se despliega en un servidor remoto, solo es necesario actualizar este valor.

---

### B. Gestor de Paquetes (`package.json`)
Contiene los scripts de ejecución y las versiones de las librerías:
- `"start": "ng serve"`: Inicia el servidor de desarrollo local de Angular en `http://localhost:4200/`.
- `"build": "ng build"`: Compila el proyecto en la carpeta `dist/` para producción.
- `"test": "ng test"`: Corre los test unitarios con Vitest.

---

### C. TypeScript Config (`tsconfig.json`)
Establece las reglas de compilación de TypeScript a JavaScript moderno (ES2022/ESNext), activando el modo estricto de tipos (`strict: true`).
