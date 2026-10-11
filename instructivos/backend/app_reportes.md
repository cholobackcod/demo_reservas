# 📊 Instructivo Técnico: Backend - App `reportes`

Este instructivo documenta la app de **Reportes y Estadísticas** (`backend/reportes/`), encargada de calcular métricas de uso de espacios para el panel de administración.

---

## 📡 1. Vista de Cálculo de Métricas (`reportes/views.py`)

### ¿Qué es este archivo?
Calcula en tiempo real los totales de reservas, docentes activos, laboratorios disponibles y el porcentaje de ocupación por sala.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1-3** | `from rest_framework.views import APIView ...` | Importa las clases base de DRF para crear una vista API. |
| **4-6** | `from reservas.models import Reserva ...` | Importa los modelos `Reserva`, `Usuario` y `Sala` para realizar conteos y agregaciones. |
| **8** | `class ReportesAPIView(APIView):` | Define la vista del endpoint de reportes. |
| **12** | `    def get(self, request):` | Responde a solicitudes HTTP `GET`. |
| **13** | `        total_reservas = Reserva.objects.count()` | Cuenta el número total de reservas registradas en el sistema. |
| **14** | `        docentes_registrados = Usuario.objects.filter(rol='docente').count()` | Cuenta cuántos usuarios con el rol `'docente'` existen. |
| **15** | `        labs_disponibles = Sala.objects.filter(activa=True).count()` | Cuenta cuántos laboratorios están activos y disponibles. |
| **17-21**| `        salas = Sala.objects.all() ...` | Obtiene todas las salas e inicializa la variable acumuladora para calcular porcentajes. |
| **23-31**| `        for s in salas:` | Recorre sala por sala, cuenta sus reservas (`count = Reserva.objects.filter(sala=s).count()`) y calcula el porcentaje relativo sobre el total de reservas. |
| **33** | `        ocupacion_promedio = round(sum_porcentajes / max(len(salas), 1)) ...` | Calcula el promedio general de ocupación dividiendo el acumulado por el total de salas. |
| **35-41**| `        data = { ... }` | Construye el diccionario con la estructura JSON esperada por el panel de administración de Angular. |
| **43** | `        return Response(data, status=status.HTTP_200_OK)` | Retorna la respuesta HTTP 200 con la información empaquetada. |

---

## 🌐 2. Ruta y Pruebas (`reportes/urls.py` y `reportes/tests.py`)

- **`urls.py`:** Publica el endpoint bajo la dirección `/api/v1/reportes/`.
- **`tests.py`:** Verifica mediante `ReportesAPITestCase` que la respuesta contenga las llaves necesarias: `totalReservas`, `docentesRegistrados`, `labsDisponibles` y `ocupacionPromedio`.
