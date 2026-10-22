import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservationService, Reservation } from '../../../services/reservation';
import { LabsService, Lab } from '../../../services/labs';
import { UsersService } from '../../../services/users';
import { forkJoin } from 'rxjs';

export interface DiaAgenda {
  fecha: string;        // YYYY-MM-DD
  nombreDia: string;    // Lunes, Martes, etc.
  numeroDia: string;    // 19, 20, etc.
  esHoy: boolean;
}

export interface BloqueHorario {
  horaInicio: string;   // '07:00'
  horaFin: string;      // '08:00'
  label: string;        // '07:00 - 08:00'
}

export interface SlotCelda {
  ocupado: boolean;
  reserva?: Reservation;
  docenteNombre?: string;
  docenteEmail?: string;
  salaId: number | string;
  salaNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agenda-semanal.html',
  styleUrl: './agenda-semanal.css',
})
export class AgendaSemanal implements OnInit {
  private reservationService = inject(ReservationService);
  private labsService = inject(LabsService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  labs: Lab[] = [];
  reservas: Reservation[] = [];
  usersMap = new Map<number, { nombre: string; email: string }>();
  loading = true;

  // Filtro de sala seleccionada: 'todas' o id de sala
  salaFiltro: string = 'todas';

  seleccionarSala(id: number | string): void {
    this.salaFiltro = String(id);
    this.cdr.markForCheck();
  }

  esSalaSeleccionada(id: number | string): boolean {
    return this.salaFiltro === String(id);
  }

  // Semana actual en foco
  lunesSemanaActual: Date = this.obtenerLunes(new Date());
  diasSemana: DiaAgenda[] = [];

  // Bloques de horario escolar (07:00 a 18:00 hs en bloques de 1 hora)
  bloquesHorarios: BloqueHorario[] = [
    { horaInicio: '07:00', horaFin: '08:00', label: '07:00 - 08:00' },
    { horaInicio: '08:00', horaFin: '09:00', label: '08:00 - 09:00' },
    { horaInicio: '09:00', horaFin: '10:00', label: '09:00 - 10:00' },
    { horaInicio: '10:00', horaFin: '11:00', label: '10:00 - 11:00' },
    { horaInicio: '11:00', horaFin: '12:00', label: '11:00 - 12:00' },
    { horaInicio: '12:00', horaFin: '13:00', label: '12:00 - 13:00' },
    { horaInicio: '13:00', horaFin: '14:00', label: '13:00 - 14:00' },
    { horaInicio: '14:00', horaFin: '15:00', label: '14:00 - 15:00' },
    { horaInicio: '15:00', horaFin: '16:00', label: '15:00 - 16:00' },
    { horaInicio: '16:00', horaFin: '17:00', label: '16:00 - 17:00' },
    { horaInicio: '17:00', horaFin: '18:00', label: '17:00 - 18:00' },
  ];

  reservaModalInfo: SlotCelda | null = null;

  ngOnInit(): void {
    this.generarDiasSemana();
    this.cargarDatos();
  }

  private obtenerLunes(d: Date): Date {
    const fecha = new Date(d);
    const day = (fecha.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
    fecha.setDate(fecha.getDate() - day);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  generarDiasSemana(): void {
    const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const hoyStr = this.formatDate(new Date());

    this.diasSemana = nombres.map((nom, idx) => {
      const d = new Date(this.lunesSemanaActual);
      d.setDate(d.getDate() + idx);
      const fStr = this.formatDate(d);
      return {
        fecha: fStr,
        nombreDia: nom,
        numeroDia: String(d.getDate()).padStart(2, '0'),
        esHoy: fStr === hoyStr
      };
    });
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      labs: this.labsService.getLabs(),
      reservas: this.reservationService.getAllReservations(),
      users: this.usersService.getUsers()
    }).subscribe({
      next: ({ labs, reservas, users }) => {
        this.labs = labs.filter(l => l.activa !== false);
        this.reservas = reservas.filter(r => r.estado === 'confirmada');

        users.forEach(u => {
          if (u.id) {
            this.usersMap.set(Number(u.id), {
              nombre: `${u.nombre} ${u.apellido}`.trim(),
              email: u.email || ''
            });
          }
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar agenda semanal:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Navegación de semanas
  semanaAnterior(): void {
    const nueva = new Date(this.lunesSemanaActual);
    nueva.setDate(nueva.getDate() - 7);
    this.lunesSemanaActual = nueva;
    this.generarDiasSemana();
    this.cdr.markForCheck();
  }

  semanaSiguiente(): void {
    const nueva = new Date(this.lunesSemanaActual);
    nueva.setDate(nueva.getDate() + 7);
    this.lunesSemanaActual = nueva;
    this.generarDiasSemana();
    this.cdr.markForCheck();
  }

  semanaActual(): void {
    this.lunesSemanaActual = this.obtenerLunes(new Date());
    this.generarDiasSemana();
    this.cdr.markForCheck();
  }

  get rangoSemanaLabel(): string {
    if (this.diasSemana.length === 0) return '';
    const inicio = this.diasSemana[0].fecha;
    const fin = this.diasSemana[this.diasSemana.length - 1].fecha;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [, mIni, dIni] = inicio.split('-');
    const [, mFin, dFin] = fin.split('-');
    const mesNombre = meses[parseInt(mIni, 10) - 1];
    return `${dIni} al ${dFin} de ${mesNombre}`;
  }

  get labsFiltrados(): Lab[] {
    if (this.salaFiltro === 'todas') {
      return this.labs;
    }
    return this.labs.filter(l => String(l.id) === String(this.salaFiltro));
  }

  // Consulta el estado de un slot (laboratorio, fecha, bloque horario)
  getSlot(labId: number | string, fecha: string, bloque: BloqueHorario): SlotCelda {
    const lab = this.labs.find(l => String(l.id) === String(labId));
    const salaNombre = lab ? lab.nombre : `Laboratorio #${labId}`;

    // Buscar reservas confirmadas de esta sala en este día que se solapen con este bloque
    const solapada = this.reservas.find(r => {
      if (String(r.salaId) !== String(labId)) return false;
      const rFecha = r.inicio.split('T')[0];
      if (rFecha !== fecha) return false;

      const rIni = r.inicio.includes('T') ? r.inicio.split('T')[1].substring(0, 5) : r.inicio;
      const rFin = r.fin.includes('T') ? r.fin.split('T')[1].substring(0, 5) : r.fin;

      return bloque.horaInicio < rFin && bloque.horaFin > rIni;
    });

    if (solapada) {
      const cached = this.usersMap.get(Number(solapada.usuarioId));
      const docenteNombre = solapada.usuarioNombre || cached?.nombre || `Docente #${solapada.usuarioId}`;
      const docenteEmail = solapada.usuarioEmail || cached?.email || '';

      return {
        ocupado: true,
        reserva: solapada,
        docenteNombre: docenteNombre,
        docenteEmail: docenteEmail,
        salaId: labId,
        salaNombre: salaNombre,
        fecha: fecha,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin
      };
    }

    return {
      ocupado: false,
      salaId: labId,
      salaNombre: salaNombre,
      fecha: fecha,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin
    };
  }

  reservarSlot(slot: SlotCelda): void {
    // Si la fecha y hora ya pasaron, no permitir
    const ahora = new Date();
    const hoyStr = this.formatDate(ahora);
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    if (slot.fecha < hoyStr || (slot.fecha === hoyStr && slot.horaInicio <= horaActual)) {
      alert('No es posible realizar reservas en una fecha u hora que ya ha transcurrido.');
      return;
    }

    this.router.navigate(['/dashboard/user/reservar'], {
      queryParams: {
        salaId: slot.salaId,
        fecha: slot.fecha,
        horaDesde: slot.horaInicio,
        horaHasta: slot.horaFin
      }
    });
  }

  verDetalleInfo(slot: SlotCelda): void {
    this.reservaModalInfo = slot;
    this.cdr.markForCheck();
  }

  cerrarModalInfo(): void {
    this.reservaModalInfo = null;
    this.cdr.markForCheck();
  }
}
