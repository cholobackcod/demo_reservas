import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService, Reservation } from '../../../services/reservation';
import { LabsService, Lab } from '../../../services/labs';
import { AuthService } from '../../../services/auth';
import { forkJoin } from 'rxjs';

export interface ReservaDisplay {
  id?: number | string;
  salaNombre: string;
  inicio: string;
  fin: string;
  estado: string;
}

@Component({
  selector: 'app-reservas-confirmadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-confirmadas.html',
  styleUrl: './reservas-confirmadas.css',
})
export class ReservasConfirmadas implements OnInit {
  private reservationService = inject(ReservationService);
  private labsService = inject(LabsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  reservas: ReservaDisplay[] = [];
  loading = true;

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id ? Number(currentUser.id) : 2;

    forkJoin({
      reservas: this.reservationService.getReservationsByUser(userId),
      labs: this.labsService.getLabs()
    }).subscribe({
      next: ({ reservas, labs }) => {
        const labsMap = new Map<number, string>();
        labs.forEach(l => {
          if (l.id) labsMap.set(Number(l.id), l.nombre);
        });

        this.reservas = reservas
          .filter(r => r.estado === 'confirmada')
          .map(r => ({
            id: r.id,
            salaNombre: labsMap.get(Number(r.salaId)) || `Sala #${r.salaId}`,
            inicio: r.inicio.replace('T', ' - ') + ' hs',
            fin: r.fin.replace('T', ' - ') + ' hs',
            estado: r.estado
          }));

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar reservas confirmadas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }


  cancelarReserva(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          alert('Reserva cancelada correctamente.');
          this.cargarReservas();
        },
        error: (err) => {
          console.error('Error al cancelar reserva:', err);
          alert('No se pudo cancelar la reserva.');
        }
      });
    }
  }
}