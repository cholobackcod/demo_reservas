# 💬 06. Comunicación Frontend - Backend

Este instructivo profundiza en cómo conversan el cliente en Angular y el servidor en Django. Explicará los contratos de datos, las estructuras de mensajes **JSON**, los códigos de estado HTTP y los alias de compatibilidad que garantizan un flujo de información robusto.

---

## 📡 1. Los Endpoints Principales de la API

Todas las URLs de la API están prefijadas por `/api/v1/` (con compatibilidad automática para peticiones enviadas a `/api/`):

| Dominio | Endpoint | Método HTTP | Acción Realizada | Datos Enviados en la Solicitud | Respuesta del Servidor |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Autenticación** | `/api/v1/auth/login/` | `POST` | Autenticar usuario | `{ "email", "password" }` | Objeto `User` + HTTP 200 |
| **Autenticación** | `/api/v1/auth/register/` | `POST` | Registrar docente | Datos completos de `User` | Objeto `User` + HTTP 201 |
| **Salas / Labs** | `/api/v1/salas/` | `GET` | Listar laboratorios | Ninguno | Lista `[ { Lab1 }, { Lab2 } ]` |
| **Salas / Labs** | `/api/v1/salas/` | `POST` | Crear laboratorio | `{ "nombre", "capacidad", ... }` | Objeto `Lab` creado + HTTP 201 |
| **Salas / Labs** | `/api/v1/salas/<id>/` | `DELETE` | Borrar laboratorio | ID en la URL | `{ "mensaje" }` + HTTP 200 |
| **Reservas** | `/api/v1/reservas/` | `GET` | Listar reservas | Query params opcionales | Lista `[ { Reserva1 }, ... ]` |
| **Reservas** | `/api/v1/reservas/` | `POST` | Solicitar reserva | `{ "usuarioId", "salaId", "inicio", "fin" }` | Objeto `Reserva` + HTTP 201 |
| **Reportes** | `/api/v1/reportes/` | `GET` | Obtener métricas | Ninguno | Objeto de estadísticas globales |

---

## 📦 2. Estructura de Mensajes JSON Reales

### A. Petición para Crear una Reserva (Frontend ➔ Backend)
```json
POST /api/v1/reservas/
Content-Type: application/json

{
  "usuarioId": 2,
  "salaId": 1,
  "inicio": "2026-10-15T09:00",
  "fin": "2026-10-15T11:00",
  "estado": "confirmada"
}
```

### B. Respuesta Exitosa del Servidor (Backend ➔ Frontend)
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 14,
  "usuarioId": 2,
  "salaId": 1,
  "inicio": "2026-10-15T09:00",
  "fin": "2026-10-15T11:00",
  "estado": "confirmada",
  "fecha_creacion": "2026-10-09T16:30:00Z"
}
```

### C. Respuesta de Error por Choque de Horario (Backend ➔ Frontend)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "non_field_errors": [
    "El laboratorio seleccionado ya se encuentra reservado en ese horario por otro docente."
  ]
}
```

---

## 🚦 3. Significado de los Códigos de Estado HTTP Utilizados

- **`200 OK`:** La solicitud se procesó con éxito y se devuelven los datos solicitados.
- **`201 Created`:** Se creó correctamente un nuevo registro en la base de datos (usuario, sala o reserva).
- **`400 Bad Request`:** Hubo un error en los datos enviados por el usuario (contraseña muy corta, correo duplicado o solapamiento de horarios).
- **`404 Not Found`:** El recurso buscado (por ejemplo, una sala con ID 9999) no existe en la base de datos.
- **`500 Internal Server Error`:** Ocurrió un fallo no esperado en el servidor.

---

## 🔄 4. Rutas de Compatibilidad (Aliases)

Para evitar romper componentes legacy o llamados de versiones anteriores del cliente visual, el backend configura alias en `urls.py`:
- Peticiones a `/api/v1/labs/` se redirigen internamente a la vista de `salas`.
- Peticiones a `/api/v1/reservation/` o `/api/v1/reservations/` se redirigen internamente a la vista de `reservas`.
- Peticiones recibidas sin la versión `/api/` funcionan igual que las recibidas en `/api/v1/`.
