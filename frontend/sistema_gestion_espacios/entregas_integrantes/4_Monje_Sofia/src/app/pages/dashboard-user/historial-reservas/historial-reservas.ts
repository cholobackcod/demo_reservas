import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../services/reservation';
import { LabsService } from '../../../services/labs';
import { AuthService } from '../../../services/auth';
import { forkJoin } from 'rxjs';

export interface ReservaHistorialDisplay {
  id?: number | string;
  salaNombre: string;
  fecha: string;
  hora: string;
  estado: string;
}

@Component({
  selector: 'app-historial-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-reservas.html',
  styleUrl: './historial-reservas.css',
})
export class HistorialReservas implements OnInit {
  private reservationService = inject(ReservationService);
  private labsService = inject(LabsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  historial: ReservaHistorialDisplay[] = [];
  loading = true;

  ngOnInit(): void {
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

        this.historial = reservas.map(r => {
          const parts = r.inicio ? r.inicio.split('T') : ['', ''];
          return {
            id: r.id,
            salaNombre: labsMap.get(Number(r.salaId)) || `Sala #${r.salaId}`,
            fecha: parts[0] || 'N/A',
            hora: parts[1] ? `${parts[1]} hs` : 'N/A',
            estado: r.estado
          };
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar historial de reservas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
