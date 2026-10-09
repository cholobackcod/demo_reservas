import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

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
  private apiUrl = `${environment.apiUrl}/labs`;

  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl);
  }

  getLabById(id: number | string): Observable<Lab> {
    return this.http.get<Lab>(`${this.apiUrl}/${id}`);
  }

  createLab(labData: Lab): Observable<Lab> {
    return this.http.post<Lab>(this.apiUrl, labData);
  }

  updateLab(id: number | string, labData: Lab): Observable<Lab> {
    return this.http.put<Lab>(`${this.apiUrl}/${id}`, labData);
  }

  deleteLab(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}