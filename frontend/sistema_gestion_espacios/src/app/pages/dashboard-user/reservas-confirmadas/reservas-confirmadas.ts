import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService, Reservation } from '../../../services/reservation';
import { LabsService, Lab } from '../../../services/labs';
import { AuthService } from '../../../services/auth';
import { forkJoin } from 'rxjs';

export interface ReservaDisplay {
  id?: number | string;
  salaId: number | string;
  salaNombre: string;
  inicio: string;
  fin: string;
  rawInicio: string;
  rawFin: string;
  curso?: string;
  materia?: string;
  netbooks?: number;
  estado: string;
  offline?: boolean;
}

@Component({
  selector: 'app-reservas-confirmadas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservas-confirmadas.html',
  styleUrl: './reservas-confirmadas.css',
})
export class ReservasConfirmadas implements OnInit {
  private reservationService = inject(ReservationService);
  private labsService = inject(LabsService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  reservas: ReservaDisplay[] = [];
  labs: Lab[] = [];
  loading = true;

  // HU04: Modal de edición de reservas propias
  reservaEnEdicion: ReservaDisplay | null = null;
  editForm!: FormGroup;
  guardandoEdicion = false;
  errorEdicion = '';
  exitoMensaje = '';

  cursosDisponibles: string[] = [
    '1° Año A',
    '1° Año B',
    '2° Año A',
    '2° Año B',
    '3° Año A',
    '3° Año B',
    '4° Año Informática',
    '5° Año Informática',
    '6° Año Informática'
  ];

  materiasDisponibles: string[] = [
    'Programación',
    'Bases de Datos',
    'Sistemas Operativos',
    'Redes y Telecomunicaciones',
    'Desarrollo Web',
    'Robótica',
    'Matemática',
    'Física',
    'Lengua y Literatura',
    'Inglés Técnico'
  ];

  hoyFecha = this.getHoyLocal();

  private getHoyLocal(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.editForm = this.fb.group({
      salaId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaDesde: ['', Validators.required],
      horaHasta: ['', Validators.required],
      curso: ['', Validators.required],
      materia: ['', Validators.required],
      netbooks: [0, [Validators.required, Validators.min(0), Validators.max(45)]]
    });

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
        this.labs = labs.filter(l => l.activa !== false);
        const labsMap = new Map<number, string>();
        labs.forEach(l => {
          if (l.id) labsMap.set(Number(l.id), l.nombre);
        });

        this.reservas = reservas
          .filter(r => r.estado === 'confirmada')
          .map(r => ({
            id: r.id,
            salaId: r.salaId,
            salaNombre: labsMap.get(Number(r.salaId)) || `Sala #${r.salaId}`,
            inicio: r.inicio.replace('T', ' - ') + ' hs',
            fin: r.fin.replace('T', ' - ') + ' hs',
            rawInicio: r.inicio,
            rawFin: r.fin,
            curso: r.curso || 'No especificado',
            materia: r.materia || 'No especificada',
            netbooks: r.netbooks || 0,
            estado: r.estado,
            offline: r.offline
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

  // HU04: Abrir modal de edición con los datos actuales
  abrirModalEdicion(reserva: ReservaDisplay): void {
    this.reservaEnEdicion = reserva;
    this.errorEdicion = '';

    const fecha = reserva.rawInicio.includes('T') ? reserva.rawInicio.split('T')[0] : '';
    const horaDesde = reserva.rawInicio.includes('T') ? reserva.rawInicio.split('T')[1].substring(0, 5) : '08:00';
    const horaHasta = reserva.rawFin.includes('T') ? reserva.rawFin.split('T')[1].substring(0, 5) : '10:00';

    this.editForm.patchValue({
      salaId: Number(reserva.salaId),
      fecha: fecha,
      horaDesde: horaDesde,
      horaHasta: horaHasta,
      curso: reserva.curso && reserva.curso !== 'No especificado' ? reserva.curso : '4° Año Informática',
      materia: reserva.materia && reserva.materia !== 'No especificada' ? reserva.materia : 'Programación',
      netbooks: reserva.netbooks || 0
    });

    this.cdr.markForCheck();
  }

  cerrarModalEdicion(): void {
    this.reservaEnEdicion = null;
    this.errorEdicion = '';
    this.cdr.markForCheck();
  }

  guardarEdicion(): void {
    if (!this.reservaEnEdicion || !this.reservaEnEdicion.id) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.errorEdicion = 'Por favor, completá todos los campos correctamente.';
      return;
    }

    const val = this.editForm.value;
    const horaDesde = val.horaDesde;
    const horaHasta = val.horaHasta;
    const fecha = val.fecha;

    if (horaDesde >= horaHasta) {
      this.errorEdicion = 'La hora de fin debe ser posterior a la hora de inicio.';
      return;
    }

    if (horaDesde < '07:00' || horaDesde >= '18:00' || horaHasta <= '07:00' || horaHasta > '18:00') {
      this.errorEdicion = 'No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs).';
      return;
    }

    const payload: Partial<Reservation> = {
      salaId: Number(val.salaId),
      inicio: `${fecha}T${horaDesde}`,
      fin: `${fecha}T${horaHasta}`,
      curso: val.curso,
      materia: val.materia,
      netbooks: Number(val.netbooks) || 0
    };

    this.guardandoEdicion = true;
    this.errorEdicion = '';

    this.reservationService.updateReservation(this.reservaEnEdicion.id, payload).subscribe({
      next: () => {
        this.guardandoEdicion = false;
        this.cerrarModalEdicion();
        this.exitoMensaje = '¡Reserva modificada correctamente!';
        this.cargarReservas();
        setTimeout(() => {
          this.exitoMensaje = '';
          this.cdr.markForCheck();
        }, 3000);
      },
      error: (err) => {
        this.guardandoEdicion = false;
        console.error('Error al editar reserva:', err);
        const msg = err.error?.sala_ocupada?.[0] ||
                    err.error?.horario_escolar?.[0] ||
                    err.error?.materia?.[0] ||
                    err.error?.non_field_errors?.[0] ||
                    err.error?.detail ||
                    'No se pudo actualizar la reserva. Verificá que el horario no esté ocupado ni supere el tope semanal.';
        this.errorEdicion = msg;
        this.cdr.markForCheck();
      }
    });
  }

  cancelarReserva(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.exitoMensaje = 'Reserva cancelada correctamente. El horario ha quedado disponible.';
          this.cargarReservas();
          setTimeout(() => {
            this.exitoMensaje = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          console.error('Error al cancelar reserva:', err);
          alert('No se pudo cancelar la reserva.');
        }
      });
    }
  }
}