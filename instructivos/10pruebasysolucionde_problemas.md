# 🧪 10. Pruebas Automatizadas y Solución de Problemas

En este instructivo se explica cómo funcionan las pruebas automatizadas del proyecto y cómo diagnosticar y solucionar los errores más comunes durante el desarrollo.

---

## 🧪 1. Pruebas Automáticas del Backend (Django APITestCase)

El backend cuenta con pruebas automáticas que verifican el correcto funcionamiento de la API REST sin necesidad de abrir el navegador.

### A. Ubicación de los Archivos de Test
- `backend/usuarios/tests.py`: Evalúa la creación de usuarios, prevención de emails duplicados y autenticación de login.
- `backend/salas/tests.py`: Evalúa el listado, creación y borrado de laboratorios.
- `backend/reservas/tests.py`: Evalúa que el sistema impida correctamente el solapamiento de horarios en la misma sala.
- `backend/reportes/tests.py`: Evalúa la generación de estadísticas globales.

### B. Cómo Ejecutar los Tests del Backend
Desde la carpeta `backend/`:
```bash
python manage.py test
```

*Ejemplo de salida exitosa esperada:*
```text
Found 12 test(s).
System check identified no issues (0 silenced).
............
----------------------------------------------------------------------
Ran 12 tests in 0.450s

OK
```

---

## 🅰️ 2. Pruebas Automáticas del Frontend (Angular Unit Tests)

El cliente Angular incluye pruebas para componentes y servicios utilizando **Vitest** y **JSDOM**.

### Cómo Ejecutar los Tests del Frontend
Desde la carpeta `frontend/sistema_gestion_espacios/`:
```bash
npm test
```

---

## 🛠️ 3. Matriz de Solución de Problemas Frecuentes

| Síntoma / Mensaje de Error | Posible Causa | Solución Paso a Paso |
| :--- | :--- | :--- |
| `no such table: usuarios_usuario` | No se aplicaron las migraciones de la base de datos | Ejecuta `python manage.py migrate` en la carpeta `backend`. |
| `ERR_CONNECTION_REFUSED` en Angular | El servidor Backend de Django está apagado | Abre una consola, entra a `backend` y ejecuta `python manage.py runserver 8000`. |
| `HTTP 400 Bad Request` al reservar | La sala seleccionada está ocupada en ese horario | Elige otro horario o selecciona un laboratorio diferente. |
| `Property 'X' does not exist on type` | Error de tipos en TypeScript durante la compilación | Revisa que el nombre de la propiedad coincida con las interfaces declaradas (`User`, `Lab`, `Reservation`). |
| `npm ERR! code ERESOLVE` | Conflicto de versiones al instalar paquetes NPM | Ejecuta `npm install --legacy-peer-deps`. |
