# 🏠 Instructivo Técnico: Frontend - Páginas Públicas y Componentes Reutilizables

Este instructivo analiza los componentes de la interfaz pública accesible antes de iniciar sesión y los componentes compartidos de diseño (`shared/nav` y `shared/footer`).

---

## 🧭 1. Componente de Navegación (`shared/nav/`)

### ¿Qué es este componente?
Es la barra superior de navegación presente en toda la aplicación. Adapta dinámicamente sus botones según el estado de la sesión del usuario.

---

### Código TypeScript (`nav.ts`) Explicado
```typescript
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```
- **Línea 8:** Inyecta el servicio `AuthService` directamente accesible desde la plantilla HTML.
- **Líneas 11-14:** Método `logout()`: Cierra la sesión en `localStorage` y redirige automáticamente a la pantalla `/login`.

---

### Plantilla HTML (`nav.html`) Explicada
Utiliza directivas estructurales de Angular (`*ngIf` / `@if`) para evaluar:
- Si `authService.isAuthenticated()` es `false`: Muestra los enlaces "Inicio", "Acerca de", "Iniciar Sesión" y "Registrarse".
- Si `authService.getCurrentUser()?.rol === 'admin'`: Muestra el botón directo al "Panel Admin".
- Si `authService.getCurrentUser()?.rol === 'docente'`: Muestra el botón directo al "Panel Docente".
- Si hay sesión iniciada: Muestra el nombre del usuario logueado y el botón "Cerrar Sesión".

---

## 🔑 2. Componente de Inicio de Sesión (`pages/login/`)

### Código TypeScript (`login.ts`) Explicado

```typescript
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  
  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);
        if (user.rol === 'admin') {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard/user']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Credenciales inválidas.';
      }
    });
  }
}
```
- **Líneas 10-13:** Valida que los campos del formulario no se envíen vacíos.
- **Línea 15:** Llama a `authService.login()`, el cual retorna un `Observable`.
- **Líneas 16-23 (`next`):** Si la autenticación es exitosa, guarda los datos en `localStorage` y redirige a la ruta `/dashboard/admin` o `/dashboard/user` según el rol devuelto por el servidor.
- **Líneas 24-26 (`error`):** Captura la respuesta de error enviada por Django y muestra el mensaje en la pantalla.

---

## 📝 3. Componentes Públicos Adicionales

- **`register/`:** Formulario de alta para docentes. Captura `nombre`, `apellido`, `email`, `password` y envía la petición a `authService.register()`.
- **`landing/`:** Portada de bienvenida con llamada a la acción (*CTA*) para iniciar sesión o registrarse.
- **`about/`:** Presentación del proyecto educativo, los laboratorios y el equipo *Syntax Error*.
- **`recover-password/`:** Formulario para solicitar el reestablecimiento de clave.
- **`not-found/`:** Vista de error 404 decorada que se muestra cuando la URL ingresada no coincide con ninguna ruta registrada en `app.routes.ts`.
