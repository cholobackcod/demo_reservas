import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Reservation {
  id?: number | string;
  usuarioId: number | string;
  salaId: number | string;
  inicio: string;
  fin: string;
  estado: 'confirmada' | 'finalizada' | 'cancelada' | string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservation`;

  // Obtiene el historial completo de reservas
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  // Obtiene reservas de un usuario específico
  getReservationsByUser(usuarioId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  // Obtiene reservas de una sala específica
  getReservationsByLab(salaId: number | string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?salaId=${salaId}`);
  }

  createReservation(reservationData: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservationData);
  }

  updateReservation(id: number | string, reservationData: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, reservationData);
  }

  deleteReservation(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}