# 🗄️ Instructivo Técnico: Base de Datos - Script SQL y `seed_data.py`

Este documento contiene la explicación **línea por línea** del script SQL puro (`backend/init_database.sql`) y del script de semillas en Python (`backend/seed_data.py`).

---

## 📜 1. Script SQL Puro (`backend/init_database.sql`)

### ¿Qué es este archivo?
Es el script DDL/DML que permite crear e inicializar la base de datos relacional directamente en un servidor **MySQL** o **MariaDB** sin utilizar Django.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **8** | `CREATE DATABASE IF NOT EXISTS sistema_gestion_espacios;` | Crea la base de datos `sistema_gestion_espacios` solo si no existía previamente. |
| **9** | `USE sistema_gestion_espacios;` | Selecciona la base de datos creada como contexto para ejecutar las siguientes sentencias. |
| **12-23**| `CREATE TABLE IF NOT EXISTS usuarios_usuario ( ... );` | Crea la tabla de usuarios con columnas `id`, `nombre`, `apellido`, `email`, `password`, `rol`, `activo`, `fecha_creacion` y restricciones CHECK para e-mail y rol. |
| **26-35**| `CREATE TABLE IF NOT EXISTS salas_sala ( ... );` | Crea la tabla de laboratorios con columnas `id`, `nombre`, `ciclo`, `descripcion`, `capacidad` (con `CHECK (capacidad > 0)`), `imagen`, `activa` y `fecha_creacion`. |
| **38-50**| `CREATE TABLE IF NOT EXISTS reservas_reserva ( ... );` | Crea la tabla de reservas con claves foráneas `usuario_id` y `sala_id` con `ON DELETE CASCADE` y restricción de fechas `CHECK (fin > inicio)`. |
| **53-56**| `CREATE INDEX idx_... ON ...;` | Crea los índices B-Tree en la base de datos para acelerar las búsquedas por email, usuario, sala y fechas. |
| **62-78**| `INSERT INTO ... VALUES (...) ON DUPLICATE KEY UPDATE ...;` | Puebla los datos iniciales de prueba (administrador, docentes, 3 laboratorios y 2 reservas confirmadas) evitando duplicar registros si se ejecuta varias veces. |

---

## 🌱 2. Script de Semillas en Python (`backend/seed_data.py`)

### ¿Qué es este archivo?
Un script ejecutable en Python que interactúa directamente con el ORM de Django para cargar los datos iniciales en cualquier motor de base de datos configurado en `settings.py` (incluyendo SQLite).

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1-2** | `import os` / `import django` | Importa librerías para configurar el entorno de Django. |
| **4-5** | `os.environ.setdefault(...)` / `django.setup()` | **CRÍTICO:** Inicializa el framework Django fuera de una petición web ordinaria, cargando los modelos y la configuración de la BD. |
| **7-11**| `from usuarios.models import Usuario ...` | Importa los modelos y utilidades de zona horaria de Django. |
| **13** | `def seed():` | Define la función sembradora principal. |
| **17-26**| `u1, _ = Usuario.objects.get_or_create(...)` | Utiliza `get_or_create` para buscar el usuario Admin por ID. Si no existe, lo crea con los valores por defecto especificados. Esto evita errores de clave duplicada. |
| **27-56**| `u2, _ = Usuario.objects.get_or_create(...)` | Crea los usuarios docentes de prueba (Federico, Giselda, Andrés). |
| **59-88**| `s1, _ = ...` / `s2, _ = ...` / `s3, _ = ...` | Crea los tres laboratorios iniciales: "Informática A" (capacidad 35), "Redes B" (capacidad 25) y "Desarrollo Software C" (capacidad 30). |
| **91-111**| `now = timezone.now()` / `r1, _ = ...` | Obtiene el momento actual y registra 2 reservas confirmadas para mañana y pasado mañana relativas a la fecha actual. |
| **115-116**| `if __name__ == '__main__': seed()` | Permite ejecutar el script directamente desde la consola mediante `python seed_data.py`. |
