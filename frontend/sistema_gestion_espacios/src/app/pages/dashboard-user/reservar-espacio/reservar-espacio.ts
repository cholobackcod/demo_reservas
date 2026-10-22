import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LabsService, Lab } from '../../../services/labs';
import { ReservationService, Reservation, CreateReservationDto } from '../../../services/reservation';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../../services/users';

export interface HorarioOcupado {
  inicio: string;
  fin: string;
  id?: number | string;
  usuarioId?: number | string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  curso?: string;
  materia?: string;
  netbooks?: number;
}

export interface FranjaDisponible {
  inicio: string;
  fin: string;
}

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
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private usersMap = new Map<number, { nombre: string; email: string }>();
  reservaSeleccionada: HorarioOcupado | null = null;

  reservaForm: FormGroup;
  salas: Lab[] = [];

  // HU03: Cursos y Materias ProA
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

  // Disponibilidad de laboratorio (Pasos 1 a 8 del Diagrama de Secuencia)
  consultandoDisponibilidad = false;
  disponibilidadConsultada = false;
  reservasConfirmadasSala: Reservation[] = [];
  todasLasReservasConfirmadas: Reservation[] = [];
  horariosOcupados: HorarioOcupado[] = [];
  franjasDisponibles: FranjaDisponible[] = [];

  // Estados de alertas / errores acordes al Diagrama de Secuencia
  alertaLaboratorioReservado = false; // Paso 26: Alerta: Laboratorio ya reservado
  errorRangoHorario = false;          // Paso 21: Error de rango horario
  errorFormulario = false;            // Paso 17: Mensaje de error en formulario
  errorServidor = false;              // Paso 35: Error interno del servidor
  errorMessage = '';
  successMessage = '';                // Paso 41: Notificación de éxito y redirección
  enviando = false;

  hoyFecha = this.getHoyLocal();

  private getHoyLocal(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor() {
    const d = new Date();
    // Si la jornada escolar de hoy ya terminó (>= 18:00 hs), sugerir mañana por defecto
    const fechaInicial = new Date();
    if (d.getHours() >= 18) {
      fechaInicial.setDate(fechaInicial.getDate() + 1);
    }
    const year = fechaInicial.getFullYear();
    const month = String(fechaInicial.getMonth() + 1).padStart(2, '0');
    const day = String(fechaInicial.getDate()).padStart(2, '0');
    const fechaSugerida = `${year}-${month}-${day}`;

    this.hoyFecha = this.getHoyLocal();
    this.reservaForm = this.fb.group({
      sala: ['', Validators.required],
      fechaDesde: [fechaSugerida, Validators.required],
      horaDesde: ['08:00', Validators.required],
      fechaHasta: [fechaSugerida, Validators.required],
      horaHasta: ['10:00', Validators.required],
      curso: ['4° Año Informática', Validators.required],
      materia: ['Programación', Validators.required],
      netbooks: [0, [Validators.required, Validators.min(0), Validators.max(45)]]
    });
  }

  ngOnInit(): void {
    // Cargar todas las reservas para validar HU05 (tope semanal por materia)
    this.reservationService.getAllReservations().subscribe({
      next: (all) => {
        this.todasLasReservasConfirmadas = all.filter(r => r.estado === 'confirmada');
      },
      error: (e) => console.warn('Error al precargar reservas para HU05:', e)
    });

    // Cargar laboratorios activos
    this.labsService.getLabs().subscribe({
      next: (labs) => {
        this.salas = labs.filter(l => l.activa !== false);

        // Soporte de query parameters para auto-completar desde agenda u otros componentes
        this.route.queryParams.subscribe(params => {
          if (params['salaId']) {
            this.reservaForm.patchValue({ sala: Number(params['salaId']) });
          }
          if (params['fecha']) {
            this.reservaForm.patchValue({
              fechaDesde: params['fecha'],
              fechaHasta: params['fecha']
            });
          }
          if (params['horaDesde']) {
            this.reservaForm.patchValue({ horaDesde: params['horaDesde'] });
          }
          if (params['horaHasta']) {
            this.reservaForm.patchValue({ horaHasta: params['horaHasta'] });
          }
          if (params['curso']) {
            this.reservaForm.patchValue({ curso: params['curso'] });
          }
          if (params['materia']) {
            this.reservaForm.patchValue({ materia: params['materia'] });
          }
        });

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar salas:', err);
        this.cdr.markForCheck();
      }
    });

    // Cargar usuarios para identificar nombres de docentes en las reservas
    this.usersService.getUsers().subscribe({
      next: (users) => {
        users.forEach(u => {
          if (u.id) {
            this.usersMap.set(Number(u.id), {
              nombre: `${u.nombre} ${u.apellido}`.trim(),
              email: u.email || ''
            });
          }
        });
        const fecha = this.reservaForm.get('fechaDesde')?.value;
        if (fecha && this.disponibilidadConsultada) {
          this.actualizarHorariosDisponibles(fecha);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });

    // Paso 1: Docente selecciona laboratorio y fecha
    this.reservaForm.get('sala')?.valueChanges.subscribe(salaId => {
      if (salaId) {
        this.consultarDisponibilidad(Number(salaId));
      } else {
        this.disponibilidadConsultada = false;
        this.horariosOcupados = [];
        this.franjasDisponibles = [];
        this.cdr.markForCheck();
      }
    });

    this.reservaForm.get('fechaDesde')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        // El usuario elije fecha de inicio y por defecto la fecha de fin es el mismo día
        this.reservaForm.get('fechaHasta')?.setValue(fecha, { emitEvent: false });
      }
      const salaId = this.reservaForm.get('sala')?.value;
      if (salaId) {
        this.actualizarHorariosDisponibles(fecha);
      }
    });
  }

  // Paso 2: Cliente envía GET /api/v1/reservas/?salaId={id}&estado=confirmada
  consultarDisponibilidad(salaId: number): void {
    this.consultandoDisponibilidad = true;
    this.reservationService.getConfirmedReservationsByLab(salaId).subscribe({
      next: (reservas) => {
        // Paso 7: 200 OK (Lista de reservas)
        this.reservasConfirmadasSala = reservas;
        this.consultandoDisponibilidad = false;
        const fecha = this.reservaForm.get('fechaDesde')?.value;
        this.actualizarHorariosDisponibles(fecha);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al consultar reservas confirmadas:', err);
        this.consultandoDisponibilidad = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Paso 8: Cliente muestra horarios disponibles al Docente
  actualizarHorariosDisponibles(fechaSeleccionada: string): void {
    if (!fechaSeleccionada) return;

    this.disponibilidadConsultada = true;
    const reservasDia = this.reservasConfirmadasSala.filter(r => {
      const inicioFecha = r.inicio.split('T')[0];
      return inicioFecha === fechaSeleccionada;
    });

    this.horariosOcupados = reservasDia.map(r => {
      const horaIni = r.inicio.includes('T') ? r.inicio.split('T')[1].substring(0, 5) : r.inicio;
      const horaFin = r.fin.includes('T') ? r.fin.split('T')[1].substring(0, 5) : r.fin;
      const cached = this.usersMap.get(Number(r.usuarioId));
      const usuarioNombre = r.usuarioNombre || cached?.nombre || `Docente #${r.usuarioId}`;
      const usuarioEmail = r.usuarioEmail || cached?.email || '';
      return {
        id: r.id,
        inicio: horaIni,
        fin: horaFin,
        usuarioId: r.usuarioId,
        usuarioNombre: usuarioNombre,
        usuarioEmail: usuarioEmail,
        curso: r.curso,
        materia: r.materia,
        netbooks: r.netbooks
      };
    }).sort((a, b) => a.inicio.localeCompare(b.inicio));

    // Calcular franjas horarias disponibles dentro del horario escolar (07:00 a 18:00)
    this.franjasDisponibles = this.calcularFranjasDisponibles(this.horariosOcupados, fechaSeleccionada);

    // Si el horario seleccionado actualmente está ocupado, sugerir la primera franja disponible
    const horarioActualOcupado = this.horariosOcupados.some(oc => {
      const hD = this.reservaForm.get('horaDesde')?.value;
      const hH = this.reservaForm.get('horaHasta')?.value;
      return hD && hH && hD < oc.fin && hH > oc.inicio;
    });

    if (horarioActualOcupado && this.franjasDisponibles.length > 0) {
      const primera = this.franjasDisponibles[0];
      const [hIni] = primera.inicio.split(':').map(Number);
      const [hFin] = primera.fin.split(':').map(Number);
      const finSugerido = (hFin - hIni > 2) ? `${String(hIni + 2).padStart(2, '0')}:00` : primera.fin;
      this.reservaForm.patchValue({
        horaDesde: primera.inicio,
        horaHasta: finSugerido
      }, { emitEvent: false });
    }

    this.cdr.markForCheck();
  }

  private calcularFranjasDisponibles(ocupados: HorarioOcupado[], fechaSeleccionada?: string): FranjaDisponible[] {
    const franjas: FranjaDisponible[] = [];
    let horaPuntero = '07:00';
    const horaCierre = '18:00';

    const hoy = this.getHoyLocal();
    if (fechaSeleccionada === hoy) {
      const d = new Date();
      const horaActual = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      if (horaActual >= horaCierre) {
        // La jornada escolar de hoy ya finalizó
        return [];
      }
      if (horaActual > horaPuntero) {
        horaPuntero = horaActual;
      }
    }

    for (const oc of ocupados) {
      const ocInicio = oc.inicio < '07:00' ? '07:00' : (oc.inicio > '18:00' ? '18:00' : oc.inicio);
      const ocFin = oc.fin < '07:00' ? '07:00' : (oc.fin > '18:00' ? '18:00' : oc.fin);

      if (ocInicio > horaPuntero) {
        franjas.push({ inicio: horaPuntero, fin: ocInicio });
      }
      if (ocFin > horaPuntero) {
        horaPuntero = ocFin;
      }
    }

    if (horaPuntero < horaCierre) {
      franjas.push({ inicio: horaPuntero, fin: horaCierre });
    }

    return franjas;
  }

  seleccionarFranja(franja: FranjaDisponible): void {
    this.reservaForm.patchValue({
      horaDesde: franja.inicio,
      horaHasta: franja.fin
    });
  }

  mostrarDetalle(oc: HorarioOcupado): void {
    this.reservaSeleccionada = oc;
    this.cdr.markForCheck();
  }

  cerrarDetalle(): void {
    this.reservaSeleccionada = null;
    this.cdr.markForCheck();
  }

  // Paso 9: Completa formulario y hace clic en "Confirmar Reserva"
  confirmarReserva(): void {
    this.limpiarAlertas();

    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      this.errorFormulario = true;
      this.errorMessage = 'Por favor, completá todos los campos requeridos del formulario.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const usuarioId = currentUser?.id ? Number(currentUser.id) : 2;

    const { sala, fechaDesde, horaDesde, horaHasta, curso, materia, netbooks } = this.reservaForm.value;
    const salaId = Number(sala);

    // El usuario elije fecha de inicio y por defecto la fecha de fin es el mismo día
    const fechaFin = this.reservaForm.value.fechaHasta || fechaDesde;

    const hoyLocal = this.getHoyLocal();
    const d = new Date();
    const horaActual = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const ahoraStr = `${hoyLocal}T${horaActual}`;

    const inicioNuevo = `${fechaDesde}T${horaDesde}`;
    const finNuevo = `${fechaFin}T${horaHasta}`;

    // Si la fecha u hora que intenta cargar ya pasó
    if (inicioNuevo <= ahoraStr) {
      this.errorRangoHorario = true;
      this.errorMessage = 'No es posible realizar reservas en una fecha u hora que ya ha transcurrido.';
      this.cdr.markForCheck();
      return;
    }

    // Validar horario escolar: 07:00 a 18:00 hs
    if (horaDesde < '07:00' || horaDesde >= '18:00' || horaHasta <= '07:00' || horaHasta > '18:00') {
      this.errorRangoHorario = true;
      this.errorMessage = 'No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs).';
      this.cdr.markForCheck();
      return;
    }

    if (horaDesde >= horaHasta) {
      // Paso 21: Error de rango horario
      this.errorRangoHorario = true;
      this.errorMessage = 'La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.';
      this.cdr.markForCheck();
      return;
    }

    // HU05: Validación automática de topes semanales de reserva por materia (máximo 3 por semana)
    if (materia && fechaDesde) {
      const fechaObj = new Date(fechaDesde + 'T00:00:00');
      const diaSemana = (fechaObj.getDay() + 6) % 7; // Lunes = 0
      const lunes = new Date(fechaObj);
      lunes.setDate(fechaObj.getDate() - diaSemana);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);

      const fPad = (n: number) => String(n).padStart(2, '0');
      const lunesStr = `${lunes.getFullYear()}-${fPad(lunes.getMonth() + 1)}-${fPad(lunes.getDate())}`;
      const domingoStr = `${domingo.getFullYear()}-${fPad(domingo.getMonth() + 1)}-${fPad(domingo.getDate())}`;

      const reservasMateriaSemana = this.todasLasReservasConfirmadas.filter(r => {
        if (!r.materia || r.materia.trim().toLowerCase() !== materia.trim().toLowerCase()) return false;
        const f = r.inicio.split('T')[0];
        return f >= lunesStr && f <= domingoStr;
      });

      if (reservasMateriaSemana.length >= 3) {
        this.errorFormulario = true;
        this.errorMessage = `Se ha alcanzado el tope semanal de 3 reservas para la materia '${materia}'. Podés reservar para otra materia o en otra semana.`;
        this.cdr.markForCheck();
        return;
      }
    }

    // Verificar si el horario seleccionado se solapa con una reserva confirmada ya existente
    const solapada = this.horariosOcupados.find(oc => {
      return horaDesde < oc.fin && horaHasta > oc.inicio;
    });
    if (solapada) {
      this.alertaLaboratorioReservado = true;
      const nombreDocente = solapada.usuarioNombre ? ` por ${solapada.usuarioNombre}` : ' por otro docente';
      this.errorMessage = `El laboratorio ya se encuentra reservado en el horario de ${solapada.inicio} a ${solapada.fin} hs${nombreDocente}.`;
      this.cdr.markForCheck();
      return;
    }

    // Paso 10: POST /api/v1/reservas/ {usuarioId, salaId, inicio, fin, curso, materia, netbooks}
    const nuevaReserva: CreateReservationDto = {
      usuarioId: usuarioId,
      salaId: salaId,
      inicio: inicioNuevo,
      fin: finNuevo,
      curso: curso || '',
      materia: materia || '',
      netbooks: Number(netbooks) || 0
    };

    this.enviando = true;

    this.reservationService.createReservation(nuevaReserva).subscribe({
      next: (res) => {
        // Paso 40 y 41: 201 Created -> Notificación de éxito y redirección
        this.enviando = false;
        if (res.offline) {
          this.successMessage = '¡Modo Offline! La reserva se guardó localmente en el dispositivo (LocalStorage) y se sincronizará automáticamente cuando vuelva la conexión.';
        } else {
          this.successMessage = '¡Reserva confirmada con éxito en el sistema! Redirigiendo...';
        }
        this.consultarDisponibilidad(salaId);
        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate(['/dashboard/user/reservas']);
        }, 1600);
      },
      error: (err) => {
        this.enviando = false;
        console.error('Error al registrar reserva:', err);

        // Paso 33 a 35: alt [Solapamiento tardío o error al guardar] -> 500 Internal Server Error -> Error interno del servidor
        if (err.status === 500) {
          this.errorServidor = true;
          this.errorMessage = 'Error interno del servidor. Ocurrió un error inesperado al persistir la reserva.';
          this.cdr.markForCheck();
          return;
        }

        // HU05: Error de tope semanal por materia
        if (err.error?.materia) {
          this.errorFormulario = true;
          this.errorMessage = Array.isArray(err.error.materia) ? err.error.materia[0] : err.error.materia;
          this.cdr.markForCheck();
          return;
        }

        // Paso 22 a 26: alt [Existe solapamiento horario] -> 400 Bad Request (sala ocupada) -> Alerta: Laboratorio ya reservado
        if (err.error?.sala_ocupada) {
          this.alertaLaboratorioReservado = true;
          const msg = Array.isArray(err.error.sala_ocupada) ? err.error.sala_ocupada[0] : err.error.sala_ocupada;
          this.errorMessage = msg || 'El laboratorio seleccionado ya se encuentra reservado en ese horario por otro docente.';
          this.cdr.markForCheck();
          return;
        }

        // Horario escolar fuera de rango (07:00 a 18:00 hs)
        if (err.error?.horario_escolar) {
          this.errorRangoHorario = true;
          const msg = Array.isArray(err.error.horario_escolar) ? err.error.horario_escolar[0] : err.error.horario_escolar;
          this.errorMessage = msg || 'No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs).';
          this.cdr.markForCheck();
          return;
        }

        // Error en inicio (fecha u hora pasada)
        if (err.error?.inicio) {
          this.errorRangoHorario = true;
          this.errorMessage = Array.isArray(err.error.inicio) ? err.error.inicio[0] : err.error.inicio;
          this.cdr.markForCheck();
          return;
        }

        // Paso 18 a 21: alt [fin <= inicio o fechas inválidas] -> 400 Bad Request -> Error de rango horario
        if (err.error?.fin) {
          this.errorRangoHorario = true;
          this.errorMessage = Array.isArray(err.error.fin) ? err.error.fin[0] : err.error.fin;
          this.cdr.markForCheck();
          return;
        }

        // Error non_field_errors
        if (err.error?.non_field_errors) {
          const msg = Array.isArray(err.error.non_field_errors) ? err.error.non_field_errors[0] : err.error.non_field_errors;
          if (msg.includes('tope semanal')) {
            this.errorFormulario = true;
          } else if (msg.includes('horario escolar') || msg.includes('rango') || msg.includes('mismo día') || msg.includes('transcurrido') || msg.includes('pasada')) {
            this.errorRangoHorario = true;
          } else {
            this.alertaLaboratorioReservado = true;
          }
          this.errorMessage = msg;
          this.cdr.markForCheck();
          return;
        }

        // Paso 15 a 17: alt [usuarioId o salaId inexistente] -> 400 Bad Request -> Mensaje de error en formulario
        if (err.error?.usuarioId || err.error?.salaId) {
          this.errorFormulario = true;
          const msg = err.error?.salaId?.[0] || err.error?.usuarioId?.[0] || 'El usuario o laboratorio seleccionado no es válido.';
          this.errorMessage = msg;
          this.cdr.markForCheck();
          return;
        }

        // Error general en formulario
        this.errorFormulario = true;
        this.errorMessage = err.error?.detail || 'Ocurrió un error al procesar el formulario de reserva.';
        this.cdr.markForCheck();
      }
    });
  }

  limpiarAlertas(): void {
    this.alertaLaboratorioReservado = false;
    this.errorRangoHorario = false;
    this.errorFormulario = false;
    this.errorServidor = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  campoInvalido(campo: string): boolean {
    const control = this.reservaForm.get(campo);
    return !!control && control.invalid && control.touched;
  }
}