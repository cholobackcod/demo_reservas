import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LabsService, Lab } from '../../../services/labs';
import { ReservationService, Reservation, CreateReservationDto } from '../../../services/reservation';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../../services/users';
import { DocentesService } from '../../../services/docentes';

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

export interface DiaCalendario {
  fecha: string;        // 'YYYY-MM-DD'
  diaNumero: number;    // 1-31
  diaSemana: string;    // 'lunes', etc.
  esMesActual: boolean;
  esHoy: boolean;
  esPasado: boolean;
  esFinDeSemana: boolean;
  tieneClases: boolean;
  esDeshabilitado: boolean;
  clases: any[];
}

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
  private docentesService = inject(DocentesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  private usersMap = new Map<number, { nombre: string; email: string }>();
  reservaSeleccionada: HorarioOcupado | null = null;

  reservaForm: FormGroup;
  salas: Lab[] = [];

  // Docente y Asignaciones Institucionales
  esDocente = false;
  tieneAsignaciones = false;
  todasLasAsignacionesDocente: any[] = [];
  cursosFiltradosPorMateria: string[] = [];

  // Cursos y Materias ProA
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
    'Programación II',
    'Programación III',
    'Programación IV',
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

  // Límite de horario asignado
  queryParamsCache: Params = {};
  bloqueAsignado: {
    horaInicio: string;
    horaFin: string;
    materia: string;
    curso: string;
    diaSemana?: string;
  } | null = null;
  errorTiempoAsignado = '';

  // Calendario Mensual Interactivo
  fechaCalendarioActual: Date = new Date();
  mesCalendarioNombre = '';
  diasCalendarioMensual: DiaCalendario[] = [];
  errorHorarioDocente = '';
  popupErrorHorarioVisible = false;
  popupErrorHorarioMensaje = '';

  // Agenda Semanal Unificada integrada
  lunesSemanaActual: Date = new Date();
  diasSemana: DiaAgenda[] = [];
  salaFiltroAgenda: string = 'todas';
  reservaModalInfo: SlotCelda | null = null;

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

  abrirPopupErrorHorario(mensaje: string): void {
    this.popupErrorHorarioMensaje = mensaje;
    this.popupErrorHorarioVisible = true;
    this.cdr.markForCheck();
  }

  cerrarPopupErrorHorario(): void {
    this.popupErrorHorarioVisible = false;
    this.popupErrorHorarioMensaje = '';
    this.cdr.markForCheck();
  }

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
      materia: ['Programación II', Validators.required],
      netbooks: [25, [Validators.required, Validators.min(0), Validators.max(45)]]
    });

    this.reservaForm.valueChanges.subscribe(() => {
      if (this.bloqueAsignado) {
        this.validarTiempoAsignado();
      } else {
        this.validarHorarioDocente();
      }
    });
  }

  obtenerDiaSemanaDeFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[dateObj.getDay()];
  }

  get clasesDelDiaSeleccionado(): any[] {
    const fecha = this.reservaForm?.get('fechaDesde')?.value;
    if (!fecha || !this.esDocente || !this.todasLasAsignacionesDocente.length) return [];
    const dia = this.obtenerDiaSemanaDeFecha(fecha);
    return this.todasLasAsignacionesDocente.filter(a => {
      const ad = (a.dia_semana || a.dia || '').toLowerCase();
      return ad === dia || (dia === 'miercoles' && (ad === 'miércoles' || ad === 'miercoles'));
    });
  }

  generarCalendarioMensual(): void {
    const año = this.fechaCalendarioActual.getFullYear();
    const mes = this.fechaCalendarioActual.getMonth();

    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.mesCalendarioNombre = `${mesesNombres[mes]} ${año}`;

    const primerDiaMes = new Date(año, mes, 1);
    const ultimoDiaMes = new Date(año, mes + 1, 0);

    // Lunes = 0, Domingo = 6
    const primerDiaSemana = (primerDiaMes.getDay() + 6) % 7;
    const totalDiasMes = ultimoDiaMes.getDate();

    const dias: DiaCalendario[] = [];
    const hoyStr = this.getHoyLocal();

    // Días del mes anterior
    const ultimoDiaMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const num = ultimoDiaMesAnterior - i;
      const fDate = new Date(año, mes - 1, num);
      dias.push(this.crearDiaCalendario(fDate, false, hoyStr));
    }

    // Días del mes actual
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fDate = new Date(año, mes, dia);
      dias.push(this.crearDiaCalendario(fDate, true, hoyStr));
    }

    // Días del mes siguiente para completar múltiplo de 7
    const resto = dias.length % 7;
    if (resto > 0) {
      const faltan = 7 - resto;
      for (let dia = 1; dia <= faltan; dia++) {
        const fDate = new Date(año, mes + 1, dia);
        dias.push(this.crearDiaCalendario(fDate, false, hoyStr));
      }
    }

    this.diasCalendarioMensual = dias;
    this.cdr.markForCheck();
  }

  private crearDiaCalendario(fDate: Date, esMesActual: boolean, hoyStr: string): DiaCalendario {
    const y = fDate.getFullYear();
    const m = String(fDate.getMonth() + 1).padStart(2, '0');
    const d = String(fDate.getDate()).padStart(2, '0');
    const fechaStr = `${y}-${m}-${d}`;
    const dayOfWeek = fDate.getDay();
    const esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6;

    const mapaDias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaNombre = mapaDias[dayOfWeek];

    const clases = (!esFinDeSemana && this.esDocente && this.todasLasAsignacionesDocente.length > 0)
      ? this.todasLasAsignacionesDocente.filter(a => {
          const ad = (a.dia_semana || a.dia || '').toLowerCase();
          return ad === diaSemanaNombre || (diaSemanaNombre === 'miercoles' && (ad === 'miércoles' || ad === 'miercoles'));
        })
      : [];

    const tieneClases = clases.length > 0;
    const esPasado = fechaStr < hoyStr;
    const esDeshabilitado = esPasado || (this.esDocente && this.tieneAsignaciones && !tieneClases);

    return {
      fecha: fechaStr,
      diaNumero: fDate.getDate(),
      diaSemana: diaSemanaNombre,
      esMesActual: esMesActual,
      esHoy: fechaStr === hoyStr,
      esPasado: esPasado,
      esFinDeSemana: esFinDeSemana,
      tieneClases: tieneClases,
      esDeshabilitado: esDeshabilitado,
      clases: clases
    };
  }

  mesAnterior(): void {
    this.fechaCalendarioActual = new Date(this.fechaCalendarioActual.getFullYear(), this.fechaCalendarioActual.getMonth() - 1, 1);
    this.generarCalendarioMensual();
  }

  mesSiguiente(): void {
    this.fechaCalendarioActual = new Date(this.fechaCalendarioActual.getFullYear(), this.fechaCalendarioActual.getMonth() + 1, 1);
    this.generarCalendarioMensual();
  }

  irAHoy(): void {
    this.fechaCalendarioActual = new Date();
    this.generarCalendarioMensual();
  }

  seleccionarDiaCalendario(dia: DiaCalendario): void {
    if (dia.esPasado) {
      this.abrirPopupErrorHorario('No es posible realizar esa reserva: la fecha seleccionada ya ha transcurrido.');
      return;
    }
    if (!dia.esMesActual) return;
    if (dia.esFinDeSemana) {
      this.abrirPopupErrorHorario('No es posible realizar esa reserva: no se dictan clases los fines de semana. Solo podés solicitar reservas dentro de tus días y horarios escolares asignados.');
      return;
    }
    if (this.esDocente && this.tieneAsignaciones && !dia.tieneClases) {
      const diaCap = dia.diaSemana ? (dia.diaSemana.charAt(0).toUpperCase() + dia.diaSemana.slice(1)) : 'este día';
      this.abrirPopupErrorHorario(`No es posible realizar esa reserva: no tenés clases asignadas los días ${diaCap}. Solo podés solicitar reservas en los días y horarios en los que das clase.`);
      return;
    }
    if (dia.esDeshabilitado) return;
    if (this.bloqueAsignado) {
      if (dia.fecha !== this.reservaForm.get('fechaDesde')?.value) {
        this.abrirPopupErrorHorario(`No es posible realizar esa reserva: estás reservando el horario asignado de tu clase (${this.bloqueAsignado.materia} - ${this.bloqueAsignado.horaInicio} a ${this.bloqueAsignado.horaFin} hs). No podés reservar en una fecha fuera de tu clase.`);
        return;
      }
      return; // En modo vinculado a clase oficial no se altera la fecha
    }

    this.reservaForm.patchValue({
      fechaDesde: dia.fecha,
      fechaHasta: dia.fecha
    });

    if (dia.clases && dia.clases.length > 0) {
      const primera = dia.clases[0];
      this.aplicarHorarioClase(primera);
    } else {
      this.validarHorarioDocente();
    }

    const salaId = this.reservaForm.get('sala')?.value;
    if (salaId) {
      this.actualizarHorariosDisponibles(dia.fecha);
    }

    this.cdr.markForCheck();
  }

  aplicarHorarioClase(clase: any): void {
    const mat = clase.materiaNombre;
    const cur = clase.cursoNombre;
    const hi = (clase.hora_inicio || clase.horaInicio || '').substring(0, 5);
    const hf = (clase.hora_fin || clase.horaFin || '').substring(0, 5);

    this.bloqueAsignado = {
      horaInicio: hi,
      horaFin: hf,
      materia: mat || '',
      curso: cur || '',
      diaSemana: clase.dia_semana || clase.dia || ''
    };

    if (mat && this.materiasDisponibles.includes(mat)) {
      this.actualizarCursosPorMateria(mat);
    }

    this.reservaForm.patchValue({
      materia: mat || this.reservaForm.get('materia')?.value,
      curso: cur || this.reservaForm.get('curso')?.value,
      horaDesde: hi || this.reservaForm.get('horaDesde')?.value,
      horaHasta: hf || this.reservaForm.get('horaHasta')?.value
    });

    // Auto-seleccionar laboratorio correspondiente según ciclo del curso
    let targetSalaId: number | string | undefined = '';
    if (cur) {
      if (cur.includes('4°') || cur.includes('5°') || cur.includes('6°')) {
        const orientada = this.salas.find(s => s.ciclo?.toLowerCase().includes('orientado')) || this.salas[0];
        if (orientada?.id !== undefined) targetSalaId = orientada.id;
      } else {
        const basica = this.salas.find(s => s.ciclo?.toLowerCase().includes('básico')) || this.salas[0];
        if (basica?.id !== undefined) targetSalaId = basica.id;
      }
    }
    if (targetSalaId) {
      this.reservaForm.patchValue({ sala: Number(targetSalaId) });
      this.consultarDisponibilidad(Number(targetSalaId));
    }

    this.errorTiempoAsignado = '';
    this.validarHorarioDocente();
    this.cdr.markForCheck();
  }

  seleccionarProximaClaseDocente(): void {
    if (!this.todasLasAsignacionesDocente || this.todasLasAsignacionesDocente.length === 0) return;

    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const f = new Date(hoy);
      f.setDate(hoy.getDate() + i);
      const y = f.getFullYear();
      const m = String(f.getMonth() + 1).padStart(2, '0');
      const d = String(f.getDate()).padStart(2, '0');
      const fStr = `${y}-${m}-${d}`;

      const mapaDias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const diaSem = mapaDias[f.getDay()];

      const clases = this.todasLasAsignacionesDocente.filter(a => {
        const ad = (a.dia_semana || a.dia || '').toLowerCase();
        return ad === diaSem || (diaSem === 'miercoles' && (ad === 'miércoles' || ad === 'miercoles'));
      });

      if (clases.length > 0) {
        this.reservaForm.patchValue({
          fechaDesde: fStr,
          fechaHasta: fStr
        });
        this.fechaCalendarioActual = new Date(f.getFullYear(), f.getMonth(), 1);
        this.generarCalendarioMensual();
        this.aplicarHorarioClase(clases[0]);
        break;
      }
    }
  }

  get fechaFormateada(): string {
    const f = this.reservaForm?.get('fechaDesde')?.value;
    if (!f) return '';
    const [y, m, d] = f.split('-').map(Number);
    if (!y || !m || !d) return f;
    const dateObj = new Date(y, m - 1, d);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[dateObj.getDay()]} ${d} de ${meses[m - 1]}, ${y}`;
  }

  get salaSeleccionadaNombre(): string {
    const sId = this.reservaForm?.get('sala')?.value;
    const sala = this.salas.find(s => Number(s.id) === Number(sId));
    return sala ? `${sala.nombre} (${sala.ciclo})` : 'Laboratorio';
  }

  esClaseSeleccionada(clase: any): boolean {
    const m = this.reservaForm?.get('materia')?.value;
    const hd = this.reservaForm?.get('horaDesde')?.value;
    const hf = this.reservaForm?.get('horaHasta')?.value;
    const hi = (clase.hora_inicio || clase.horaInicio || '').substring(0, 5);
    const hfin = (clase.hora_fin || clase.horaFin || '').substring(0, 5);

    return (
      (clase.materiaNombre || '').trim().toLowerCase() === (m || '').trim().toLowerCase() &&
      hi === hd &&
      hfin === hf
    );
  }

  get horarioSeleccionadoOcupado(): boolean {
    const hD = this.reservaForm?.get('horaDesde')?.value;
    const hH = this.reservaForm?.get('horaHasta')?.value;
    if (!hD || !hH) return false;
    return this.horariosOcupados.some(oc => hD < oc.fin && hH > oc.inicio);
  }

  get reservaOcupadaConflicto(): HorarioOcupado | undefined {
    const hD = this.reservaForm?.get('horaDesde')?.value;
    const hH = this.reservaForm?.get('horaHasta')?.value;
    if (!hD || !hH) return undefined;
    return this.horariosOcupados.find(oc => hD < oc.fin && hH > oc.inicio);
  }

  esHorarioOcupadoDeClase(clase: any): boolean {
    const hi = (clase.hora_inicio || clase.horaInicio || '').substring(0, 5);
    const hf = (clase.hora_fin || clase.horaFin || '').substring(0, 5);
    if (!hi || !hf) return false;
    return this.horariosOcupados.some(oc => hi < oc.fin && hf > oc.inicio);
  }

  getDocenteOcupadoDeClase(clase: any): string {
    const hi = (clase.hora_inicio || clase.horaInicio || '').substring(0, 5);
    const hf = (clase.hora_fin || clase.horaFin || '').substring(0, 5);
    const oc = this.horariosOcupados.find(o => hi < o.fin && hf > o.inicio);
    return oc ? (oc.usuarioNombre || 'Docente') : '';
  }

  reservarDirecto(clase: any): void {
    const hoyLocal = this.getHoyLocal();
    const fechaSel = this.reservaForm.get('fechaDesde')?.value;
    const hi = (clase.hora_inicio || clase.horaInicio || '').substring(0, 5);
    const d = new Date();
    const horaActual = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (fechaSel === hoyLocal && hi <= horaActual) {
      this.abrirPopupErrorHorario(`No es posible realizar esa reserva: el horario de esta clase (${hi} a ${(clase.hora_fin || clase.horaFin || '').substring(0, 5)} hs) ya ha transcurrido hoy.`);
      return;
    }
    this.aplicarHorarioClase(clase);
    this.confirmarReserva();
  }

  scrollToSeccion(seccionId: string): void {
    const el = document.getElementById(seccionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  seleccionarLabDesdeCard(lab: Lab): void {
    if (!lab || !lab.id) return;
    this.reservaForm.patchValue({ sala: Number(lab.id) });
    this.consultarDisponibilidad(Number(lab.id));
    this.salaFiltroAgenda = String(lab.id);
    this.cdr.markForCheck();
  }

  esSalaSeleccionada(labId: number | string): boolean {
    const val = this.reservaForm.get('sala')?.value;
    return val !== undefined && val !== null && String(val) === String(labId);
  }

  // Métodos Agenda Semanal Unificada Integrada
  private obtenerLunes(d: Date): Date {
    const fecha = new Date(d);
    const day = (fecha.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
    fecha.setDate(fecha.getDate() - day);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  generarDiasSemana(): void {
    const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const hoyStr = this.getHoyLocal();

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

  get labsFiltradosAgenda(): Lab[] {
    if (this.salaFiltroAgenda === 'todas') {
      return this.salas;
    }
    return this.salas.filter(l => String(l.id) === String(this.salaFiltroAgenda));
  }

  seleccionarSalaAgenda(id: number | string): void {
    this.salaFiltroAgenda = String(id);
    this.cdr.markForCheck();
  }

  esSalaSeleccionadaAgenda(id: number | string): boolean {
    return this.salaFiltroAgenda === String(id);
  }

  getSlot(labId: number | string, fecha: string, bloque: BloqueHorario): SlotCelda {
    const lab = this.salas.find(l => String(l.id) === String(labId));
    const salaNombre = lab ? lab.nombre : `Laboratorio #${labId}`;

    // Buscar reservas confirmadas de esta sala en este día que se solapen con este bloque
    const solapada = this.todasLasReservasConfirmadas.find(r => {
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
    const ahora = new Date();
    const hoyStr = this.getHoyLocal();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    if (slot.fecha < hoyStr || (slot.fecha === hoyStr && slot.horaInicio <= horaActual)) {
      this.abrirPopupErrorHorario('No es posible realizar esa reserva: la fecha u hora ya ha transcurrido.');
      return;
    }

    if (this.esDocente && this.tieneAsignaciones) {
      const diaSemana = this.obtenerDiaSemanaDeFecha(slot.fecha);
      if (diaSemana === 'sabado' || diaSemana === 'domingo') {
        this.abrirPopupErrorHorario('No es posible realizar esa reserva: no se dictan clases los fines de semana.');
        return;
      }
      const clases = this.todasLasAsignacionesDocente.filter(a => {
        const ad = (a.dia_semana || a.dia || '').toLowerCase();
        return ad === diaSemana || (diaSemana === 'miercoles' && (ad === 'miércoles' || ad === 'miercoles'));
      });
      if (clases.length === 0) {
        const diaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        this.abrirPopupErrorHorario(`No es posible realizar esa reserva: no tenés clases asignadas los días ${diaCap}. Solo podés solicitar reservas en los días y horarios en los que das clase.`);
        return;
      }
      const claseEnHorario = clases.find(c => {
        const hi = (c.hora_inicio || c.horaInicio || '').substring(0, 5);
        const hf = (c.hora_fin || c.horaFin || '').substring(0, 5);
        return slot.horaInicio >= hi && slot.horaFin <= hf;
      });
      if (!claseEnHorario) {
        const resumen = clases.map(c => `${c.materiaNombre || 'Clase'} (${(c.hora_inicio || c.horaInicio || '').substring(0, 5)} a ${(c.hora_fin || c.horaFin || '').substring(0, 5)} hs)`).join(', ');
        this.abrirPopupErrorHorario(`No es posible realizar esa reserva: el horario seleccionado (${slot.horaInicio} a ${slot.horaFin} hs) está fuera de tu horario escolar de clase (${resumen}).`);
        return;
      }

      this.reservaForm.patchValue({
        sala: Number(slot.salaId),
        fechaDesde: slot.fecha,
        fechaHasta: slot.fecha
      });
      this.aplicarHorarioClase(claseEnHorario);
      this.confirmarReserva();
      return;
    }

    this.reservaForm.patchValue({
      sala: Number(slot.salaId),
      fechaDesde: slot.fecha,
      fechaHasta: slot.fecha,
      horaDesde: slot.horaInicio,
      horaHasta: slot.horaFin
    });
    this.consultarDisponibilidad(Number(slot.salaId));
    this.confirmarReserva();
  }

  verDetalleInfo(slot: SlotCelda): void {
    this.reservaModalInfo = slot;
    this.cdr.markForCheck();
  }

  cerrarModalInfo(): void {
    this.reservaModalInfo = null;
    this.cdr.markForCheck();
  }

  calcularProximaFechaDia(diaSemana: string): string {
    const mapaDias: { [key: string]: number } = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'miércoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6,
      'sábado': 6
    };
    const targetDay = mapaDias[diaSemana.toLowerCase()];
    if (targetDay === undefined) {
      return this.hoyFecha;
    }

    const hoy = new Date();
    const currentDay = hoy.getDay();
    let diff = targetDay - currentDay;

    // Si hoy es el mismo día pero ya pasó el horario escolar (>= 18:00 hs), o si ya pasó el día en la semana
    if (diff < 0 || (diff === 0 && hoy.getHours() >= 18)) {
      diff += 7;
    }

    const fechaResult = new Date(hoy);
    fechaResult.setDate(hoy.getDate() + diff);

    const year = fechaResult.getFullYear();
    const month = String(fechaResult.getMonth() + 1).padStart(2, '0');
    const day = String(fechaResult.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validarTiempoAsignado(): boolean {
    this.errorTiempoAsignado = '';
    if (!this.bloqueAsignado) return true;

    const hd = this.reservaForm.get('horaDesde')?.value;
    const hf = this.reservaForm.get('horaHasta')?.value;
    if (!hd || !hf) return true;

    if (hd < this.bloqueAsignado.horaInicio) {
      this.errorTiempoAsignado = `No es posible realizar esa reserva: la hora de inicio (${hd} hs) no puede ser anterior al horario asignado para esta clase (${this.bloqueAsignado.horaInicio} hs).`;
      return false;
    }

    if (hf > this.bloqueAsignado.horaFin) {
      this.errorTiempoAsignado = `No es posible realizar esa reserva: el horario solicitado (${hf} hs) supera el horario asignado para esta clase (${this.bloqueAsignado.horaFin} hs).`;
      return false;
    }

    if (hd >= hf) {
      this.errorTiempoAsignado = 'No es posible realizar esa reserva: la hora de finalización debe ser posterior a la de inicio.';
      return false;
    }

    return true;
  }

  validarHorarioDocente(): boolean {
    this.errorHorarioDocente = '';

    if (this.bloqueAsignado) {
      return this.validarTiempoAsignado();
    }

    if (!this.esDocente || !this.tieneAsignaciones) {
      return true;
    }

    const fecha = this.reservaForm.get('fechaDesde')?.value;
    const horaDesde = this.reservaForm.get('horaDesde')?.value;
    const horaHasta = this.reservaForm.get('horaHasta')?.value;
    const materia = this.reservaForm.get('materia')?.value;

    if (!fecha || !horaDesde || !horaHasta) {
      return true;
    }

    const diaSemana = this.obtenerDiaSemanaDeFecha(fecha);
    if (diaSemana === 'sabado' || diaSemana === 'domingo') {
      this.errorHorarioDocente = 'No es posible realizar esa reserva: no se dictan clases los fines de semana. Solo podés solicitar reservas de lunes a viernes dentro de tu horario asignado.';
      return false;
    }

    const clasesDia = this.clasesDelDiaSeleccionado;
    if (!clasesDia || clasesDia.length === 0) {
      const diaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      this.errorHorarioDocente = `No es posible realizar esa reserva: no tenés clases asignadas los días ${diaCap}. Solo podés solicitar reservas en los días y horarios que tengas asignados en tu horario docente.`;
      return false;
    }

    const clasesCandidatas = materia
      ? clasesDia.filter(c => (c.materiaNombre || '').trim().toLowerCase() === materia.trim().toLowerCase())
      : clasesDia;

    const listaEvaluada = clasesCandidatas.length > 0 ? clasesCandidatas : clasesDia;

    const bloqueValido = listaEvaluada.some(c => {
      const hi = (c.hora_inicio || c.horaInicio || '').substring(0, 5);
      const hf = (c.hora_fin || c.horaFin || '').substring(0, 5);
      return horaDesde >= hi && horaHasta <= hf;
    });

    if (!bloqueValido) {
      const resumen = listaEvaluada.map(c => `${c.materiaNombre || 'Clase'} (${c.hora_inicio} a ${c.hora_fin} hs)`).join(', ');
      this.errorHorarioDocente = `No es posible realizar esa reserva: el horario solicitado (${horaDesde} a ${horaHasta} hs) está fuera de tu horario escolar de clase (${resumen}).`;
      return false;
    }

    if (horaDesde >= horaHasta) {
      this.errorHorarioDocente = 'No es posible realizar esa reserva: la hora de finalización debe ser posterior a la de inicio.';
      return false;
    }

    return true;
  }

  desvincularBloqueAsignado(): void {
    this.bloqueAsignado = null;
    this.errorTiempoAsignado = '';
    this.validarHorarioDocente();
    this.cdr.markForCheck();
  }

  aplicarParametrosURL(params: Params): void {
    if (!params || Object.keys(params).length === 0) return;

    let fechaSugerida = '';
    if (params['dia']) {
      fechaSugerida = this.calcularProximaFechaDia(params['dia']);
    } else if (params['fecha']) {
      fechaSugerida = params['fecha'];
    }

    if (fechaSugerida) {
      this.reservaForm.patchValue({
        fechaDesde: fechaSugerida,
        fechaHasta: fechaSugerida
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

    // Registrar bloque asignado y activar restricción estricta de tiempo
    if (params['horaDesde'] && params['horaHasta'] && (params['materia'] || params['curso'])) {
      this.bloqueAsignado = {
        horaInicio: params['horaDesde'],
        horaFin: params['horaHasta'],
        materia: params['materia'] || '',
        curso: params['curso'] || '',
        diaSemana: params['dia'] || ''
      };
      this.validarTiempoAsignado();
    }

    // Preseleccionar laboratorio según ciclo si no vino explícito
    let targetSalaId = params['salaId'] || params['sala'];
    if (!targetSalaId && this.salas && this.salas.length > 0) {
      const cur = params['curso'] || this.reservaForm.get('curso')?.value || '';
      if (cur.includes('4°') || cur.includes('5°') || cur.includes('6°')) {
        const orientada = this.salas.find(s => s.ciclo?.toLowerCase().includes('orientado')) || this.salas[0];
        targetSalaId = orientada.id;
      } else {
        const basica = this.salas.find(s => s.ciclo?.toLowerCase().includes('básico')) || this.salas[0];
        targetSalaId = basica.id;
      }
    }

    if (targetSalaId) {
      this.reservaForm.patchValue({ sala: Number(targetSalaId) });
      this.consultarDisponibilidad(Number(targetSalaId));
    }

    const currentNetbooks = this.reservaForm.get('netbooks')?.value;
    if (!currentNetbooks || Number(currentNetbooks) <= 0) {
      this.reservaForm.patchValue({ netbooks: 25 });
    }

    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.lunesSemanaActual = this.obtenerLunes(new Date());
    this.generarDiasSemana();
    this.generarCalendarioMensual();

    // Escuchar parámetros de URL para precompletar desde Mi Horario, agenda o enlaces
    this.route.queryParams.subscribe(params => {
      this.queryParamsCache = params;
      this.aplicarParametrosURL(params);
    });

    // Cargar todas las reservas para validar tope semanal y renderizar agenda semanal
    this.reservationService.getAllReservations().subscribe({
      next: (all) => {
        this.todasLasReservasConfirmadas = all.filter(r => r.estado === 'confirmada');
        this.cdr.markForCheck();
      },
      error: (e) => console.warn('Error al precargar reservas para validación de topes:', e)
    });

    // Cargar laboratorios activos
    this.labsService.getLabs().subscribe({
      next: (labs) => {
        this.salas = labs.filter(l => l.activa !== false);
        if (this.queryParamsCache && Object.keys(this.queryParamsCache).length > 0) {
          this.aplicarParametrosURL(this.queryParamsCache);
        }
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

    // Cargar materias y cursos asignados si el usuario es docente
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.rol === 'docente' && currentUser.id) {
      this.esDocente = true;
      this.docentesService.getMateriasDocente(Number(currentUser.id)).subscribe({
        next: (data) => {
          if (data && data.materias && data.materias.length > 0) {
            this.tieneAsignaciones = true;
            this.todasLasAsignacionesDocente = data.asignaciones || [];
            this.materiasDisponibles = data.materias.map(m => m.nombre);
            this.cursosDisponibles = data.cursos.map(c => c.nombre);

            this.generarCalendarioMensual();
            this.validarHorarioDocente();

            if (!this.bloqueAsignado && (!this.queryParamsCache || Object.keys(this.queryParamsCache).length === 0)) {
              this.seleccionarProximaClaseDocente();
            } else {
              const matActual = this.queryParamsCache['materia'] || this.reservaForm.get('materia')?.value;
              const curActual = this.queryParamsCache['curso'] || this.reservaForm.get('curso')?.value;

              if (matActual && this.materiasDisponibles.includes(matActual)) {
                this.actualizarCursosPorMateria(matActual);
                this.reservaForm.patchValue({
                  materia: matActual,
                  curso: (curActual && this.cursosFiltradosPorMateria.includes(curActual)) ? curActual : (this.cursosFiltradosPorMateria[0] || '')
                });
              } else {
                const primeraMateria = this.materiasDisponibles[0];
                this.actualizarCursosPorMateria(primeraMateria);
                this.reservaForm.patchValue({
                  materia: primeraMateria,
                  curso: this.cursosFiltradosPorMateria[0] || (this.cursosDisponibles[0] || '')
                });
              }
            }
          } else {
            this.tieneAsignaciones = false;
            this.cursosFiltradosPorMateria = [...this.cursosDisponibles];
            this.generarCalendarioMensual();
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.warn('No se pudieron obtener materias asignadas del docente:', err);
          this.cursosFiltradosPorMateria = [...this.cursosDisponibles];
          this.generarCalendarioMensual();
          this.cdr.markForCheck();
        }
      });
    } else {
      this.cursosFiltradosPorMateria = [...this.cursosDisponibles];
      this.generarCalendarioMensual();
    }

    // Al cambiar la materia, filtrar los cursos disponibles para el docente
    this.reservaForm.get('materia')?.valueChanges.subscribe(matSel => {
      if (matSel) {
        this.actualizarCursosPorMateria(matSel);
        if (!this.bloqueAsignado) {
          this.validarHorarioDocente();
        }
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
        if (!this.bloqueAsignado) {
          const [y, m] = fecha.split('-').map(Number);
          if (y && m) {
            this.fechaCalendarioActual = new Date(y, m - 1, 1);
            this.generarCalendarioMensual();
          }
          this.validarHorarioDocente();
        }
      }
      const salaId = this.reservaForm.get('sala')?.value;
      if (salaId) {
        this.actualizarHorariosDisponibles(fecha);
      }
    });
  }

  actualizarCursosPorMateria(materiaNombre: string): void {
    if (this.tieneAsignaciones && this.todasLasAsignacionesDocente.length > 0) {
      const asignadas = this.todasLasAsignacionesDocente
        .filter(a => (a.materiaNombre || '').trim().toLowerCase() === (materiaNombre || '').trim().toLowerCase())
        .map(a => a.cursoNombre);
      const setCursos = Array.from(new Set(asignadas));
      this.cursosFiltradosPorMateria = setCursos.length > 0 ? setCursos : [...this.cursosDisponibles];
    } else {
      this.cursosFiltradosPorMateria = [...this.cursosDisponibles];
    }

    const cursoActual = this.reservaForm.get('curso')?.value;
    if (!this.cursosFiltradosPorMateria.includes(cursoActual) && this.cursosFiltradosPorMateria.length > 0) {
      this.reservaForm.patchValue({ curso: this.cursosFiltradosPorMateria[0] }, { emitEvent: false });
    }
    this.cdr.markForCheck();
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

    if (!this.bloqueAsignado && (!this.esDocente || !this.tieneAsignaciones) && horarioActualOcupado && this.franjasDisponibles.length > 0) {
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
    if (this.bloqueAsignado) {
      if (franja.inicio < this.bloqueAsignado.horaInicio || franja.fin > this.bloqueAsignado.horaFin) {
        this.abrirPopupErrorHorario(`No es posible realizar esa reserva: el horario seleccionado (${franja.inicio} a ${franja.fin} hs) está fuera de tu horario escolar asignado (${this.bloqueAsignado.horaInicio} a ${this.bloqueAsignado.horaFin} hs).`);
        return;
      }
    } else if (this.esDocente && this.tieneAsignaciones) {
      const clasesDia = this.clasesDelDiaSeleccionado;
      const dentroDeClase = clasesDia && clasesDia.some(c => {
        const hi = (c.hora_inicio || c.horaInicio || '').substring(0, 5);
        const hf = (c.hora_fin || c.horaFin || '').substring(0, 5);
        return franja.inicio >= hi && franja.fin <= hf;
      });
      if (!dentroDeClase) {
        const resumen = (clasesDia && clasesDia.length > 0)
          ? clasesDia.map(c => `${c.materiaNombre || 'Clase'} (${(c.hora_inicio || c.horaInicio || '').substring(0, 5)} a ${(c.hora_fin || c.horaFin || '').substring(0, 5)} hs)`).join(', ')
          : 'no tenés clases asignadas en esta fecha';
        this.abrirPopupErrorHorario(`No es posible realizar esa reserva: el horario seleccionado (${franja.inicio} a ${franja.fin} hs) está fuera del horario en el que das clase (${resumen}).`);
        return;
      }
    }
    this.reservaForm.patchValue({
      horaDesde: franja.inicio,
      horaHasta: franja.fin
    });
    this.validarHorarioDocente();
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

    if (this.bloqueAsignado) {
      if (!this.validarTiempoAsignado()) {
        this.errorFormulario = true;
        this.errorMessage = this.errorTiempoAsignado;
        this.abrirPopupErrorHorario(this.errorTiempoAsignado);
        this.cdr.markForCheck();
        return;
      }
    } else {
      if (!this.validarHorarioDocente()) {
        this.errorFormulario = true;
        this.errorMessage = this.errorHorarioDocente;
        this.abrirPopupErrorHorario(this.errorHorarioDocente);
        this.cdr.markForCheck();
        return;
      }
    }

    const currentUser = this.authService.getCurrentUser();
    const usuarioId = currentUser?.id ? Number(currentUser.id) : 2;

    const formVals = this.reservaForm.getRawValue();
    const { sala, fechaDesde, horaDesde, horaHasta, curso, materia, netbooks } = formVals;
    const salaId = Number(sala);

    // El usuario elije fecha de inicio y por defecto la fecha de fin es el mismo día
    const fechaFin = formVals.fechaHasta || fechaDesde;

    const hoyLocal = this.getHoyLocal();
    const d = new Date();
    const horaActual = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const ahoraStr = `${hoyLocal}T${horaActual}`;

    const inicioNuevo = `${fechaDesde}T${horaDesde}`;
    const finNuevo = `${fechaFin}T${horaHasta}`;

    // Si la fecha u hora que intenta cargar ya pasó
    if (inicioNuevo <= ahoraStr) {
      this.errorRangoHorario = true;
      const msg = 'No es posible realizar esa reserva: la fecha u hora seleccionada ya ha transcurrido.';
      this.errorMessage = msg;
      this.abrirPopupErrorHorario(msg);
      this.cdr.markForCheck();
      return;
    }

    // Validar horario escolar: 07:00 a 18:00 hs
    if (horaDesde < '07:00' || horaDesde >= '18:00' || horaHasta <= '07:00' || horaHasta > '18:00') {
      this.errorRangoHorario = true;
      const msg = 'No es posible realizar esa reserva: fuera del horario escolar (07:00 a 18:00 hs).';
      this.errorMessage = msg;
      this.abrirPopupErrorHorario(msg);
      this.cdr.markForCheck();
      return;
    }

    if (horaDesde >= horaHasta) {
      // Paso 21: Error de rango horario
      this.errorRangoHorario = true;
      const msg = 'No es posible realizar esa reserva: la hora de finalización debe ser posterior a la de inicio.';
      this.errorMessage = msg;
      this.abrirPopupErrorHorario(msg);
      this.cdr.markForCheck();
      return;
    }

    // Validación automática de topes semanales de reserva por materia (máximo 3 por semana)
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

        // Error de tope semanal por materia o materia no asignada institucionalmente
        if (err.error?.materia) {
          this.errorFormulario = true;
          this.errorMessage = Array.isArray(err.error.materia) ? err.error.materia[0] : err.error.materia;
          this.cdr.markForCheck();
          return;
        }

        // Error de curso no asignado institucionalmente
        if (err.error?.curso) {
          this.errorFormulario = true;
          this.errorMessage = Array.isArray(err.error.curso) ? err.error.curso[0] : err.error.curso;
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

        // Error de horario docente fuera de clase
        if (err.error?.horario) {
          const msg = Array.isArray(err.error.horario) ? err.error.horario[0] : err.error.horario;
          this.errorMessage = msg;
          this.abrirPopupErrorHorario(msg);
          this.cdr.markForCheck();
          return;
        }

        // Horario escolar fuera de rango (07:00 a 18:00 hs)
        if (err.error?.horario_escolar) {
          this.errorRangoHorario = true;
          const msg = Array.isArray(err.error.horario_escolar) ? err.error.horario_escolar[0] : err.error.horario_escolar;
          this.errorMessage = msg || 'No es posible realizar esa reserva: fuera del horario escolar (07:00 a 18:00 hs).';
          this.abrirPopupErrorHorario(this.errorMessage);
          this.cdr.markForCheck();
          return;
        }

        // Error en inicio (fecha u hora pasada o no asignada)
        if (err.error?.inicio) {
          const msg = Array.isArray(err.error.inicio) ? err.error.inicio[0] : err.error.inicio;
          this.errorRangoHorario = true;
          this.errorMessage = msg;
          if (msg.includes('No es posible realizar esa reserva')) {
            this.abrirPopupErrorHorario(msg);
          }
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
          if (msg.includes('No es posible realizar esa reserva')) {
            this.errorMessage = msg;
            this.abrirPopupErrorHorario(msg);
            this.cdr.markForCheck();
            return;
          }
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