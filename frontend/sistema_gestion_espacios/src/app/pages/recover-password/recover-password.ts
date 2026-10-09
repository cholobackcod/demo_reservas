
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.html',
  styleUrls: ['./recover-password.css'],
})
export class RecoverPassword {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  recoveryForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  showSuccessMessage = false;

  onSubmit() {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    console.log('Enviando instrucciones a:', this.recoveryForm.value.email);
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }
}
