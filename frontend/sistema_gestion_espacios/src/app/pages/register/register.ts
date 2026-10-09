import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { UsersService } from '../../services/users';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router);

  registerForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  });

  errorMessage = '';

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completá los campos correctamente.';
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.usersService.getUsers().subscribe({
      next: (existing) => {
        let nextId = 1;
        if (existing && existing.length > 0) {
          const numericIds = existing.map(u => Number(u.id)).filter(id => !isNaN(id));
          if (numericIds.length > 0) {
            nextId = Math.max(...numericIds) + 1;
          }
        }

        const newUser: User = {
          id: nextId,
          nombre: nombre!,
          apellido: apellido!,
          email: email!,
          password: password!,
          rol: 'docente'
        };

        this.authService.register(newUser).subscribe({
          next: () => {
            this.errorMessage = '';
            alert('Usuario registrado con éxito. Iniciá sesión.');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Error al registrar usuario:', err);
            this.errorMessage = 'No se pudo realizar el registro. Intente nuevamente.';
          }
        });
      },
      error: () => {
        const newUser: User = {
          nombre: nombre!,
          apellido: apellido!,
          email: email!,
          password: password!,
          rol: 'docente'
        };
        this.authService.register(newUser).subscribe({
          next: () => {
            alert('Usuario registrado con éxito. Iniciá sesión.');
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}
