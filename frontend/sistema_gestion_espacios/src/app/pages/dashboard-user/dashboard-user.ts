import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './dashboard-user.html',
  styleUrl: './dashboard-user.css',
})
export class DashboardUser {
  private authService = inject(AuthService);

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }
}