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
        this.salas = labs.filter(l => l.activa !== false);
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
    const usuarioId = currentUser?.id ? Number(currentUser.id) : 2;

    const { sala, fechaDesde, horaDesde, fechaHasta, horaHasta } = this.reservaForm.value;
    const salaId = Number(sala);

    const inicioNuevo = `${fechaDesde}T${horaDesde}`;
    const finNuevo = `${fechaHasta}T${horaHasta}`;

    if (inicioNuevo >= finNuevo) {
      this.errorMessage = 'La fecha y hora de inicio debe ser anterior a la de finalización.';
      this.cdr.markForCheck();
      return;
    }

    const nuevaReserva: Reservation = {
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
        const backendErr = err.error?.non_field_errors?.[0] || err.error?.fin?.[0] || err.error?.detail || 'El laboratorio seleccionado ya se encuentra reservado en ese horario por otro docente.';
        this.errorMessage = backendErr;
        this.cdr.markForCheck();
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.reservaForm.get(campo);
    return !!control && control.invalid && control.touched;
  }
}