import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface User {
  id?: number | string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol: 'admin' | 'docente';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  // --- Utilidades de sesión ---
  
  setCurrentUser(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}