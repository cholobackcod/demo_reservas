import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../../services/reservation';
import { UsersService } from '../../../services/users';
import { LabsService } from '../../../services/labs';
import { forkJoin } from 'rxjs';
import { Lab } from '../../../services/labs';

export interface AdminReservaDisplay {
  id?: number | string;
  docenteNombre: string;
  laboratorioNombre: string;
  fecha: string;
  fechaDisplay: string;
  hora: string;
  materia?: string;
  curso?: string;
  netbooks?: number;
  salaId?: number | string;
  inicio?: string;
  fin?: string;
  estado: string;
}

type ReservaSort = 'fechaAsc' | 'fechaDesc' | 'docenteAsc' | 'laboratorioAsc' | 'estado';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  filtroTexto = '';
  filtroEstado = '';
  filtroLaboratorio = '';
  filtroFecha = '';
  orden: ReservaSort = 'fechaAsc';
  paginaActual = 1;
  tamanoPagina = 10;
  reservaSeleccionada: AdminReservaDisplay | null = null;
  editandoReserva = false;
  guardandoEdicion = false;
  conflictosEdicion: AdminReservaDisplay[] = [];
  sobrescribirConflicto = false;
  laboratorios: Lab[] = [];
  edicion = {
    salaId: '',
    fecha: '',
    horaInicio: '',
    horaFin: ''
  };

  get laboratoriosDisponibles(): string[] {
    return [...new Set(this.reservas.map(reserva => reserva.laboratorioNombre))].sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }

  get reservasFiltradas(): AdminReservaDisplay[] {
    const texto = this.filtroTexto.trim().toLocaleLowerCase('es');
    const filtradas = this.reservas.filter(reserva => {
      const coincideTexto = !texto ||
        reserva.docenteNombre.toLocaleLowerCase('es').includes(texto) ||
        reserva.laboratorioNombre.toLocaleLowerCase('es').includes(texto);
      const coincideEstado = !this.filtroEstado || reserva.estado === this.filtroEstado;
      const coincideLaboratorio = !this.filtroLaboratorio || reserva.laboratorioNombre === this.filtroLaboratorio;
      const coincideFecha = !this.filtroFecha || reserva.fecha === this.filtroFecha;
      return coincideTexto && coincideEstado && coincideLaboratorio && coincideFecha;
    });

    return [...filtradas].sort((a, b) => {
      switch (this.orden) {
        case 'docenteAsc':
          return a.docenteNombre.localeCompare(b.docenteNombre, 'es');
        case 'laboratorioAsc':
          return a.laboratorioNombre.localeCompare(b.laboratorioNombre, 'es');
        case 'estado':
          return a.estado.localeCompare(b.estado, 'es') || a.fecha.localeCompare(b.fecha);
        case 'fechaDesc':
          return `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`);
        default:
          return `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`);
      }
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.reservasFiltradas.length / this.tamanoPagina));
  }

  get reservasPaginadas(): AdminReservaDisplay[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.reservasFiltradas.slice(inicio, inicio + this.tamanoPagina);
  }

  get indiceUltimaReserva(): number {
    return Math.min(this.paginaActual * this.tamanoPagina, this.reservasFiltradas.length);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = Math.min(Math.max(pagina, 1), this.totalPaginas);
  }

  cambiarTamanoPagina(): void {
    this.paginaActual = 1;
  }

  actualizarFiltroTexto(valor: string): void {
    this.filtroTexto = valor;
    this.paginaActual = 1;
  }

  actualizarFiltroEstado(valor: string): void {
    this.filtroEstado = valor;
    this.paginaActual = 1;
  }

  actualizarFiltroLaboratorio(valor: string): void {
    this.filtroLaboratorio = valor;
    this.paginaActual = 1;
  }

  actualizarFiltroFecha(valor: string): void {
    this.filtroFecha = valor;
    this.paginaActual = 1;
  }

  actualizarOrden(valor: ReservaSort): void {
    this.orden = valor;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroLaboratorio = '';
    this.filtroFecha = '';
    this.orden = 'fechaAsc';
    this.paginaActual = 1;
  }

  private formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return year && month && day ? `${day}/${month}/${year}` : fecha;
  }

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
        this.laboratorios = labs;
        const usersMap = new Map<number, string>();
        users.forEach(u => {
          if (u.id) usersMap.set(Number(u.id), `${u.nombre} ${u.apellido}`);
        });

        const labsMap = new Map<number, string>();
        labs.forEach(l => {
          if (l.id) labsMap.set(Number(l.id), l.nombre);
        });

        const ahora = new Date();
        const reservasVencidas = reservas.filter(r =>
          r.estado === 'confirmada' &&
          !!r.fin &&
          new Date(r.fin).getTime() <= ahora.getTime() &&
          Number.isFinite(Number(r.id))
        );

        reservasVencidas.forEach(reserva => {
          this.reservationService.updateReservation(reserva.id!, { estado: 'finalizada' }).subscribe({
            error: (err) => console.error(`No se pudo finalizar automáticamente la reserva ${reserva.id}:`, err)
          });
        });

        this.reservas = reservas.map(r => {
          const parts = r.inicio ? r.inicio.split('T') : ['', ''];
          const endParts = r.fin ? r.fin.split('T') : ['', ''];
          return {
            id: r.id,
            docenteNombre: usersMap.get(Number(r.usuarioId)) || `Usuario #${r.usuarioId}`,
            laboratorioNombre: labsMap.get(Number(r.salaId)) || `Sala #${r.salaId}`,
            fecha: parts[0] || 'N/A',
            fechaDisplay: this.formatearFecha(parts[0] || 'N/A'),
            hora: parts[1] ? `${parts[1]} - ${endParts[1] || ''}` : 'N/A',
            materia: r.materia,
            curso: r.curso,
            netbooks: r.netbooks,
            salaId: r.salaId,
            inicio: r.inicio,
            fin: r.fin,
            estado: reservasVencidas.some(vencida => String(vencida.id) === String(r.id))
              ? 'finalizada'
              : r.estado
          };
        });
        this.paginaActual = 1;

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

  verDetalle(reserva: AdminReservaDisplay): void {
    this.reservaSeleccionada = reserva;
    this.editandoReserva = false;
    this.conflictosEdicion = [];
    this.sobrescribirConflicto = false;
  }

  cerrarDetalle(): void {
    this.reservaSeleccionada = null;
    this.editandoReserva = false;
    this.conflictosEdicion = [];
    this.sobrescribirConflicto = false;
  }

  iniciarEdicion(): void {
    if (!this.reservaSeleccionada || this.reservaSeleccionada.estado !== 'confirmada') return;
    const inicio = this.reservaSeleccionada.inicio || '';
    const fin = this.reservaSeleccionada.fin || '';
    this.edicion = {
      salaId: String(this.reservaSeleccionada.salaId ?? ''),
      fecha: inicio.substring(0, 10),
      horaInicio: inicio.includes('T') ? inicio.split('T')[1].substring(0, 5) : '',
      horaFin: fin.includes('T') ? fin.split('T')[1].substring(0, 5) : ''
    };
    this.conflictosEdicion = [];
    this.sobrescribirConflicto = false;
    this.editandoReserva = true;
  }

  cancelarEdicion(): void {
    this.editandoReserva = false;
    this.conflictosEdicion = [];
    this.sobrescribirConflicto = false;
  }

  guardarEdicion(): void {
    const reserva = this.reservaSeleccionada;
    if (!reserva?.id || !this.edicion.salaId || !this.edicion.fecha ||
      !this.edicion.horaInicio || !this.edicion.horaFin) {
      return;
    }
    if (this.edicion.horaInicio >= this.edicion.horaFin) {
      alert('La hora de finalización debe ser posterior a la hora de inicio.');
      return;
    }

    const inicioNuevo = `${this.edicion.fecha}T${this.edicion.horaInicio}`;
    const finNuevo = `${this.edicion.fecha}T${this.edicion.horaFin}`;
    this.conflictosEdicion = this.reservas.filter(otra => {
      if (String(otra.id) === String(reserva.id) || otra.estado !== 'confirmada') return false;
      if (String(otra.salaId) !== String(this.edicion.salaId)) return false;
      return !!otra.inicio && !!otra.fin && otra.inicio < finNuevo && otra.fin > inicioNuevo;
    });

    if (this.conflictosEdicion.length > 0 && !this.sobrescribirConflicto) {
      return;
    }

    this.guardandoEdicion = true;
    this.reservationService.updateReservation(reserva.id, {
      salaId: Number(this.edicion.salaId),
      inicio: `${this.edicion.fecha}T${this.edicion.horaInicio}:00`,
      fin: `${this.edicion.fecha}T${this.edicion.horaFin}:00`,
      ...(this.sobrescribirConflicto ? { forzarSolapamiento: true } : {})
    }).subscribe({
      next: () => {
        this.guardandoEdicion = false;
        this.editandoReserva = false;
        this.reservaSeleccionada = null;
        this.conflictosEdicion = [];
        this.sobrescribirConflicto = false;
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al editar la reserva:', err);
        this.guardandoEdicion = false;
        const obtenerTexto = (valor: unknown): string => {
          if (Array.isArray(valor)) return String(valor[0] || '');
          return typeof valor === 'string' ? valor : '';
        };
        const detalle = obtenerTexto(err.error?.sala_ocupada) ||
          obtenerTexto(err.error?.non_field_errors) ||
          obtenerTexto(err.error?.detail);
        alert(detalle || 'No se pudo guardar la edición de la reserva.');
      }
    });
  }

  cancelarReserva(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Desea cancelar esta reserva? Esta acción no se puede deshacer.')) {
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