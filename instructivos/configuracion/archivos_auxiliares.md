# 🔧 Instructivo Técnico: Archivos de Configuración y Material Auxiliar

Este instructivo analiza los archivos de gestión de dependencias, configuraciones de compiladores, herramientas de formateo y maquetas del proyecto.

---

## 📦 1. Archivo: `frontend/sistema_gestion_espacios/package.json`

### ¿Qué es este archivo?
Es el manifiesto del proyecto Node.js/Angular. Registra el nombre, la versión, los scripts de ejecución y las librerías externas necesarias para que funcione la interfaz visual.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **2** | `"name": "sistema-gestion-espacios"` | Nombre del paquete en el ecosistema Node.js. |
| **3** | `"version": "0.0.0"` | Versión actual de desarrollo. |
| **5** | `"ng": "ng"` | Alias para ejecutar comandos del CLI de Angular. |
| **6** | `"start": "ng serve"` | Script principal para iniciar el servidor web local (`npm start`). |
| **7** | `"build": "ng build"` | Compila la aplicación para producción en archivos estáticos HTML/JS/CSS dentro de `dist/`. |
| **9** | `"test": "ng test"` | Ejecuta las pruebas unitarias automáticas con Vitest. |
| **14-28**| `"dependencies": { ... }` | **Librerías de Producción:** Incluye `@angular/core`, `@angular/router`, `@angular/common` (v21.2), `bootstrap` (v5.3.8 para estilos), `rxjs` (para asincronía) y `express` (para SSR). |
| **29-39**| `"devDependencies": { ... }` | **Herramientas de Desarrollo:** Incluye `@angular/cli`, `typescript` (v5.9.2), `prettier` (para formatear código) y `vitest` (ejecutor de pruebas). |

---

## 🐍 2. Archivo: `backend/requirements.txt`

### ¿Qué es este archivo?
Contiene la lista de librerías de Python requeridas por el servidor Django.

```text
Django>=5.0.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
psycopg2-binary>=2.9.0
mysqlclient>=2.2.0
```
- **`Django>=5.0.0`:** El framework web principal.
- **`djangorestframework>=3.14.0`:** La librería para construir las vistas APIView y serializadores JSON.
- **`django-cors-headers>=4.0.0`:** El middleware para autorizar peticiones cross-origin desde Angular.
- **`mysqlclient>=2.2.0`:** El conector C/Python para interactuar con bases de datos MySQL/MariaDB.
- **`psycopg2-binary>=2.9.0`:** El conector para compatibilidad opcional con PostgreSQL.

---

## 🎨 3. Carpeta de Maquetación (`maqueta/`)

La carpeta `maqueta/` contiene prototipos HTML/CSS estáticos realizados durante la fase inicial de diseño del proyecto:
- `index.html`: Boceto inicial de la portada.
- `login.html` / `register.html`: Bocetos de los formularios de acceso.
- `dashboard_admin.html` / `dashboard_user.html`: Bocetos estáticos de las pantallas privadas.

*Nota didáctica:* Estos archivos sirvieron como referencia visual antes de migrar y dinamizar los componentes dentro de Angular. No forman parte de la ejecución en tiempo de real pero se conservan como documentación de diseño.

---

## 📐 4. Carpeta de Modelado (`modelado/`)

Contiene los diagramas conceptuales de base de datos en formato imagen:
- `DER Sistema de Gestión de Reservas.png`: Diagrama Entidad-Relación original.
- `MR Sistema de Gestión de Reservas.png`: Modelo Relacional con claves primarias y foráneas.
