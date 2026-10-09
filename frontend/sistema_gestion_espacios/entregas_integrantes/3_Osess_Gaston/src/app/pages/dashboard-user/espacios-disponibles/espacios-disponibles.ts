import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { LabsService, Lab } from '../../../services/labs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-espacios-disponibles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './espacios-disponibles.html',
  styleUrl: './espacios-disponibles.css',
})
export class EspaciosDisponibles implements OnInit {
  private labsService = inject(LabsService);
  private cdr = inject(ChangeDetectorRef);

  espacios: Lab[] = [];
  loading = true;

  ngOnInit(): void {
    this.labsService.getLabs().subscribe({
      next: (labs) => {
        this.espacios = labs;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar laboratorios:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
