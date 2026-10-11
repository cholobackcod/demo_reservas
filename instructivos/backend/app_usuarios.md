# 👥 Instructivo Técnico: Backend - App `usuarios`

Este instructivo documenta detalladamente el módulo de **Usuarios y Autenticación** (`backend/usuarios/`). Explica la validación de nombres y contraseñas, el modelo ORM, los serializadores JSON, las vistas APIView, las rutas y los test unitarios.

---

## 🧱 1. Modelo de Datos (`usuarios/models.py`)

### ¿Qué es este archivo?
Define la estructura de la tabla de usuarios en la base de datos y sus reglas de validación en Python.

---

### Código Explicado Línea por Línea

| Línea | Código Original | Explicación Detallada para Principiantes |
| :---: | :--- | :--- |
| **1** | `from django.db import models` | Importa el módulo de Django para crear modelos y campos de base de datos. |
| **2** | `from django.core.exceptions import ValidationError` | Importa la clase de excepción para lanzar errores de validación de datos. |
| **3** | `import re` | Importa el módulo de expresiones regulares nativo de Python para analizar texto. |
| **4** | *(línea vacía)* | Separador. |
| **5** | `def validate_nombre_apellido(value):` | Define la función validadora personalizada para nombres y apellidos. |
| **6** | `    if not value or len(value.strip()) < 2:` | Comprueba si el texto está vacío o si tiene menos de 2 letras descartando espacios. |
| **7** | `        raise ValidationError('El campo debe tener al menos 2 caracteres.')` | Lanza un error de validación con el mensaje en español si no cumple la longitud. |
| **8** | `    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):` | Comprueba con la expresión regular que solo contenga letras (con tildes) y espacios. |
| **9** | `        raise ValidationError('El campo solo debe contener letras y espacios.')` | Lanza error si contiene números o símbolos especiales. |
| **10** | *(línea vacía)* | Separador visual. |
| **11** | `class Usuario(models.Model):` | Define la clase `Usuario` que representa la tabla en la base de datos. |
| **12-15**| `    ROLES = ( ... )` | Define una tupla de opciones para restringir los valores posibles del campo `rol` a `'admin'` o `'docente'`. |
| **17-21**| `    nombre = models.CharField(...)` | Campo de texto de hasta 100 caracteres con el validador `validate_nombre_apellido`. |
| **22-26**| `    apellido = models.CharField(...)` | Campo de texto para el apellido con validador de letras. |
| **27-32**| `    email = models.EmailField(...)` | Campo de correo electrónico con restricción `unique=True` para evitar correos duplicados. |
| **33-36**| `    password = models.CharField(...)` | Campo de texto para almacenar la contraseña del usuario. |
| **37-42**| `    rol = models.CharField(...)` | Campo para definir si es `'admin'` o `'docente'`, por defecto `'docente'`. |
| **43-46**| `    activo = models.BooleanField(...)` | Booleano para activar o suspender una cuenta sin borrarla. |
| **47-50**| `    fecha_creacion = models.DateTimeField(...)` | Asigna automáticamente la fecha y hora exacta al crear el usuario. |
| **52-55**| `    class Meta:` | Metadatos de la clase: especifica los nombres legibles en el panel admin y el orden por `id`. |
| **57-60**| `    def clean(self):` | Método de validación interna: comprueba que la contraseña tenga al menos 4 caracteres. |
| **62-64**| `    def save(self, *args, **kwargs):` | Sobreescribe el método de guardado para forzar la validación completa (`full_clean()`) antes de persisitir en la BD. |
| **66-67**| `    def __str__(self):` | Retorna una representación legible del usuario (ej: `"Federico Udovich (fede@demo.com)"`). |

---

## 🔍 2. Serializador (`usuarios/serializers.py`)

```python
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email', 'password', 'rol', 'activo', 'fecha_creacion']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
```
- **`extra_kwargs = {'password': {'write_only': True}}`:** Esta línea es crítica para la seguridad. Indica que la contraseña se puede enviar al servidor para registrarse o iniciar sesión, pero **nunca se devolverá en las respuestas JSON** del servidor hacia la pantalla del usuario.

---

## 📡 3. Vistas APIView (`usuarios/views.py`)

### A. Listar y Crear Usuarios (`UsuarioListCreateAPIView`)
- **`get(self, request)`:** Permite obtener todos los usuarios registrados. Si en la llamada se envían filtros por URL (ej: `?email=fede@demo.com`), filtra la lista en la base de datos.
- **`post(self, request)`:** Recibe los datos JSON del registro, los pasa por el serializador, valida las reglas y guarda el nuevo usuario respondiendo con código `HTTP 201 Created`.

---

### B. Inicio de Sesión (`LoginAPIView`)
```python
class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')

        try:
            usuario = Usuario.objects.get(email=email)
            if usuario.password == password:
                serializer = UsuarioSerializer(usuario)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Credenciales inválidas."}, status=status.HTTP_400_BAD_REQUEST)
        except Usuario.DoesNotExist:
            return Response({"error": "No existe un usuario con ese correo."}, status=status.HTTP_404_NOT_FOUND)
```
- **Línea 69:** Soporta tanto el campo `email` como `username` enviados por clientes legacy.
- **Línea 80:** Comprueba la coincidencia de credenciales.
- **Línea 88-92:** Si el correo no existe, devuelve una respuesta amigable `HTTP 404 Not Found`.

---

## 🧪 4. Pruebas Unitarias (`usuarios/tests.py`)

Contiene la clase `UsuarioAPITestCase` que ejecuta los siguientes test de integración:
1. `test_list_usuarios`: Verifica que la ruta GET devuelva código 200 y la lista de usuarios.
2. `test_create_usuario_success`: Verifica la creación exitosa de un usuario con datos válidos.
3. `test_create_usuario_duplicate_email`: Verifica que el servidor rechace con `HTTP 400 Bad Request` si intentamos registrar un e-mail que ya existe.
4. `test_login_success`: Simula un inicio de sesión correcto.
5. `test_login_failure`: Simula un inicio de sesión con clave equivocada.
