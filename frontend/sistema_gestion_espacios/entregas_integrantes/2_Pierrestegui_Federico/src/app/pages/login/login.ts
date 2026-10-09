import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completá los campos correctamente.';
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!).subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          const user = users[0];
          this.authService.setCurrentUser(user);
          this.errorMessage = '';
          if (user.rol === 'admin') {
            this.router.navigate(['/dashboard/admin']);
          } else {
            this.router.navigate(['/dashboard/user']);
          }
        } else {
          this.errorMessage = 'Email o contraseña incorrectos.';
        }
      },
      error: (err) => {
        console.error('Error durante inicio de sesión:', err);
        this.errorMessage = 'Error de conexión con el servidor backend.';
      }
    });
  }
}