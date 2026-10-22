import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth';
import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  public authService = inject(AuthService);
  public reservationService = inject(ReservationService);
  private router = inject(Router);

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  get isOffline(): boolean {
    return this.reservationService.isOffline$.value;
  }

  get pendingSync(): number {
    return this.reservationService.pendingSyncCount$.value;
  }

  sincronizar(): void {
    this.reservationService.syncPendingReservations();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}