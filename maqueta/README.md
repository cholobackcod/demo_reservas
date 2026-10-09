## 📌 Introducción

En muchas organizaciones, la gestión de salas de reuniones y áreas de coworking se realiza mediante canales informales (mensajes, planillas manuales o acuerdos verbales), lo que genera superposición de turnos, pérdida de tiempo y ausencia de datos confiables sobre el uso real de los espacios.

**GestEspacios** es una aplicación web full stack que centraliza y digitaliza el proceso de reserva de espacios compartidos dentro de una empresa. Permite a los empleados consultar disponibilidad y reservar salas desde cualquier dispositivo, mientras que los administradores pueden gestionar usuarios, espacios y acceder a métricas de ocupación para tomar decisiones basadas en datos reales.

---

## ✨ Funcionalidades

### 👤 Módulo de Usuarios
- Registro e inicio de sesión con autenticación segura.
- Roles diferenciados: **Administrador** y **Usuario estándar**.
- Panel personalizado según el rol asignado.

### 📅 Módulo de Reservas
- Consulta de disponibilidad de espacios en tiempo real.
- Reserva de salas de reuniones y áreas de coworking.
- Validación automática para evitar superposición de turnos.
- Gestión y cancelación de reservas propias.

### 🛠️ Panel de Administración
- Alta, baja y modificación de espacios disponibles.
- Gestión de usuarios y asignación de roles.
- Visualización de métricas clave:
  - Espacios más solicitados.
  - Uso por franjas horarias.
  - Porcentaje de ocupación diaria.

### 🌐 Interfaz General
- Landing page informativa y accesible.
- Diseño responsivo adaptado a dispositivos móviles, tablets y escritorio.
- Navegación fluida mediante arquitectura SPA (Single Page Application).

---

## 🛠️ Tecnologías utilizadas

| Capa                  | Tecnología  |
| Frontend base         | HTML5, CSS3 |
| Modelado              | UML         |

---

## 📌 Convención de Commits

Para mantener el historial del repositorio limpio y organizado, el equipo utiliza la siguiente estructura para los mensajes de commit:

* **`feat:`** Para nuevas funcionalidades.
* **`fix:`** Resolución de fallos (bugs).
* **`docs:`** Cambios en la documentación.
* **`style:`** Ajustes de formato, puntos y comas, espacios (no afecta el funcionamiento del código).
* **`refactor:`** Cambios en el código que no alteran el comportamiento ni añaden funcionalidades (optimización).

_Ejemplo: `feat: agregar formulario de registro en el módulo de usuarios`_

---

## 🚀 Instalación y ejecución de la maqueta

La maqueta es una versión estática en HTML/CSS que representa el diseño visual del sistema, sin funcionalidad de backend.

## 🛠️ Créditos y Referencias

Este proyecto fue diseñado tomando como referencia la plantilla **Album** de Bootstrap v4.0. 

* **Plantilla original:** [Bootstrap 4.0 Album Example](https://getbootstrap.com/docs/4.0/examples/album/)

### Requisitos previos

- Navegador web moderno (Google Chrome, Firefox, Edge).
- No se requieren instalaciones adicionales.

### Pasos para ejecutar

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ISPC-TSDS/Syntax-Error.git
   ```

2. **Acceder a la carpeta de la maqueta:**
   ```bash
   cd Syntax-Error/maqueta
   ```

3. **Abrir el archivo principal en el navegador:**
   - Hacer doble clic sobre el archivo `index.html`, o
   - Arrastrarlo directamente a una ventana del navegador.

> ℹ️ La maqueta no requiere servidor ni conexión a internet. Es una representación estática de las pantallas del sistema.

---

## 👥 Equipo

| Apellido y Nombre | DNI | Usuario GitHub |

| Bianchi Nuñez, Víctor Andrés | 42258135 | [@andresbianchiispc](https://github.com/andresbianchiispc) |
| Mondadori, Giselda Soledad | 29255135 | [@G-Mon4](https://github.com/G-Mon4) |
| Monje, Sofía Florencia | 39420278 | [@somonje](https://github.com/somonje) |
| Osess, Gastón Faustino Alejandro | 35588172 | [@cholobackcod](https://github.com/cholobackcod) |
| Pierrestegui, Federico Martín | 35257982 | [@pierresteguifederico](https://github.com/pierresteguifederico) |
| Udovich, Federico David | 42383964 | [@FedeUdovich](https://github.com/FedeUdovich) |

### 🎓 Docentes a cargo

- Ivana Córsico
- Carolina Ahumada

---

## 📁 Estructura del repositorio

```
Syntax-Error/
├── maqueta/        # Prototipo estático HTML/CSS del sistema
├── frontend/       # Aplicación Angular (en desarrollo)
├── backend/        # API REST con Django (en desarrollo)
├── modelado/       # Diagramas UML y documentación de arquitectura
└── README.md       # Este archivo
```

---

## 📄 Licencia

Proyecto educativo desarrollado en el marco del ciclo lectivo 2026 del ISPC — Tecnicatura Superior en Desarrollo de Software. Todos los derechos reservados al equipo Syntax Error.