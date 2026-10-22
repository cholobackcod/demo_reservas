import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, tap, catchError, BehaviorSubject } from 'rxjs';

export interface Reservation {
  id?: number | string;
  usuarioId: number | string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  salaId: number | string;
  inicio: string;
  fin: string;
  curso?: string;
  materia?: string;
  netbooks?: number;
  estado: 'confirmada' | 'finalizada' | 'cancelada' | string;
  offline?: boolean;
}

export type CreateReservationDto = {
  id?: number | string;
  usuarioId: number | string;
  salaId: number | string;
  inicio: string;
  fin: string;
  curso?: string;
  materia?: string;
  netbooks?: number;
  estado?: 'confirmada' | 'finalizada' | 'cancelada' | string;
};

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservas/`;

  private readonly CACHE_KEY = 'cached_reservas';
  private readonly PENDING_KEY = 'offline_reservas_pendientes';

  // Reactividad para el estado offline y sincronización (HU06)
  public isOffline$ = new BehaviorSubject<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  public pendingSyncCount$ = new BehaviorSubject<number>(this.getPendingOfflineCount());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOffline$.next(false);
        this.syncPendingReservations();
      });
      window.addEventListener('offline', () => {
        this.isOffline$.next(true);
      });
    }
  }

  private getCachedReservations(): Reservation[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setCachedReservations(reservas: Reservation[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(reservas));
    } catch (e) {
      console.warn('No se pudo guardar la caché de reservas:', e);
    }
  }

  public getPendingOfflineReservations(): CreateReservationDto[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.PENDING_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getPendingOfflineCount(): number {
    return this.getPendingOfflineReservations().length;
  }

  private savePendingOfflineReservation(reserva: CreateReservationDto): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const pending = this.getPendingOfflineReservations();
      pending.push(reserva);
      localStorage.setItem(this.PENDING_KEY, JSON.stringify(pending));
      this.pendingSyncCount$.next(pending.length);
    } catch (e) {
      console.warn('Error al guardar reserva offline:', e);
    }
  }

  public clearPendingOfflineReservations(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.PENDING_KEY);
    this.pendingSyncCount$.next(0);
  }

  // Obtiene el historial completo de reservas (con soporte offline)
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl).pipe(
      tap(reservas => this.setCachedReservations(reservas)),
      catchError(err => {
        console.warn('Red no disponible. Cargando reservas desde LocalStorage (Modo Offline)', err);
        return of(this.getCachedReservations());
      })
    );
  }

  // Obtiene reservas de un usuario específico (con fallback a LocalStorage)
  getReservationsByUser(usuarioId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?usuarioId=${usuarioId}`).pipe(
      tap(reservas => {
        const cached = this.getCachedReservations().filter(r => String(r.usuarioId) !== String(usuarioId));
        this.setCachedReservations([...cached, ...reservas]);
      }),
      catchError(err => {
        console.warn('Red no disponible. Filtrando reservas de usuario desde LocalStorage', err);
        const filtered = this.getCachedReservations().filter(r => String(r.usuarioId) === String(usuarioId));
        return of(filtered);
      })
    );
  }

  // Obtiene reservas de una sala específica
  getReservationsByLab(salaId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?salaId=${salaId}`).pipe(
      catchError(() => {
        const filtered = this.getCachedReservations().filter(r => String(r.salaId) === String(salaId));
        return of(filtered);
      })
    );
  }

  // Paso 2 del Diagrama de Secuencia: GET /api/v1/reservas/?salaId={id}&estado=confirmada
  getConfirmedReservationsByLab(salaId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?salaId=${salaId}&estado=confirmada`).pipe(
      tap(reservas => {
        const others = this.getCachedReservations().filter(r => !(String(r.salaId) === String(salaId) && r.estado === 'confirmada'));
        this.setCachedReservations([...others, ...reservas]);
      }),
      catchError(err => {
        console.warn('Red no disponible. Obteniendo reservas confirmadas desde LocalStorage', err);
        const filtered = this.getCachedReservations().filter(
          r => String(r.salaId) === String(salaId) && r.estado === 'confirmada'
        );
        return of(filtered);
      })
    );
  }

  // HU03 y HU06: Creación de reserva con soporte Offline en LocalStorage
  createReservation(reservationData: Reservation | CreateReservationDto): Observable<Reservation> {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline) {
      // Guardar directamente en LocalStorage para sincronizar al volver la red
      this.savePendingOfflineReservation(reservationData);
      const offlineReserva: Reservation = {
        ...reservationData,
        id: `offline-${Date.now()}`,
        estado: 'confirmada',
        offline: true
      };
      const cached = this.getCachedReservations();
      cached.push(offlineReserva);
      this.setCachedReservations(cached);
      return of(offlineReserva);
    }

    return this.http.post<Reservation>(this.apiUrl, reservationData).pipe(
      tap(created => {
        const cached = this.getCachedReservations();
        cached.push(created);
        this.setCachedReservations(cached);
      }),
      catchError(err => {
        if (err.status === 0) {
          // Caída de red durante el POST -> Guardar en LocalStorage
          this.savePendingOfflineReservation(reservationData);
          const offlineReserva: Reservation = {
            ...reservationData,
            id: `offline-${Date.now()}`,
            estado: 'confirmada',
            offline: true
          };
          const cached = this.getCachedReservations();
          cached.push(offlineReserva);
          this.setCachedReservations(cached);
          this.isOffline$.next(true);
          return of(offlineReserva);
        }
        throw err;
      })
    );
  }

  // Sincroniza las reservas guardadas en LocalStorage cuando se recupera la red
  public syncPendingReservations(): void {
    const pending = this.getPendingOfflineReservations();
    if (pending.length === 0) return;

    console.log(`Sincronizando ${pending.length} reservas pendientes desde LocalStorage...`);
    const toProcess = [...pending];
    this.clearPendingOfflineReservations();

    toProcess.forEach(item => {
      this.http.post<Reservation>(this.apiUrl, item).subscribe({
        next: (created) => {
          console.log('Reserva offline sincronizada con éxito:', created);
        },
        error: (err) => {
          console.error('Error al sincronizar reserva offline:', err);
          // Re-encolar si falla
          this.savePendingOfflineReservation(item);
        }
      });
    });
  }

  updateReservation(id: number | string, reservationData: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}${id}/`, reservationData).pipe(
      tap(updated => {
        const cached = this.getCachedReservations().map(r => String(r.id) === String(id) ? { ...r, ...updated } : r);
        this.setCachedReservations(cached);
      })
    );
  }

  deleteReservation(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => {
        const cached = this.getCachedReservations().map(r => String(r.id) === String(id) ? { ...r, estado: 'cancelada' } : r);
        this.setCachedReservations(cached);
      })
    );
  }
}