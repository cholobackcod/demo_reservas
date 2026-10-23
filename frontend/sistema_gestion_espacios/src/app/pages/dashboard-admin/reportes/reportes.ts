import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReservationService } from '../../../services/reservation';
import { UsersService } from '../../../services/users';
import { LabsService } from '../../../services/labs';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';

export interface StatLab {
  nombre: string;
  reservasCount: number;
  porcentaje: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private http = inject(HttpClient);
  private reservationService = inject(ReservationService);
  private usersService = inject(UsersService);
  private labsService = inject(LabsService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  totalReservas = 0;
  docentesRegistrados = 0;
  labsDisponibles = 0;
  ocupacionPromedio = 0;
  statsPorLab: StatLab[] = [];

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/reportes/`).subscribe({
      next: (data) => {
        this.totalReservas = data.totalReservas ?? 0;
        this.docentesRegistrados = data.docentesRegistrados ?? 0;
        this.labsDisponibles = data.labsDisponibles ?? 0;
        this.ocupacionPromedio = data.ocupacionPromedio ?? 0;
        this.statsPorLab = data.statsPorLab ?? [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargarFallbackLocal();
      }
    });
  }

  private cargarFallbackLocal(): void {
    forkJoin({
      reservas: this.reservationService.getAllReservations(),
      users: this.usersService.getUsers(),
      labs: this.labsService.getLabs()
    }).subscribe({
      next: ({ reservas, users, labs }) => {
        this.totalReservas = reservas.length;
        this.docentesRegistrados = users.filter(u => u.rol === 'docente').length;
        this.labsDisponibles = labs.filter(l => l.activa !== false).length;

        const totalRes = Math.max(reservas.length, 1);

        this.statsPorLab = labs.map(l => {
          const count = reservas.filter(r => Number(r.salaId) === Number(l.id)).length;
          const porcentaje = Math.round((count / totalRes) * 100);
          return {
            nombre: l.nombre,
            reservasCount: count,
            porcentaje: porcentaje
          };
        });

        if (labs.length > 0) {
          const sum = this.statsPorLab.reduce((acc, curr) => acc + curr.porcentaje, 0);
          this.ocupacionPromedio = Math.round(sum / labs.length);
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar reportes:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}