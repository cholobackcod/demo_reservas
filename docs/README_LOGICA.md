# 🧠 README_LOGICA.md — Explicación Técnica de la Actualización

Este documento detalla el razonamiento técnico, los patrones de diseño y la arquitectura aplicada en la última actualización del sistema de gestión de espacios.

---

## 1. ¿Cómo lo hiciste? (Lógica, Herramientas y Patrones)

### 🔹 Patrón API REST con `APIView` (Django REST Framework)
- **Heredabilidad Mandatoria**: Se utilizó `APIView` de `rest_framework.views` en todas las clases de vistas (`UsuarioListCreateAPIView`, `SalaListCreateAPIView`, `ReservaListCreateAPIView`, etc.) para tener control explícito sobre cada verbo HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Serialización Bidireccional**: Se crearon serializadores (`ModelSerializer`) que traducen las estructuras relacionales de Python/Django a JSON estándar y viceversa. Se aplicó mapeo personalizado (`usuarioId` ➔ `usuario`, `salaId` ➔ `sala`) para asegurar compatibilidad perfecta con las interfaces de Angular.
- **Conexión Relacional MySQL**: Se configuró la capa de persistencia en `settings.py` conectando el ORM de Django al motor relacional MySQL (`sistema_gestion_espacios` en el puerto `3306`) a través de `PyMySQL`.

### 🔹 Inyección de Servicios e Inmutabilidad en Angular
- **HttpClient & RxJS Observables**: Se reemplazó cualquier simulación de datos local (`db.json`) por llamadas HTTP asíncronas que retornan `Observable<T>`.
- **Servicios Centralizados**: Toda la interacción con la API backend se encapsuló en servicios inyectables (`AuthService`, `LabsService`, `UsersService`, `ReservationService`).

---

## 2. ¿Para qué lo hiciste? (Problema que resuelve y Mejoras)

### 🎯 Problemas Resueltos:
1. **Desacoplamiento y Hardcoding**: Anteriormente el frontend dependía de servidores mock (`json-server`) o arreglos locales. Ahora el sistema es una verdadera SPA fullstack donde los datos se persisten en una base de datos relacional de producción.
2. **Validación de Negocio Integrativa**: Se eliminó la posibilidad de guardar datos inconsistentes desde la interfaz. La lógica de negocio (por ejemplo, evitar que dos docentes reserven el mismo laboratorio en el mismo rango de hora o registrar correos duplicados) se valida de forma estricta en el backend antes de guardar en la base de datos.
3. **Consistencia Relacional**: Al utilizar claves foráneas (`FOREIGN KEY`) entre Reservas, Usuarios y Salas con eliminación en cascada (`ON DELETE CASCADE`), se garantiza que la base de datos nunca tenga registros huérfanos.

---

## 3. ¿Qué hace? (Comportamiento del Nuevo Código)

1. **Flujo de Autenticación**:
   - Cuando el usuario completa el formulario de Login, Angular envía una petición `POST /api/v1/auth/login/` con el correo y contraseña.
   - Django procesa la solicitud, busca el usuario en MySQL y, si las credenciales son válidas, responde con `HTTP 200 OK` y los datos del usuario (incluyendo su rol: `admin` o `docente`).
   - Angular almacena la sesión en `localStorage` y redirige al dashboard correspondiente según el rol.

2. **Flujo de Reservas y Detección de Solapamientos**:
   - Al intentar crear una reserva, Angular envía `POST /api/v1/reservas/` con `usuarioId`, `salaId`, `inicio` y `fin`.
   - El serializador en Django ejecuta una consulta SQL para verificar si existe alguna reserva confirmada previa en el mismo laboratorio donde `(inicio_nuevo < fin_existente AND fin_nuevo > inicio_existente)`.
   - Si existe conflicto, responde inmediatamente con `HTTP 400 Bad Request` indicando el mensaje de error. Si no hay conflicto, inserta el registro en MySQL y devuelve `HTTP 201 Created`.

3. **Impacto en Tiempo Real**:
   - Cualquier acción realizada desde la interfaz web (crear laboratorio, modificar rol de usuario, cancelar reserva) ejecuta la operación correspondiente en MySQL, permitiendo consultar los cambios de inmediato desde **MySQL Workbench**.
