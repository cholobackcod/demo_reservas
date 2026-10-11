# 🎓 TUTORIAL_DESDE_CERO.md — Guía Didáctica para Principiantes

¡Hola! 👋 Bienvenido a este tutorial. Si recién estás empezando en el mundo de la programación y querés aprender a construir una aplicación web real desde cero, ¡llegaste al lugar indicado! 

No te preocupes si hay palabras raras: en esta guía te vamos a explicar todo de forma súper amigable, paso a paso, con paciencia y usando analogías sencillas de la vida real.

---

## 💡 ¿De qué se trata este proyecto? (Una analogía sencilla)

Imaginemos que nuestro proyecto es un **Restaurante de Computadoras y Espacios**:

1. **La Pantalla Web (Frontend - Angular)**: Es la **Carta o Menú** y la mesa donde los clientes se sientan. Es lo que ves, tocás y donde hacés clic.
2. **El Mozo (API REST - Django)**: Es la persona que toma tu pedido en la mesa, corre hasta la cocina para pedir la comida y vuelve trayéndote exactamente lo que pediste en un plato (JSON).
3. **La Cocina / Heladera (Base de Datos - MySQL)**: Es donde se guardan los ingredientes (los usuarios, los laboratorios y las reservas) de forma ordenada para que no se pierda nada.

---

## 🛠️ Paso 1: ¿Qué programas necesitamos instalar antes de empezar?

Antes de ponernos a escribir código, necesitamos tener listas nuestras herramientas en la computadora:

1. **Visual Studio Code (VS Code)**: Nuestro cuaderno de notas inteligente para escribir código.
2. **Node.js y npm**: El motor que nos permite ejecutar y construir aplicaciones web modernas.
3. **Python (versión 3.10 o superior)**: El lenguaje que usamos para construir la lógica del servidor (el mozo).
4. **MySQL y MySQL Workbench**: El programa donde guardamos y organizamos todas las tablas de nuestra base de datos (la cocina).
5. **Git**: El libro de recuerdos que nos permite guardar copias de seguridad de nuestro código.

---

## 🏗️ Paso 2: Construyendo la Cocina y el Mozo (El Backend en Django)

### 2.1 Abrir la terminal e iniciar el proyecto Python
Abrí tu terminal en VS Code y escribí estos comandos:

```bash
# Crear la carpeta del backend e ingresar a ella
mkdir backend
cd backend

# Crear un proyecto Django llamado 'config' en la carpeta actual
python -m django startproject config .
```

¿Qué hace este comando?
Django crea automáticamente los archivos base (`manage.py`, `settings.py`, `urls.py`) que son como los cimientos de una casa.

---

### 2.2 Crear las 4 aplicaciones principales
En nuestro proyecto tenemos 4 partes principales. En la terminal ejecutamos:

```bash
python manage.py startapp usuarios
python manage.py startapp salas
python manage.py startapp reservas
python manage.py startapp reportes
```

- **`usuarios`**: Se encarga de quiénes son los usuarios (administradores o docentes).
- **`salas`**: Guarda la información de los laboratorios (nombre, capacidad, si está activo).
- **`reservas`**: Se encarga de anotar qué profesor reservó qué laboratorio en qué fecha y hora.
- **`reportes`**: Hace las cuentas matemáticas para saber qué laboratorio es el más usado.

---

### 2.3 Escribiendo el Código del Backend

#### A. Definir la tabla de Usuarios (`backend/usuarios/models.py`)
Abrí el archivo `backend/usuarios/models.py` y escribe el siguiente código:

```python
from django.db import models

class Usuario(models.Model):
    ROLES = (
        ('admin', 'Administrador'),
        ('docente', 'Docente'),
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    rol = models.CharField(max_length=20, choices=ROLES, default='docente')
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
```

**Explicación fácil:**
`models.Model` le dice a Django: *"¡Creá una tabla llamada Usuario en la base de datos MySQL con columnas para nombre, apellido, email, contraseña y rol!"*.

---

#### B. Crear la Vista en `APIView` (`backend/usuarios/views.py`)
Abrí `backend/usuarios/views.py` y escribí:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioListCreateAPIView(APIView):
    def get(self, request):
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**Explicación fácil:**
- `get`: Cuando la web pide la lista de usuarios, Django va a la base de datos, los trae y los devuelve en formato JSON con código `200 OK`.
- `post`: Cuando alguien crea un nuevo usuario, Django verifica si los datos están bien. Si está todo correcto, los guarda en MySQL y devuelve `201 Created`. Si falta algún dato o el correo ya existe, devuelve `400 Bad Request`.

---

### 2.4 Cargar los datos iniciales en la Base de Datos
En la carpeta `backend` creamos un archivo llamado `seed_data.py` para cargar los datos de prueba:

```bash
python seed_data.py
```
Y para iniciar nuestro servidor backend ejecutamos:
```bash
python manage.py runserver
```
¡Genial! Nuestro backend ya está listo y escuchando en `http://127.0.0.1:8000/api/v1/`.

---

## 🅰️ Paso 3: Construyendo la Pantalla Web (El Frontend en Angular)

### 3.1 Crear la aplicación Angular
Abrí una **segunda ventana de terminal** y ejecutá:

```bash
cd frontend/sistema_gestion_espacios
npm install
```

### 3.2 Conectar el Servicio de Angular con el Backend
Abrí el archivo `src/app/services/labs.ts` y mirá cómo nos conectamos al mozo (Django):

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Lab {
  id?: number | string;
  nombre: string;
  ciclo?: string;
  descripcion?: string;
  capacidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class LabsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salas/`;

  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl);
  }
}
```

**Explicación fácil:**
- `HttpClient`: Es como un teléfono que usa Angular para llamar a la dirección de Django (`http://127.0.0.1:8000/api/v1/salas/`).
- `Observable<Lab[]>`: Significa que Angular queda esperando la respuesta del servidor y, en cuanto los datos llegan desde MySQL, actualiza la pantalla automáticamente.

---

### 3.3 Levantar la Aplicación Web
En la terminal de Angular ejecutamos:

```bash
npm start
```

Abrí tu navegador de internet en: **`http://localhost:4200/`**

---

## 🎯 Resumen: ¿Cómo encaja todo el rompecabezas?

1. **Vos hacés clic en la pantalla (Angular)** para crear o editar un usuario/reserva.
2. **Angular manda un mensaje invisible (HTTP JSON)** al servidor de Django.
3. **Django (APIView)** recibe el mensaje, comprueba que las fechas y correos sean válidos.
4. **Django guarda el dato en MySQL Workbench**.
5. **Django le responde a Angular con un OK (200/201)** y la pantalla se actualiza con los nuevos datos al instante.

¡Felicitaciones! 🎉 Ya entendés cómo funciona un proyecto web moderno completo de punta a punta (Fullstack). ¡A seguir programando!
