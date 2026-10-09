import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LabsService, Lab } from '../../../services/labs';
import { ReservationService, Reservation } from '../../../services/reservation';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservar-espacio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reservar-espacio.html',
  styleUrl: './reservar-espacio.css',
})
export class ReservarEspacio implements OnInit {
  private fb = inject(FormBuilder);
  private labsService = inject(LabsService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  reservaForm: FormGroup;
  salas: Lab[] = [];
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.reservaForm = this.fb.group({
      sala: ['', Validators.required],
      fechaDesde: ['', Validators.required],
      horaDesde: ['', Validators.required],
      fechaHasta: ['', Validators.required],
      horaHasta: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.labsService.getLabs().subscribe({
      next: (labs) => {
        this.salas = labs;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar salas:', err);
        this.cdr.markForCheck();
      }
    });
  }


  confirmarReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    const rawUserId = currentUser?.id ?? 2;
    const usuarioId = Number(rawUserId);

    const { sala, fechaDesde, horaDesde, fechaHasta, horaHasta } = this.reservaForm.value;
    const salaId = Number(sala);

    const inicioNuevo = `${fechaDesde}T${horaDesde}`;
    const finNuevo = `${fechaHasta}T${horaHasta}`;

    if (inicioNuevo >= finNuevo) {
      this.errorMessage = 'La fecha y hora de inicio debe ser anterior a la de finalización.';
      this.cdr.markForCheck();
      return;
    }

    this.reservationService.getAllReservations().subscribe({
      next: (existing) => {
        // Verificar si existe solapamiento con alguna reserva no cancelada para la misma sala
        const tieneSolapamiento = existing.some(r => {
          if (r.estado === 'cancelada') return false;
          if (Number(r.salaId) !== salaId) return false;

          const rInicio = r.inicio;
          const rFin = r.fin;

          // Dos rangos se solapan si: inicioNuevo < rFin && finNuevo > rInicio
          return (inicioNuevo < rFin && finNuevo > rInicio);
        });

        if (tieneSolapamiento) {
          this.errorMessage = 'El laboratorio seleccionado ya se encuentra reservado en ese rango de fecha y horario por otro docente.';
          this.cdr.markForCheck();
          return;
        }

        // Calcular el siguiente ID numérico secuencial
        let nextId = 1;
        if (existing && existing.length > 0) {
          const numericIds = existing.map(r => Number(r.id)).filter(id => !isNaN(id));
          if (numericIds.length > 0) {
            nextId = Math.max(...numericIds) + 1;
          }
        }

        const nuevaReserva: Reservation = {
          id: nextId,
          usuarioId: usuarioId,
          salaId: salaId,
          inicio: inicioNuevo,
          fin: finNuevo,
          estado: 'confirmada'
        };

        this.reservationService.createReservation(nuevaReserva).subscribe({
          next: () => {
            alert('¡Reserva realizada con éxito en el sistema!');
            this.reservaForm.reset();
            this.router.navigate(['/dashboard/user/reservas']);
          },
          error: (err) => {
            console.error('Error al crear reserva:', err);
            this.errorMessage = 'Ocurrió un error al registrar la reserva.';
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Error al consultar disponibilidad de reservas:', err);
        this.errorMessage = 'No se pudo verificar la disponibilidad de reservas con el servidor.';
        this.cdr.markForCheck();
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.reservaForm.get(campo);
    return !!control && control.invalid && control.touched;
  }
}