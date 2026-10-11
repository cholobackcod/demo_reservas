# ⚙️ 05. Backend Desde Cero: Arquitectura Django 5 y REST Framework

En este documento se explica la estructura, diseño y funcionamiento interno del servidor Backend de la aplicación, desarrollado en **Python** con **Django 5** y **Django REST Framework (DRF)**.

---

## 🏛️ 1. Estructura Modular de Aplicaciones Django

Django organiza el proyecto en **aplicaciones (*apps*)**, donde cada una es responsable de un dominio de negocio específico:

```
backend/
├── config/             # Configuración central del proyecto
├── usuarios/           # App de gestión de cuentas y autenticación
├── salas/              # App de gestión de laboratorios/espacios
├── reservas/           # App de gestión de agenda y solapamientos
├── reportes/           # App de estadísticas y métricas
├── manage.py           # Script de comandos administrativos
├── seed_data.py        # Script para poblar la base de datos
└── init_database.sql   # Script SQL relacional puro
```

---

## 🧱 2. Los Componentes Clave del Backend

### A. Modelos (Models)
Los modelos son clases de Python que definen la estructura de las tablas de la base de datos.
- **`usuarios.Usuario`:** Define campos como `nombre`, `apellido`, `email`, `password`, `rol` ('admin' | 'docente') y `activo`.
- **`salas.Sala`:** Define `nombre`, `ciclo`, `descripcion`, `capacidad`, `imagen` y `activa`.
- **`reservas.Reserva`:** Define la clave foránea `usuario`, la clave foránea `sala`, la fecha/hora de `inicio`, `fin` y el `estado`.

---

### B. Serializadores (Serializers)
Los serializadores de DRF cumplen dos funciones vitales:
1. **Serialización:** Convertir objetos de Python/Django ORM a formato texto **JSON** para enviar al cliente.
2. **Deserialización y Validación:** Recibir texto JSON del cliente, validar que los tipos de datos sean correctos y guardarlos en la base de datos.

*Ejemplo destacado:* El serializador `ReservaSerializer` se encarga de convertir las claves relacionales `usuario` y `sala` en campos amigables `usuarioId` y `salaId` para el cliente Angular.

---

### C. Vistas Basadas en Clases (`APIView`)
En lugar de vistas síncronas tradicionales que devuelven HTML, este proyecto utiliza `APIView` para responder peticiones HTTP con códigos de estado estandarizados (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).

Cada vista implementa métodos HTTP explícitos:
- **`def get(self, request)`:** Para consultas y listados con filtros.
- **`def post(self, request)`:** Para altas y registros.
- **`def put(self, request, pk)`:** Para actualización completa.
- **`def patch(self, request, pk)`:** Para actualización parcial.
- **`def delete(self, request, pk)`:** Para bajas.

---

## 🔒 3. Regla de Negocio Crítica: Prevención de Solapamientos

La regla más importante del backend reside en los métodos `clean()` y `validate()` de la app `reservas`. 

Cuando un docente solicita reservar una sala desde una hora `inicio` hasta una hora `fin`, el servidor ejecuta una consulta con filtros temporales:

```python
solapadas = Reserva.objects.filter(
    sala=sala,
    estado='confirmada',
    inicio__lt=fin,  # Comprueba si una reserva existente empieza antes de que termine la nueva
    fin__gt=inicio   # Y termina después de que empiece la nueva
)
```

Si la consulta devuelve al menos una reserva coincidente, el servidor rechaza la solicitud inmediatamente con un código `HTTP 400 Bad Request`, evitando que dos profesores tengan reservada la misma aula al mismo tiempo.

---

## 🌐 4. Middleware y Configuración CORS

El archivo `config/settings.py` incluye el middleware `corsheaders.middleware.CorsMiddleware`. Esta herramienta adjunta las cabeceras HTTP de **CORS (Cross-Origin Resource Sharing)** a cada respuesta del servidor. Esto permite que el navegador (ejecutándose en `localhost:4200`) pueda consumir la API de Django (ejecutándose en `127.0.0.1:8000`) sin ser bloqueado por las políticas de seguridad del navegador.
