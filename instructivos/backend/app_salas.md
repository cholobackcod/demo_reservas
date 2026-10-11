# 🏫 Instructivo Técnico: Backend - App `salas`

Este documento contiene la explicación **línea por línea** de la app de **Salas y Laboratorios** (`backend/salas/`).

---

## 🧱 1. Modelo de Datos (`salas/models.py`)

### ¿Qué es este archivo?
Define la entidad `Sala` que representa los laboratorios de computación o aulas físicas disponibles para ser reservadas.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1** | `from django.db import models` | Importa las utilidades de ORM de Django. |
| **2** | `from django.core.validators import MinValueValidator` | Importa el validador de número mínimo para asegurar capacidades positivas. |
| **3** | `from django.core.exceptions import ValidationError` | Importa la excepción de validación. |
| **4** | *(línea vacía)* | Separador visual. |
| **5-7** | `def validate_nombre_sala(value): ...` | Valida que el nombre del laboratorio no esté vacío y tenga al menos 3 caracteres. |
| **9** | `class Sala(models.Model):` | Clase que representa la tabla `salas_sala` en la base de datos SQL. |
| **10-16**| `    nombre = models.CharField(...)` | Campo de texto único (`unique=True`) para el nombre de la sala (ej: "Laboratorio Informática A"). |
| **17-21**| `    ciclo = models.CharField(...)` | Indica el nivel educativo o ciclo al que pertenece el espacio ("Ciclo Básico" / "Ciclo Superior"). |
| **22-26**| `    descripcion = models.TextField(...)` | Descripción detallada de las computadoras y equipos disponibles. |
| **27-30**| `    capacidad = models.IntegerField(...)` | Capacidad máxima de alumnos. Aplica `MinValueValidator(1)` para evitar capacidades menores a 1. |
| **31-36**| `    imagen = models.CharField(...)` | URL o ruta a una imagen ilustrativa del laboratorio. |
| **37-40**| `    activa = models.BooleanField(...)` | Booleano para inhabilitar temporalmente una sala por mantenimiento sin borrar sus reservas históricas. |
| **41-44**| `    fecha_creacion = models.DateTimeField(...)` | Fecha y hora de alta del espacio. |
| **46-49**| `    class Meta:` | Metadatos legibles para el panel admin. |
| **51-53**| `    def save(self, *args, **kwargs):` | Ejecuta `self.full_clean()` para forzar las validaciones antes de guardar. |
| **55-56**| `    def __str__(self):` | Devuelve el nombre y la capacidad (ej: `"Laboratorio Informática A (Capacidad: 35)"`). |

---

## 🔍 2. Serializador (`salas/serializers.py`)

```python
class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ['id', 'nombre', 'ciclo', 'descripcion', 'capacidad', 'imagen', 'activa', 'fecha_creacion']

    def validate_capacidad(self, value):
        if value <= 0:
            raise serializers.ValidationError('La capacidad debe ser un número entero mayor a 0.')
        return value
```
- **`validate_capacidad()`:** Garantiza a nivel de API que si el cliente envía una capacidad de 0 o negativa, el servidor responda con un error `HTTP 400 Bad Request`.

---

## 📡 3. Vistas APIView (`salas/views.py`)

- **`SalaListCreateAPIView`:**
  - `get()`: Retorna el arreglo JSON con todas las salas almacenadas.
  - `post()`: Recibe el formulario de alta de una nueva sala (usado por el Administrador).
- **`SalaDetailAPIView`:**
  - `get(pk)`: Devuelve el detalle de una sala específica mediante su ID.
  - `put(pk)` / `patch(pk)`: Actualiza los campos de una sala (ej: cambiar la capacidad o la imagen).
  - `delete(pk)`: Elimina la sala de la base de datos.

---

## 🌐 4. Rutas (`salas/urls.py`)

```python
urlpatterns = [
    path('salas/', SalaListCreateAPIView.as_view(), name='sala-list-create'),
    path('salas/<int:pk>/', SalaDetailAPIView.as_view(), name='sala-detail'),
    # Alias /labs/ for Angular frontend backward compatibility
    path('labs/', SalaListCreateAPIView.as_view(), name='lab-list-create'),
    path('labs/<int:pk>/', SalaDetailAPIView.as_view(), name='lab-detail'),
]
```
Configura las URLs del recurso e incluye los alias `/labs/` para que los servicios de Angular que consumen la nomenclatura en inglés sigan funcionando sin inconvenientes.
