import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService, Reservation } from '../../../services/reservation';
import { UsersService } from '../../../services/users';
import { LabsService } from '../../../services/labs';
import { forkJoin } from 'rxjs';

export interface AdminReservaDisplay {
  id?: number | string;
  docenteNombre: string;
  laboratorioNombre: string;
  fecha: string;
  hora: string;
  estado: string;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private reservationService = inject(ReservationService);
  private usersService = inject(UsersService);
  private labsService = inject(LabsService);
  private cdr = inject(ChangeDetectorRef);

  reservas: AdminReservaDisplay[] = [];
  loading = true;

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;

    forkJoin({
      reservas: this.reservationService.getAllReservations(),
      users: this.usersService.getUsers(),
      labs: this.labsService.getLabs()
    }).subscribe({
      next: ({ reservas, users, labs }) => {
        const usersMap = new Map<number, string>();
        users.forEach(u => {
          if (u.id) usersMap.set(Number(u.id), `${u.nombre} ${u.apellido}`);
        });

        const labsMap = new Map<number, string>();
        labs.forEach(l => {
          if (l.id) labsMap.set(Number(l.id), l.nombre);
        });

        this.reservas = reservas.map(r => {
          const parts = r.inicio ? r.inicio.split('T') : ['', ''];
          const endParts = r.fin ? r.fin.split('T') : ['', ''];
          return {
            id: r.id,
            docenteNombre: usersMap.get(Number(r.usuarioId)) || `Usuario #${r.usuarioId}`,
            laboratorioNombre: labsMap.get(Number(r.salaId)) || `Sala #${r.salaId}`,
            fecha: parts[0] || 'N/A',
            hora: parts[1] ? `${parts[1]} - ${endParts[1] || ''}` : 'N/A',
            estado: r.estado
          };
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }


  cancelarReserva(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Desea cancelar esta reserva?')) {
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

  cambiarEstado(id?: number | string, nuevoEstado?: string): void {
    if (!id || !nuevoEstado) return;
    this.reservationService.updateReservation(id, { estado: nuevoEstado }).subscribe({
      next: () => {
        alert(`Estado de la reserva actualizado a "${nuevoEstado}".`);
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
      }
    });
  }
}