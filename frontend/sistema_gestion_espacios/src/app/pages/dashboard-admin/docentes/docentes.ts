import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DocentesService,
  DocenteCargaHoraria,
  Materia,
  Curso,
  AsignacionDocente,
  DiaDesglose,
  ConfiguracionInstitucional
} from '../../../services/docentes';

@Component({
  selector: 'app-docentes-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './docentes.html',
  styleUrl: './docentes.css'
})
export class DocentesAdmin implements OnInit {
  private docentesService = inject(DocentesService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Estados de datos
  docentes: DocenteCargaHoraria[] = [];
  materias: Materia[] = [];
  cursos: Curso[] = [];
  config: ConfiguracionInstitucional | null = null;
  loading = true;

  // Filtros
  searchTerm = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';
  filtroCiclo = '2026';

  // Vista activa: 'docentes' | 'todas_asignaciones'
  vistaActiva: 'docentes' | 'todas_asignaciones' = 'docentes';
  todasAsignaciones: AsignacionDocente[] = [];
  filtroCursoAsig = '';
  filtroMateriaAsig = '';
  filtroDiaAsig = '';

  // Docente seleccionado para Ver Ficha / Horario
  docenteSeleccionado: DocenteCargaHoraria | null = null;
  modalFichaVisible = false;

  // Modal Docente (Crear / Editar)
  modalDocenteVisible = false;
  editingDocenteId: number | string | null = null;
  docenteForm: FormGroup;
  autoPassword = true;
  passwordGeneradaModal: string | null = null;

  // Modal Asignación (Crear / Editar)
  modalAsignacionVisible = false;
  editingAsignacionId: number | string | null = null;
  asignacionForm: FormGroup;
  errorAsignacion = '';
  guardandoAsignacion = false;
  advertenciaSuperposicion = '';
  infoCatedraCompartida = '';

  // Modal Restablecer Password
  modalResetPasswordVisible = false;
  docenteParaReset: DocenteCargaHoraria | null = null;
  resetPasswordForm: FormGroup;
  resetAutoPassword = true;
  passwordRestablecidaExito = '';

  // Modal Configuración
  modalConfigVisible = false;
  configForm: FormGroup;

  // Días de la semana para la grilla
  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' }
  ];

  constructor() {
    this.docenteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      activo: [true]
    });

    this.asignacionForm = this.fb.group({
      docenteId: ['', Validators.required],
      materiaId: ['', Validators.required],
      cursoId: ['', Validators.required],
      dia_semana: ['lunes', Validators.required],
      hora_inicio: ['07:50', Validators.required],
      hora_fin: ['08:30', Validators.required],
      tipo_actividad: ['materia', Validators.required],
      ciclo_lectivo: ['2026', Validators.required],
      observaciones: ['']
    });

    this.resetPasswordForm = this.fb.group({
      password: ['']
    });

    this.configForm = this.fb.group({
      duracion_modulo_minutos: [40, [Validators.required, Validators.min(10), Validators.max(120)]],
      ciclo_lectivo_actual: ['2026', Validators.required]
    });

    // Escuchar cambios de horario para detector en vivo de superposiciones
    this.asignacionForm.valueChanges.subscribe(() => {
      this.detectarSuperposicionEnVivo();
    });
  }

  ngOnInit(): void {
    this.cargarDatosPrincipales();
  }

  cargarDatosPrincipales(): void {
    this.loading = true;
    this.docentesService.getConfiguracion().subscribe({
      next: (cfg) => {
        this.config = cfg;
        this.filtroCiclo = cfg.ciclo_lectivo_actual || '2026';
        this.configForm.patchValue({
          duracion_modulo_minutos: cfg.duracion_modulo_minutos,
          ciclo_lectivo_actual: cfg.ciclo_lectivo_actual
        });
      }
    });

    this.docentesService.getMaterias().subscribe({
      next: (mats) => { this.materias = mats; }
    });

    this.docentesService.getCursos().subscribe({
      next: (curs) => { this.cursos = curs; }
    });

    this.cargarDocentes();
    this.cargarTodasAsignaciones();
  }

  cargarDocentes(): void {
    const act = this.filtroEstado === 'todos' ? undefined : (this.filtroEstado === 'activos');
    this.docentesService.getDocentes(this.searchTerm, act, this.filtroCiclo).subscribe({
      next: (docs) => {
        this.docentes = docs;
        this.loading = false;
        // Si hay un docente seleccionado en ficha, actualizar sus datos
        if (this.docenteSeleccionado) {
          const updated = this.docentes.find(d => d.id === this.docenteSeleccionado?.id);
          if (updated) {
            this.docenteSeleccionado = updated;
          }
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar docentes:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarTodasAsignaciones(): void {
    this.docentesService.getAsignaciones({ ciclo: this.filtroCiclo }).subscribe({
      next: (asigs) => {
        this.todasAsignaciones = asigs;
        this.cdr.markForCheck();
      }
    });
  }

  // --- FILTROS Y ESTADÍSTICAS GLOBALES ---

  get docentesFiltrados(): DocenteCargaHoraria[] {
    return this.docentes.filter(d => {
      const matchSearch = !this.searchTerm.trim() ||
        `${d.nombre} ${d.apellido}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchEstado = this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activos' && d.activo) ||
        (this.filtroEstado === 'inactivos' && !d.activo);

      return matchSearch && matchEstado;
    });
  }

  get totalDocentesActivos(): number {
    return this.docentes.filter(d => d.activo).length;
  }

  get totalHorasInstitucionalesMinutos(): number {
    return this.docentes.reduce((acc, d) => acc + (d.totalMinutosSemanal || 0), 0);
  }

  get totalHorasInstitucionalesFormato(): string {
    const mins = this.totalHorasInstitucionalesMinutos;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  get totalModulosInstitucionales(): number {
    const dur = this.config?.duracion_modulo_minutos || 40;
    if (dur <= 0) return 0;
    return Math.round((this.totalHorasInstitucionalesMinutos / dur) * 10) / 10;
  }

  get asignacionesFiltradas(): AsignacionDocente[] {
    return this.todasAsignaciones.filter(a => {
      const matchCurso = !this.filtroCursoAsig || String(a.cursoId) === this.filtroCursoAsig;
      const matchMateria = !this.filtroMateriaAsig || String(a.materiaId) === this.filtroMateriaAsig;
      const matchDia = !this.filtroDiaAsig || a.dia_semana === this.filtroDiaAsig;
      return matchCurso && matchMateria && matchDia;
    });
  }

  // --- GESTIÓN DE CUENTAS DOCENTES ---

  abrirCrearDocente(): void {
    this.editingDocenteId = null;
    this.autoPassword = true;
    this.passwordGeneradaModal = null;
    this.docenteForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      activo: true
    });
    this.modalDocenteVisible = true;
  }

  abrirEditarDocente(d: DocenteCargaHoraria): void {
    this.editingDocenteId = d.id!;
    this.autoPassword = false;
    this.passwordGeneradaModal = null;
    this.docenteForm.patchValue({
      nombre: d.nombre,
      apellido: d.apellido,
      email: d.email,
      password: '',
      activo: d.activo
    });
    this.modalDocenteVisible = true;
  }

  cerrarModalDocente(): void {
    this.modalDocenteVisible = false;
    this.editingDocenteId = null;
    this.passwordGeneradaModal = null;
  }

  guardarDocente(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }

    const val = this.docenteForm.value;
    const data: any = {
      nombre: val.nombre.trim(),
      apellido: val.apellido.trim(),
      email: val.email.trim(),
      activo: val.activo
    };

    if (this.editingDocenteId) {
      if (val.password) data.password = val.password;
      this.docentesService.updateDocente(this.editingDocenteId, data).subscribe({
        next: () => {
          this.cerrarModalDocente();
          this.cargarDocentes();
        },
        error: (err) => {
          const msg = err.error?.email?.[0] || 'Error al actualizar docente.';
          alert(msg);
        }
      });
    } else {
      if (!this.autoPassword && val.password) {
        data.password = val.password;
      }
      this.docentesService.createDocente(data).subscribe({
        next: (created) => {
          if (created.passwordGenerada) {
            this.passwordGeneradaModal = created.passwordGenerada;
            this.cargarDocentes();
          } else {
            this.cerrarModalDocente();
            this.cargarDocentes();
          }
        },
        error: (err) => {
          const msg = err.error?.email?.[0] || 'Error al crear docente.';
          alert(msg);
        }
      });
    }
  }

  toggleEstadoDocente(d: DocenteCargaHoraria): void {
    const accion = d.activo ? 'desactivar (baja lógica)' : 'activar';
    if (confirm(`¿Deseas ${accion} la cuenta del docente ${d.nombre} ${d.apellido}?`)) {
      this.docentesService.updateDocente(d.id!, { activo: !d.activo }).subscribe({
        next: () => {
          this.cargarDocentes();
        },
        error: (err) => {
          alert('No se pudo cambiar el estado del docente.');
        }
      });
    }
  }

  abrirResetPassword(d: DocenteCargaHoraria): void {
    this.docenteParaReset = d;
    this.resetAutoPassword = true;
    this.passwordRestablecidaExito = '';
    this.resetPasswordForm.reset({ password: '' });
    this.modalResetPasswordVisible = true;
  }

  cerrarModalResetPassword(): void {
    this.modalResetPasswordVisible = false;
    this.docenteParaReset = null;
    this.passwordRestablecidaExito = '';
  }

  ejecutarResetPassword(): void {
    if (!this.docenteParaReset) return;
    const pass = this.resetAutoPassword ? undefined : this.resetPasswordForm.value.password;
    this.docentesService.resetPassword(this.docenteParaReset.id!, pass).subscribe({
      next: (res) => {
        this.passwordRestablecidaExito = res.nuevaPassword;
        this.cargarDocentes();
      },
      error: (err) => {
        alert(err.error?.error || 'No se pudo restablecer la contraseña.');
      }
    });
  }

  // --- FICHA Y DETALLE DEL DOCENTE ---

  verFichaDocente(d: DocenteCargaHoraria): void {
    this.docenteSeleccionado = d;
    this.modalFichaVisible = true;
  }

  cerrarFichaDocente(): void {
    this.modalFichaVisible = false;
    this.docenteSeleccionado = null;
  }

  // --- GESTIÓN DE ASIGNACIONES ---

  abrirCrearAsignacion(docenteId?: number | string): void {
    this.editingAsignacionId = null;
    this.errorAsignacion = '';
    this.advertenciaSuperposicion = '';
    this.infoCatedraCompartida = '';

    const targetDocenteId = docenteId || this.docenteSeleccionado?.id || (this.docentes[0]?.id || '');

    this.asignacionForm.reset({
      docenteId: targetDocenteId,
      materiaId: this.materias[0]?.id || '',
      cursoId: this.cursos[0]?.id || '',
      dia_semana: 'lunes',
      hora_inicio: '10:20',
      hora_fin: '12:00',
      tipo_actividad: 'materia',
      ciclo_lectivo: this.filtroCiclo || '2026',
      observaciones: ''
    });

    this.modalAsignacionVisible = true;
    this.detectarSuperposicionEnVivo();
  }

  abrirEditarAsignacion(a: AsignacionDocente): void {
    this.editingAsignacionId = a.id!;
    this.errorAsignacion = '';
    this.advertenciaSuperposicion = '';
    this.infoCatedraCompartida = '';

    this.asignacionForm.patchValue({
      docenteId: a.docenteId,
      materiaId: a.materiaId,
      cursoId: a.cursoId,
      dia_semana: a.dia_semana,
      hora_inicio: a.hora_inicio,
      hora_fin: a.hora_fin,
      tipo_actividad: a.tipo_actividad || 'materia',
      ciclo_lectivo: a.ciclo_lectivo || '2026',
      observaciones: a.observaciones || ''
    });

    this.modalAsignacionVisible = true;
    this.detectarSuperposicionEnVivo();
  }

  cerrarModalAsignacion(): void {
    this.modalAsignacionVisible = false;
    this.editingAsignacionId = null;
    this.errorAsignacion = '';
    this.advertenciaSuperposicion = '';
    this.infoCatedraCompartida = '';
  }

  // Detector en vivo de superposiciones antes de guardar
  detectarSuperposicionEnVivo(): void {
    this.advertenciaSuperposicion = '';
    this.infoCatedraCompartida = '';
    const val = this.asignacionForm.value;
    if (!val.docenteId || !val.dia_semana || !val.hora_inicio || !val.hora_fin) return;

    if (val.hora_fin <= val.hora_inicio) {
      this.advertenciaSuperposicion = 'La hora de finalización debe ser posterior a la hora de inicio.';
      return;
    }

    // 1. Detección de conflicto horario para el mismo docente (no puede superponerse consigo mismo)
    const doc = this.docentes.find(d => String(d.id) === String(val.docenteId));
    if (doc && doc.asignaciones) {
      const conflictDoc = doc.asignaciones.find(a => {
        if (this.editingAsignacionId && String(a.id) === String(this.editingAsignacionId)) return false;
        if (a.dia_semana !== val.dia_semana) return false;
        return val.hora_inicio < a.hora_fin && val.hora_fin > a.hora_inicio;
      });

      if (conflictDoc) {
        this.advertenciaSuperposicion = `⚠️ Superposición del docente: ${doc.nombre} ${doc.apellido} ya tiene asignada '${conflictDoc.materiaNombre}' (${conflictDoc.cursoNombre}) el ${val.dia_semana} de ${conflictDoc.hora_inicio} a ${conflictDoc.hora_fin} hs.`;
        return;
      }
    }

    // 2. Comprobar asignaciones existentes para el curso (Cátedra Compartida vs Conflicto de curso)
    if (val.cursoId && this.todasAsignaciones && this.todasAsignaciones.length > 0) {
      const conflictCurso = this.todasAsignaciones.find(a => {
        if (this.editingAsignacionId && String(a.id) === String(this.editingAsignacionId)) return false;
        if (String(a.cursoId) !== String(val.cursoId)) return false;
        if (a.dia_semana !== val.dia_semana) return false;
        if (String(a.docenteId) === String(val.docenteId)) return false;
        return val.hora_inicio < a.hora_fin && val.hora_fin > a.hora_inicio;
      });

      if (conflictCurso) {
        if (val.materiaId && String(conflictCurso.materiaId) === String(val.materiaId)) {
          this.infoCatedraCompartida = `ℹ️ Cátedra Compartida detectada: El curso ya tiene asignada '${conflictCurso.materiaNombre}' con ${conflictCurso.docenteNombre} en este horario. Al guardar, ambos docentes compartirán la cátedra (pareja pedagógica) y computarán sus horas.`;
        } else if (val.materiaId) {
          this.advertenciaSuperposicion = `⚠️ Conflicto de curso: El curso ya tiene asignada la materia distinta '${conflictCurso.materiaNombre}' con ${conflictCurso.docenteNombre} el ${val.dia_semana} de ${conflictCurso.hora_inicio} a ${conflictCurso.hora_fin} hs.`;
        }
      }
    }
  }

  get duracionCalculadaMinutosForm(): number {
    const hi = this.asignacionForm.get('hora_inicio')?.value;
    const hf = this.asignacionForm.get('hora_fin')?.value;
    if (!hi || !hf || hf <= hi) return 0;
    const [h1, m1] = hi.split(':').map(Number);
    const [h2, m2] = hf.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  get duracionCalculadaHorasForm(): string {
    const mins = this.duracionCalculadaMinutosForm;
    if (mins <= 0) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${mins} min (${h}h ${m}m)`;
    if (h > 0) return `${mins} min (${h}h)`;
    return `${mins} min`;
  }

  get modulosCalculadosForm(): number {
    const mins = this.duracionCalculadaMinutosForm;
    const durMod = this.config?.duracion_modulo_minutos || 40;
    if (durMod <= 0 || mins <= 0) return 0;
    return Math.round((mins / durMod) * 10) / 10;
  }

  guardarAsignacion(): void {
    if (this.asignacionForm.invalid) {
      this.asignacionForm.markAllAsTouched();
      return;
    }

    this.guardandoAsignacion = true;
    this.errorAsignacion = '';

    const payload: AsignacionDocente = {
      docenteId: Number(this.asignacionForm.value.docenteId),
      materiaId: Number(this.asignacionForm.value.materiaId),
      cursoId: Number(this.asignacionForm.value.cursoId),
      dia_semana: this.asignacionForm.value.dia_semana,
      hora_inicio: this.asignacionForm.value.hora_inicio,
      hora_fin: this.asignacionForm.value.hora_fin,
      tipo_actividad: this.asignacionForm.value.tipo_actividad,
      ciclo_lectivo: this.asignacionForm.value.ciclo_lectivo,
      observaciones: this.asignacionForm.value.observaciones || ''
    };

    if (this.editingAsignacionId) {
      this.docentesService.updateAsignacion(this.editingAsignacionId, payload).subscribe({
        next: () => {
          this.guardandoAsignacion = false;
          this.cerrarModalAsignacion();
          this.cargarDocentes();
          this.cargarTodasAsignaciones();
        },
        error: (err) => {
          this.guardandoAsignacion = false;
          const msg = err.error?.superposicion || err.error?.superposicion_curso || err.error?.hora_inicio?.[0] || 'Error al guardar asignación.';
          this.errorAsignacion = Array.isArray(msg) ? msg[0] : msg;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.docentesService.createAsignacion(payload).subscribe({
        next: () => {
          this.guardandoAsignacion = false;
          this.cerrarModalAsignacion();
          this.cargarDocentes();
          this.cargarTodasAsignaciones();
        },
        error: (err) => {
          this.guardandoAsignacion = false;
          const msg = err.error?.superposicion || err.error?.superposicion_curso || err.error?.hora_inicio?.[0] || 'Error al guardar asignación.';
          this.errorAsignacion = Array.isArray(msg) ? msg[0] : msg;
          this.cdr.markForCheck();
        }
      });
    }
  }

  eliminarAsignacion(id?: number): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este bloque de asignación horaria? La carga horaria se recalculará automáticamente.')) {
      this.docentesService.deleteAsignacion(id).subscribe({
        next: () => {
          this.cargarDocentes();
          this.cargarTodasAsignaciones();
        },
        error: (err) => {
          alert('No se pudo eliminar la asignación.');
        }
      });
    }
  }

  // --- CONFIGURACIÓN INSTITUCIONAL ---

  abrirConfig(): void {
    if (this.config) {
      this.configForm.patchValue({
        duracion_modulo_minutos: this.config.duracion_modulo_minutos,
        ciclo_lectivo_actual: this.config.ciclo_lectivo_actual
      });
    }
    this.modalConfigVisible = true;
  }

  cerrarModalConfig(): void {
    this.modalConfigVisible = false;
  }

  guardarConfig(): void {
    if (this.configForm.invalid) return;
    this.docentesService.updateConfiguracion(this.configForm.value).subscribe({
      next: (cfg) => {
        this.config = cfg;
        this.filtroCiclo = cfg.ciclo_lectivo_actual;
        this.cerrarModalConfig();
        this.cargarDocentes();
      },
      error: () => {
        alert('No se pudo guardar la configuración institucional.');
      }
    });
  }

  // Helper para badges de tipo de actividad
  badgeClase(tipo?: string): string {
    switch (tipo) {
      case 'tutoria': return 'bg-info text-dark border border-info-subtle';
      case 'taller': return 'bg-warning text-dark border border-warning-subtle';
      case 'club': return 'bg-success text-white border border-success-subtle';
      default: return 'bg-primary text-white border border-primary-subtle';
    }
  }

  copiarPassword(inputElem: HTMLInputElement): void {
    inputElem.select();
    navigator.clipboard.writeText(inputElem.value);
    alert('Contraseña copiada al portapapeles.');
  }

  getDesgloseDia(docente: DocenteCargaHoraria | null, diaKey: string): DiaDesglose {
    const fallback: DiaDesglose = {
      nombre: diaKey,
      minutos: 0,
      horasFormato: '0h 00m',
      modulos: 0,
      cantidadBloques: 0,
      bloques: []
    };
    if (!docente || !docente.desgloseDias) {
      return fallback;
    }
    const key = diaKey as 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';
    return (docente.desgloseDias[key] as DiaDesglose) || fallback;
  }
}
