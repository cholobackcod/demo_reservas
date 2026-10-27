import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from './auth';

export interface Materia {
  id?: number;
  nombre: string;
  codigo?: string;
  tipo_predeterminado?: 'materia' | 'tutoria' | 'taller' | 'club';
  activa?: boolean;
}

export interface Curso {
  id?: number;
  anio: number;
  division: string;
  nombre: string;
}

export interface ConfiguracionInstitucional {
  id?: number;
  duracion_modulo_minutos: number;
  ciclo_lectivo_actual: string;
  nombre_institucion?: string;
}

export interface AsignacionDocente {
  id?: number;
  docenteId: number | string;
  docenteNombre?: string;
  docenteEmail?: string;
  materiaId: number;
  materiaNombre?: string;
  cursoId: number;
  cursoNombre?: string;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';
  hora_inicio: string; // "HH:MM"
  hora_fin: string;    // "HH:MM"
  duracionMinutos?: number;
  duracionHorasFormato?: string;
  tipo_actividad?: 'materia' | 'tutoria' | 'taller' | 'club';
  ciclo_lectivo?: string;
  observaciones?: string;
  esCatedraCompartida?: boolean;
  coDocentes?: string[];
  fecha_creacion?: string;
}

export interface DiaDesglose {
  nombre: string;
  minutos: number;
  horasFormato: string;
  modulos: number;
  cantidadBloques: number;
  bloques: AsignacionDocente[];
}

export interface DocenteCargaHoraria extends User {
  totalMinutosSemanal: number;
  totalHorasRelojFormato: string;
  totalHorasReloj: number;
  totalModulos: number;
  duracionModuloMinutos: number;
  desgloseDias: {
    lunes: DiaDesglose;
    martes: DiaDesglose;
    miercoles: DiaDesglose;
    jueves: DiaDesglose;
    viernes: DiaDesglose;
    [key: string]: DiaDesglose | undefined;
  };
  materiasAsignadas: string[];
  asignaciones: AsignacionDocente[];
  passwordGenerada?: string;
}

export interface MateriasDocenteResponse {
  docenteId: number;
  docenteNombre: string;
  materias: { id: number; nombre: string; departamento?: string }[];
  cursos: { id: number; nombre: string; anio?: number; division?: string }[];
  asignaciones?: any[];
  relaciones?: { materiaId: number; materiaNombre: string; cursoId: number; cursoNombre: string }[];
  tieneAsignaciones?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocentesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // --- DOCENTES ---

  getDocentes(search: string = '', activo?: boolean, ciclo?: string): Observable<DocenteCargaHoraria[]> {
    let params = new HttpParams();
    if (search.trim()) params = params.set('q', search.trim());
    if (activo !== undefined) params = params.set('activo', String(activo));
    if (ciclo) params = params.set('ciclo_lectivo', ciclo);
    return this.http.get<DocenteCargaHoraria[]>(`${this.apiUrl}/docentes/`, { params });
  }

  getDocenteById(id: number | string, ciclo?: string): Observable<DocenteCargaHoraria> {
    let params = new HttpParams();
    if (ciclo) params = params.set('ciclo_lectivo', ciclo);
    return this.http.get<DocenteCargaHoraria>(`${this.apiUrl}/docentes/${id}/`, { params });
  }

  createDocente(data: Partial<User>): Observable<DocenteCargaHoraria> {
    return this.http.post<DocenteCargaHoraria>(`${this.apiUrl}/docentes/`, data);
  }

  updateDocente(id: number | string, data: Partial<User>): Observable<DocenteCargaHoraria> {
    return this.http.patch<DocenteCargaHoraria>(`${this.apiUrl}/docentes/${id}/`, data);
  }

  deleteDocente(id: number | string, hard: boolean = false): Observable<{ mensaje: string }> {
    const params = new HttpParams().set('hard', String(hard));
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/docentes/${id}/`, { params });
  }

  resetPassword(id: number | string, password?: string): Observable<{ mensaje: string; nuevaPassword: string; autoGenerada: boolean }> {
    return this.http.post<{ mensaje: string; nuevaPassword: string; autoGenerada: boolean }>(
      `${this.apiUrl}/docentes/${id}/reset-password/`,
      { password }
    );
  }

  getMiHorario(docenteId: number | string, ciclo?: string): Observable<DocenteCargaHoraria> {
    let params = new HttpParams().set('docente_id', String(docenteId));
    if (ciclo) params = params.set('ciclo_lectivo', ciclo);
    return this.http.get<DocenteCargaHoraria>(`${this.apiUrl}/docentes/mi-horario/`, { params });
  }

  getMateriasDocente(docenteId: number | string, ciclo?: string): Observable<MateriasDocenteResponse> {
    let params = new HttpParams();
    if (ciclo) params = params.set('ciclo_lectivo', ciclo);
    return this.http.get<MateriasDocenteResponse>(`${this.apiUrl}/docentes/${docenteId}/materias/`, { params });
  }

  // --- ASIGNACIONES ---

  getAsignaciones(filters?: { docenteId?: number | string; cursoId?: number; materiaId?: number; dia?: string; ciclo?: string }): Observable<AsignacionDocente[]> {
    let params = new HttpParams();
    if (filters?.docenteId) params = params.set('docente_id', String(filters.docenteId));
    if (filters?.cursoId) params = params.set('curso_id', String(filters.cursoId));
    if (filters?.materiaId) params = params.set('materia_id', String(filters.materiaId));
    if (filters?.dia) params = params.set('dia', filters.dia);
    if (filters?.ciclo) params = params.set('ciclo_lectivo', filters.ciclo);
    return this.http.get<AsignacionDocente[]>(`${this.apiUrl}/asignaciones/`, { params });
  }

  createAsignacion(data: AsignacionDocente): Observable<AsignacionDocente> {
    return this.http.post<AsignacionDocente>(`${this.apiUrl}/asignaciones/`, data);
  }

  updateAsignacion(id: number | string, data: Partial<AsignacionDocente>): Observable<AsignacionDocente> {
    return this.http.patch<AsignacionDocente>(`${this.apiUrl}/asignaciones/${id}/`, data);
  }

  deleteAsignacion(id: number | string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/asignaciones/${id}/`);
  }

  // --- CATALOGOS Y CONFIGURACION ---

  getMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.apiUrl}/materias/`);
  }

  createMateria(data: Partial<Materia>): Observable<Materia> {
    return this.http.post<Materia>(`${this.apiUrl}/materias/`, data);
  }

  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/cursos/`);
  }

  createCurso(data: Partial<Curso>): Observable<Curso> {
    return this.http.post<Curso>(`${this.apiUrl}/cursos/`, data);
  }

  getConfiguracion(): Observable<ConfiguracionInstitucional> {
    return this.http.get<ConfiguracionInstitucional>(`${this.apiUrl}/configuracion/`);
  }

  updateConfiguracion(data: Partial<ConfiguracionInstitucional>): Observable<ConfiguracionInstitucional> {
    return this.http.patch<ConfiguracionInstitucional>(`${this.apiUrl}/configuracion/`, data);
  }
}
