# ⚙️ Instructivo Técnico: Backend - `manage.py` y Archivos de Configuración Global

Este documento contiene la explicación **línea por línea** de la herramienta administrativa `manage.py` y del módulo central de configuración `config/` del servidor Django.

---

## 📄 Archivo: `backend/manage.py`

### ¿Qué es este archivo?
Es el script de entrada en línea de comandos (*CLI*) que permite ejecutar tareas administrativas en Django, como iniciar el servidor de desarrollo, ejecutar migraciones o correr tests.

### ¿Para qué existe?
Evita tener que escribir comandos largos de Python configurando manualmente las variables de entorno del proyecto cada vez que queremos realizar una tarea administrativa.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1** | `#!/usr/bin/env python` | **Shebang:** Indica al sistema operativo (en Linux/macOS) que ejecute este archivo utilizando el intérprete de Python que esté activo en el entorno. |
| **2** | `"""Django's command-line utility for administrative tasks."""` | **Docstring:** Comentario descriptivo del propósito del módulo. |
| **3** | `import os` | Importa el módulo estándar `os` de Python para interactuar con variables de entorno y rutas del sistema operativo. |
| **4** | `import sys` | Importa el módulo estándar `sys` para acceder a los argumentos pasados en la línea de comandos (ej: `runserver`, `migrate`). |
| **5** | *(línea vacía)* | Separa los imports de la definición de funciones para mejorar la legibilidad. |
| **6** | *(línea vacía)* | Espaciado estandarizado por la guía PEP8 de Python. |
| **7** | `def main():` | Define la función principal `main()` donde se inicia la ejecución del script. |
| **8** | `    """Run administrative tasks."""` | Docstring explicativo de la función `main()`. |
| **9** | `    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')` | Estables la variable de entorno `DJANGO_SETTINGS_MODULE` apuntando a `config.settings` si no estaba configurada. Esto le enseña a Django dónde leer la configuración de la base de datos y las aplicaciones. |
| **10** | `    try:` | Inicia un bloque de captura de errores para intentar importar la función ejecutora de Django. |
| **11** | `        from django.core.management import execute_from_command_line` | Importa la función `execute_from_command_line` encargada de procesar la orden ingresada en la consola. |
| **12** | `    except ImportError as exc:` | Captura el error si Django no está instalado o el entorno virtual no está activado. |
| **13-17** | `        raise ImportError("Couldn't import Django...") from exc` | Lanza un mensaje de error claro explicando que falta instalar Django o activar el entorno virtual (`venv`). |
| **18** | `    execute_from_command_line(sys.argv)` | Transfiere los argumentos ingresados por la consola a Django para ejecutar la orden recibida. |
| **19** | *(línea vacía)* | Separador estructural. |
| **20** | *(línea vacía)* | Separador estructural. |
| **21** | `if __name__ == '__main__':` | Comprueba si el archivo se está ejecutando directamente desde la consola (y no siendo importado como librería desde otro archivo). |
| **22** | `    main()` | Llama a la función principal `main()`. |
| **23** | *(línea vacía)* | Salto de línea final exigido por estándares de formato de archivos fuente. |

---

## 📄 Archivo: `backend/config/settings.py`

### ¿Qué es este archivo?
Es el corazón de la configuración de Django. Contiene las claves de seguridad, las librerías activadas, los middlewares, la base de datos y los parámetros regionales.

---

### Código Explicado por Bloques Relevantes

#### 1. Rutas de Archivos y Clave de Seguridad (Líneas 5-14)
```python
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-!@qa7%!e8iibh=f#=+iv0o-soxm2xv_*2(b-*%mw3y8f(-e=7$'
DEBUG = True
ALLOWED_HOSTS = ['*']
```
- **Línea 8:** `BASE_DIR` calcula la ruta absoluta de la carpeta raíz del backend.
- **Línea 10:** `SECRET_KEY` firma digitalmente los datos sensibles.
- **Línea 12:** `DEBUG = True` habilita la pantalla de errores detallados en desarrollo.
- **Línea 14:** `ALLOWED_HOSTS = ['*']` permite que el servidor reciba peticiones desde cualquier IP o dominio en entornos locales.

---

#### 2. Aplicaciones Instaladas (Líneas 16-33)
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',

    # Local apps (UML Architecture)
    'usuarios',
    'salas',
    'reservas',
    'reportes',
]
```
- **Líneas 17-22:** Módulos predeterminados de Django (panel de administración, sistema de autenticación, sesiones de usuario, archivos estáticos).
- **Líneas 25-26:** `rest_framework` habilita Django REST Framework para construir la API JSON. `corsheaders` habilita el manejo de permisos entre dominios.
- **Líneas 29-32:** Apps propias desarrolladas para este proyecto: `usuarios`, `salas`, `reservas` y `reportes`.

---

#### 3. Middleware y Configuración CORS (Líneas 35-47)
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ...
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```
- **Línea 36:** `CorsMiddleware` se ubica en el primer lugar para interceptar peticiones entrantes del navegador y añadir la cabecera `Access-Control-Allow-Origin`.
- **Línea 46:** `CORS_ALLOW_ALL_ORIGINS = True` autoriza peticiones enviadas desde la app Angular en `localhost:4200`.

---

#### 4. Conexión a la Base de Datos (Líneas 71-83)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'sistema_gestion_espacios'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'R00t'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```
- **Línea 73:** Indica el conector del motor relacional `mysql`.
- **Líneas 74-78:** Lee credenciales desde variables de entorno o utiliza los valores por defecto locales para conectar con la base de datos `sistema_gestion_espacios`.

---

## 📄 Archivo: `backend/config/urls.py`

### ¿Qué es este archivo?
Es la tabla de enrutamiento principal. Asigna las URLs solicitadas por el navegador o cliente HTTP a cada una de las apps correspondientes.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada |
| :---: | :--- | :--- |
| **1** | `from django.contrib import admin` | Importa las vistas del panel de administración nativo de Django. |
| **2** | `from django.urls import path, include` | Importa la función `path` para crear URLs y `include` para enlazar listas de rutas secundarias. |
| **3** | *(línea vacía)* | Separador visual. |
| **4** | `urlpatterns = [` | Inicia la lista global de rutas de la aplicación. |
| **5** | `    path('admin/', admin.site.urls),` | Mapea `/admin/` al panel de administración de Django. |
| **6** | *(línea vacía)* | Separador descriptivo. |
| **7** | `    # Endpoints REST Nomenclatura v1` | Comentario explicativo de la versión 1 de la API. |
| **8** | `    path('api/v1/', include('usuarios.urls')),` | Incluye las rutas del módulo `usuarios` bajo el prefijo `/api/v1/`. |
| **9** | `    path('api/v1/', include('salas.urls')),` | Incluye las rutas del módulo `salas` bajo el prefijo `/api/v1/`. |
| **10** | `    path('api/v1/', include('reservas.urls')),` | Incluye las rutas del módulo `reservas` bajo el prefijo `/api/v1/`. |
| **11** | `    path('api/v1/', include('reportes.urls')),` | Incluye las rutas del módulo `reportes` bajo el prefijo `/api/v1/`. |
| **12** | *(línea vacía)* | Separador visual. |
| **13-17**| `    path('api/', include(...))` | Alias de compatibilidad: Permite que llamadas al prefijo `/api/` funcionen de igual forma que en `/api/v1/`. |
| **18** | `]` | Cierra el arreglo `urlpatterns`. |
