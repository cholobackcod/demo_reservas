# 📅 Instructivo Técnico: Backend - App `reservas`

Este documento contiene el análisis **línea por línea** del módulo de **Reservas y Solapamientos** (`backend/reservas/`), considerado el núcleo de la lógica de negocio de todo el proyecto.

---

## 🧱 1. Modelo de Datos (`reservas/models.py`)

### ¿Qué es este archivo?
Define el modelo `Reserva` que conecta a un usuario con una sala en un intervalo de tiempo (`inicio` a `fin`), aplicando el control de superposición de horarios.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1** | `from django.db import models` | Importa las utilidades ORM. |
| **2** | `from django.core.exceptions import ValidationError` | Importa la excepción de validación. |
| **3** | `from usuarios.models import Usuario` | Importa el modelo `Usuario` para crear la clave foránea relacional. |
| **4** | `from salas.models import Sala` | Importa el modelo `Sala` para crear la relación con el laboratorio. |
| **5** | *(línea vacía)* | Separador. |
| **6** | `class Reserva(models.Model):` | Define la clase `Reserva`. |
| **7-11**| `    ESTADOS = ( ... )` | Opciones de estado: `'confirmada'`, `'finalizada'`, `'cancelada'`. |
| **13-18**| `    usuario = models.ForeignKey(...)` | Clave foránea que referencia al docente reservante. Si se elimina el usuario, sus reservas se eliminan en cascada (`CASCADE`). |
| **19-24**| `    sala = models.ForeignKey(...)` | Clave foránea que referencia al laboratorio reservado. |
| **25** | `    inicio = models.DateTimeField(...)` | Estampa de fecha y hora de inicio del turno. |
| **26** | `    fin = models.DateTimeField(...)` | Estampa de fecha y hora de finalización del turno. |
| **27-32**| `    estado = models.CharField(...)` | Estado de la reserva, por defecto `'confirmada'`. |
| **33-36**| `    fecha_creacion = models.DateTimeField(...)` | Fecha/hora de creación automática del registro. |
| **43-61**| `    def clean(self):` | **REGLA CENTRAL:** Comprueba primero que `inicio < fin`. Luego busca en la base de datos si ya existe alguna reserva `confirmada` en la misma sala cuya franja horaria se solape con el nuevo rango solicitado. Si encuentra coincidencia, cancela la operación y lanza un `ValidationError`. |
| **62-64**| `    def save(self, *args, **kwargs):` | Forzar la validación completa (`full_clean()`) antes de persistir en la base de datos. |

---

## 🔍 2. Serializador (`reservas/serializers.py`)

```python
class ReservaSerializer(serializers.ModelSerializer):
    usuarioId = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario'
    )
    salaId = serializers.PrimaryKeyRelatedField(
        queryset=Sala.objects.all(),
        source='sala'
    )
    inicio = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    fin = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
```

### Explicación de Mapeo de Nombres:
- En Python la convención es usar guiones bajos (`usuario`, `sala`), pero en JavaScript/TypeScript la convención es usar camelCase (`usuarioId`, `salaId`).
- Las líneas 7-14 traducen automáticamente los nombres para que el cliente en Angular pueda enviar y recibir `usuarioId` y `salaId` transparentemente.
- Las líneas 16-17 formatean las fechas al estándar ISO8601 sin zona horaria local (`YYYY-MM-DDTHH:mm`) para poblar los controles `<input type="datetime-local">` de HTML.

---

## 📡 3. Vistas APIView (`reservas/views.py`)

- **`ReservaListCreateAPIView`:**
  - `get(request)`: Soporta filtrado inteligente por parámetros URL. Permite consultar:
    - `/api/v1/reservas/?usuarioId=2`: Trae solo las reservas realizadas por el docente #2.
    - `/api/v1/reservas/?salaId=1`: Trae solo el calendario de la sala #1.
  - `post(request)`: Valida la solicitud de reserva y la guarda si no hay conflictos.
- **`ReservaDetailAPIView`:**
  - `delete(pk)`: Permite cancelar/eliminar una reserva.

---

## 🧪 4. Pruebas Unitarias (`reservas/tests.py`)

Contiene la prueba `test_create_reserva_overlap_error`:
- Crea una reserva para la sala #1 mañana de 10:00 a 12:00.
- Intenta crear una segunda reserva para la misma sala #1 de 11:00 a 13:00 (solapada 1 hora).
- Evalúa que la respuesta devuelva estrictamente un código `HTTP 400 Bad Request`.
