# 🛠️ 02. Tecnologías y Herramientas del Proyecto

En este instructivo exploraremos las tecnologías, herramientas, lenguajes de programación y librerías utilizadas para construir el **Sistema de Gestión de Espacios y Reservas**.

---

## 🐍 1. Tecnologías del Backend (Servidor)

### A. Python 3.x
- **¿Qué es?** Es un lenguaje de programación de alto nivel, famoso por su sintaxis clara, legible y muy similar al idioma inglés.
- **¿Para qué sirve en este proyecto?** Es el lenguaje base en el que está escrito todo el servidor de la aplicación.
- **¿Por qué se eligió?** Permite escribir reglas de negocio complejas en pocas líneas de código sin sacrificar legibilidad.

---

### B. Django 5.x
- **¿Qué es?** Es un marco de trabajo (*framework*) de desarrollo web para Python de grado profesional. Sigue el principio de "baterías incluidas", lo que significa que incluye herramientas de seguridad, administración y manejo de bases de datos listas para usar.
- **¿Para qué sirve en este proyecto?** Administra la estructura de las aplicaciones (`usuarios`, `salas`, `reservas`, `reportes`), gestiona la conexión a la base de datos a través de su **ORM** (*Object-Relational Mapping*) y ejecuta las migraciones de esquemas.

---

### C. Django REST Framework (DRF)
- **¿Qué es?** Una extensión o potente librería para Django diseñada específicamente para construir APIs RESTful de forma rápida y estandarizada.
- **¿Para qué sirve en este proyecto?** Proporciona las clases `APIView` para crear los endpoints y los `Serializers` para transformar modelos de Python en mensajes **JSON** que entiende el cliente visual.

---

### D. Base de Datos Relacional (MySQL / MariaDB / SQLite)
- **¿Qué es?** Un sistema de gestión de base de datos relacional (RDBMS) que almacena la información organizada en tablas con filas y columnas conectadas por claves foráneas.
- **¿Para qué sirve en este proyecto?** Almacena de manera segura la información persistente de docentes, laboratorios y reservas confirmadas.

---

## 🅰️ 2. Tecnologías del Frontend (Cliente Visual)

### A. Angular 18
- **¿Qué es?** Es un *framework* de desarrollo web creado por Google para construir aplicaciones web de una sola página (SPA - *Single Page Application*).
- **¿Para qué sirve en este proyecto?** Construye toda la interfaz de usuario interactiva. Al ser una SPA, cuando el usuario navega entre pantallas, la página no se recarga completamente; solo cambia el contenido dinámico de forma instantánea.

---

### B. TypeScript
- **¿Qué es?** Es un superconjunto (*superset*) de JavaScript desarrollado por Microsoft que añade **tipado estático** (declaración explícita de tipos de datos como `number`, `string`, `boolean`).
- **¿Para qué sirve en este proyecto?** Todo el código de la lógica visual del Frontend está escrito en TypeScript. Esto evita errores comunes en tiempo de compilación antes de que la aplicación llegue al usuario.

---

### C. RxJS (Reactive Extensions for JavaScript)
- **¿Qué es?** Una librería para programación reactiva que utiliza el patrón *Observable* para gestionar flujos de datos asíncronos y eventos.
- **¿Para qué sirve en este proyecto?** Maneja las respuestas de las peticiones HTTP que vienen del servidor, permitiendo suscribirse a los resultados y reaccionar ante éxitos o errores.

---

### D. HTML5, CSS3 y Bootstrap 5
- **HTML5:** Define la estructura y el esqueleto de las páginas web (botones, títulos, campos de texto).
- **CSS3:** Aplica los estilos visuales (colores, bordes, sombras, diseño responsivo para celulares y computadoras).
- **Bootstrap 5:** Marco de trabajo CSS que proporciona componentes prediseñados como tarjetas (*cards*), modales, menús de navegación y sistemas de grillas.

---

## 🔌 3. Protocolos y Formatos de Intercambio

### A. JSON (JavaScript Object Notation)
- **¿Qué es?** Un formato de texto ligero y fácil de leer para el intercambio de datos entre computadoras.
- **Ejemplo real de JSON en este proyecto:**
  ```json
  {
    "id": 1,
    "nombre": "Laboratorio Informática A",
    "capacidad": 35,
    "ciclo": "Ciclo Básico",
    "activa": true
  }
  ```

---

### B. REST (Representational State Transfer) e HTTP
- Arquitectura de comunicación basada en el protocolo web estándar (HTTP).
- Utiliza las URLs para identificar recursos y los métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`) para indicar la acción deseada.

---

## 🧰 4. Herramientas de Desarrollo y Administración

| Herramienta | Función Principal |
| :--- | :--- |
| **Git** | Sistema de control de versiones para registrar el historial de cambios del código. |
| **NPM (Node Package Manager)** | Gestor de paquetes de Node.js que instala y administra las librerías del Frontend (Angular, Bootstrap). |
| **pip** | Gestor de paquetes de Python para instalar las dependencias del Backend (Django, DRF, Cors-headers). |
| **manage.py** | Herramienta CLI de Django para ejecutar el servidor de desarrollo, migraciones y pruebas. |
