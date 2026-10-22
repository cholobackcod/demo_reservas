import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, tap, catchError } from 'rxjs';

export interface Lab {
  id?: number | string;
  nombre: string;
  ciclo?: string;
  descripcion?: string;
  capacidad: number;
  imagen?: string;
  equipamiento?: string[];
  activa?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LabsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salas/`;
  private readonly CACHE_KEY = 'cached_labs';

  private getCachedLabs(): Lab[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setCachedLabs(labs: Lab[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(labs));
    } catch (e) {
      console.warn('Error al guardar salas en caché:', e);
    }
  }

  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl).pipe(
      tap(labs => this.setCachedLabs(labs)),
      catchError(err => {
        console.warn('Red no disponible. Cargando salas desde LocalStorage (Modo Offline)', err);
        return of(this.getCachedLabs());
      })
    );
  }

  getLabById(id: number | string): Observable<Lab> {
    return this.http.get<Lab>(`${this.apiUrl}${id}/`).pipe(
      catchError(err => {
        const found = this.getCachedLabs().find(l => String(l.id) === String(id));
        if (found) return of(found);
        throw err;
      })
    );
  }

  createLab(labData: Lab): Observable<Lab> {
    return this.http.post<Lab>(this.apiUrl, labData);
  }

  updateLab(id: number | string, labData: Partial<Lab>): Observable<Lab> {
    return this.http.patch<Lab>(`${this.apiUrl}${id}/`, labData);
  }

  deleteLab(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}