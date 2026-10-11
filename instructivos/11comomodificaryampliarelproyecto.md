# 🛠️ 11. Guía Práctica: Cómo Modificar y Ampliar el Proyecto

Este instructivo está diseñado como un **ejercicio guiado para estudiantes**. Muestra los pasos exactos que debes seguir cuando desees agregar una nueva funcionalidad al sistema sin romper la aplicación.

---

## 🎯 1. Caso Práctico 1: Agregar un Nuevo Campo a las Salas (Ejemplo: `piso`)

Imagina que la institución necesita registrar en qué **piso** del edificio se encuentra cada laboratorio de computación.

### PASO 1: MODIFICAR EL MODELO EN EL BACKEND
Abre `backend/salas/models.py` y agrega el nuevo campo a la clase `Sala`:
```python
piso = models.IntegerField(
    default=1,
    verbose_name="Piso del Edificio"
)
```

### PASO 2: ACTUALIZAR EL SERIALIZADOR
Abre `backend/salas/serializers.py` e incluye `'piso'` en la lista `fields`:
```python
fields = ['id', 'nombre', 'ciclo', 'descripcion', 'capacidad', 'imagen', 'activa', 'piso', 'fecha_creacion']
```

### PASO 3: CREAR Y APLICAR LA MIGRACIÓN DE BASE DE DATOS
Abre la consola en la carpeta `backend/` y ejecuta:
```bash
python manage.py makemigrations
python manage.py migrate
```

### PASO 4: ACTUALIZAR LA INTERFAZ EN EL FRONTEND
Abre `frontend/sistema_gestion_espacios/src/app/services/labs.ts` y agrega la propiedad a la interfaz `Lab`:
```typescript
export interface Lab {
  id?: number | string;
  nombre: string;
  piso?: number; // <--- Nuevo campo opcional
  // ... demás campos
}
```

### PASO 5: MOSTRAR EL CAMPO EN LA PANTALLA
Abre la plantilla HTML del componente donde se listan las salas (`salas.html`) y agrega una celda en la tabla para mostrar `{{ lab.piso }}`.

¡Listo! Has modificado con éxito una característica de punta a punta (Database ➔ Backend ➔ API ➔ Frontend).

---

## 🚀 2. Reglas de Oro para Ampliar el Código

1. **Mantén los Nombres Coherentes:** Si llamas a un atributo `fecha_creacion` en Python, asegúrate de mantener la coherencia al enviarlo al cliente o documentar su mapeo.
2. **Prueba Siempre tus Cambios:** Después de tocar un archivo, ejecuta `python manage.py test` en el backend para asegurarte de no haber roto ninguna regla de negocio existente.
3. **No Modifiques Archivos Generados:** Nunca edites manualmente carpetas como `node_modules/`, `dist/` o `__pycache__/`.
