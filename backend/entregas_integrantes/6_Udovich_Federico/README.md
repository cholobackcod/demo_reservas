# ⚙️ Backend — API REST con Django REST Framework

Este directorio contiene el backend del **Sistema de Gestión de Espacios (Syntax Error)** desarrollado en **Django REST Framework (DRF)**.

---

## 🏗️ Arquitectura y Aplicaciones UML

El proyecto backend está estructurado modularmente según las capas UML definidas:

- **`usuarios/`**: Gestión de usuarios (Docentes y Administradores), autenticación (`/api/v1/auth/login/`, `/api/v1/auth/register/`) y administración CRUD (`/api/v1/usuarios/`).
- **`salas/`**: Gestión de laboratorios y espacios físicos (`/api/v1/salas/`).
- **`reservas/`**: Control y reserva de turnos con detección de solapamientos horarios y validaciones (`/api/v1/reservas/`).
- **`reportes/`**: Métricas del sistema y porcentaje de ocupación por sala (`/api/v1/reportes/`).

---

## 🛠️ Tecnologías Obligatorias Utilizadas

- **Python 3.14+**
- **Django 5.0+ / 6.0+**
- **Django REST Framework** (`APIView` en todas las vistas HTTP)
- **Django CORS Headers** (integración frontend Angular en `http://localhost:4200`)
- **Base de Datos Relacional**: MySQL / MariaDB / PostgreSQL (Script SQL incluido)

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Requisitos e Instalación de Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Migraciones e Inicialización de Datos

Ejecutar las migraciones de Django para estructurar la base de datos:

```bash
python manage.py makemigrations
python manage.py migrate
```

Cargar los datos iniciales de prueba (usuarios, laboratorios y reservas):

```bash
python seed_data.py
```

### 3. Iniciar el Servidor Backend REST

```bash
python manage.py runserver
```

El backend estará disponible en: **`http://127.0.0.1:8000/api/v1/`**

---

## 🧪 Ejecución de Pruebas Unitarias

Para ejecutar los test unitarios de DRF (vistas APIView, status codes HTTP 200, 201, 400, 404, validaciones de solapamiento y formato):

```bash
python manage.py test
```

---

## 🗄️ Base de Datos Relacional (Script SQL)

Se entrega el script completo de DDL y DML para bases de datos relacionales (PostgreSQL / MySQL / MariaDB) en el archivo:

👉 **[`init_database.sql`](file:///d:/Programacion_2_syntax_error%20demo%20gaston/backend/init_database.sql)**

Para importar el script en MySQL / PostgreSQL:

```bash
mysql -u root -p < init_database.sql
# O para PostgreSQL:
psql -U postgres -d sistema_gestion_espacios -f init_database.sql
```