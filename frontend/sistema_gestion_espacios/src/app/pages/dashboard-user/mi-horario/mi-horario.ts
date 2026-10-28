import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../services/auth';
import { DocentesService, DocenteCargaHoraria, DiaDesglose } from '../../../services/docentes';
import { Reservation, ReservationService } from '../../../services/reservation';
import { LabsService } from '../../../services/labs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-horario.html',
  styleUrl: './mi-horario.css'
})
export class MiHorario implements OnInit {
  private authService = inject(AuthService);
  private docentesService = inject(DocentesService);
  private reservationService = inject(ReservationService);
  private labsService = inject(LabsService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  horarioData: DocenteCargaHoraria | null = null;
  loading = true;
  reservasUsuario: Reservation[] = [];
  nombresLaboratorios = new Map<string, string>();
  summaryOpen = false;
  fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' }
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarDatos();
  }

  cargarDatos(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.loading = false;
      return;
    }

    this.loading = true;
    forkJoin({
      horario: this.docentesService.getMiHorario(this.currentUser.id),
      reservas: this.reservationService.getReservationsByUser(this.currentUser.id),
      laboratorios: this.labsService.getLabs()
    }).subscribe({
      next: ({ horario, reservas, laboratorios }) => {
        this.horarioData = horario;
        this.reservasUsuario = reservas
          .filter(reserva => reserva.estado !== 'cancelada')
          .sort((a, b) => a.inicio.localeCompare(b.inicio));
        this.nombresLaboratorios = new Map(
          laboratorios.map(laboratorio => [String(laboratorio.id), laboratorio.nombre])
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar mi horario:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  nombreLaboratorio(salaId: number | string): string {
    return this.nombresLaboratorios.get(String(salaId)) || `Sala #${salaId}`;
  }

  formatearFechaReserva(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return Number.isNaN(fecha.getTime()) ? fechaHora : fecha.toLocaleDateString('es-AR');
  }

  formatearHoraReserva(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return Number.isNaN(fecha.getTime())
      ? fechaHora
      : fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  getDesgloseDia(diaKey: string): DiaDesglose | null {
    if (!this.horarioData || !this.horarioData.desgloseDias) return null;
    return (this.horarioData.desgloseDias as any)[diaKey] || null;
  }

  imprimirHorario(): void {
    window.print();
  }

  badgeClase(tipo?: string): string {
    switch (tipo) {
      case 'tutoria': return 'bg-info text-dark border border-info-subtle';
      case 'taller': return 'bg-warning text-dark border border-warning-subtle';
      case 'club': return 'bg-success text-white border border-success-subtle';
      default: return 'bg-primary text-white border border-primary-subtle';
    }
  }
}
