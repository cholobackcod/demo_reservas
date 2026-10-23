import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../services/auth';
import { DocentesService, DocenteCargaHoraria, DiaDesglose } from '../../../services/docentes';

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-horario.html',
  styleUrl: './mi-horario.css'
})
export class MiHorario implements OnInit {
  private authService = inject(AuthService);
  private docentesService = inject(DocentesService);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  horarioData: DocenteCargaHoraria | null = null;
  loading = true;
  fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' }
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarHorario();
  }

  cargarHorario(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.docentesService.getMiHorario(this.currentUser.id).subscribe({
      next: (data) => {
        this.horarioData = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar mi horario:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getDesgloseDia(diaKey: string): DiaDesglose | null {
    if (!this.horarioData || !this.horarioData.desgloseDias) return null;
    return (this.horarioData.desgloseDias as any)[diaKey] || null;
  }

  imprimirHorario(): void {
    window.print();
  }

  badgeClase(tipo?: string): string {
    switch (tipo) {
      case 'tutoria': return 'bg-info text-dark border border-info-subtle';
      case 'taller': return 'bg-warning text-dark border border-warning-subtle';
      case 'club': return 'bg-success text-white border border-success-subtle';
      default: return 'bg-primary text-white border border-primary-subtle';
    }
  }
}
