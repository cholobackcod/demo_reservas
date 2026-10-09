import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LabsService, Lab } from '../../../services/labs';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salas.html',
  styleUrl: './salas.css',
})
export class Salas implements OnInit {
  private labsService = inject(LabsService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  labs: Lab[] = [];
  loading = true;
  showForm = false;
  editingLabId: number | string | null = null;

  labForm: FormGroup;

  constructor() {
    this.labForm = this.fb.group({
      nombre: ['', Validators.required],
      ciclo: ['', Validators.required],
      descripcion: [''],
      capacidad: [30, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarSalas();
  }

  cargarSalas(): void {
    this.loading = true;
    this.labsService.getLabs().subscribe({
      next: (data) => {
        this.labs = data;
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


  abrirCrear(): void {
    this.editingLabId = null;
    this.labForm.reset({ capacidad: 30, ciclo: 'Ciclo Básico' });
    this.showForm = true;
  }

  abrirEditar(lab: Lab): void {
    if (!lab.id) return;
    this.editingLabId = lab.id;
    this.labForm.patchValue({
      nombre: lab.nombre,
      ciclo: lab.ciclo || '',
      descripcion: lab.descripcion || '',
      capacidad: lab.capacidad
    });
    this.showForm = true;
  }

  cancelarForm(): void {
    this.showForm = false;
    this.editingLabId = null;
    this.labForm.reset();
  }

  guardarLaboratorio(): void {
    if (this.labForm.invalid) {
      this.labForm.markAllAsTouched();
      return;
    }

    const labData: Lab = {
      ...this.labForm.value,
      activa: true
    };

    if (this.editingLabId) {
      this.labsService.updateLab(this.editingLabId, labData).subscribe({
        next: () => {
          alert('Laboratorio actualizado correctamente.');
          this.cancelarForm();
          this.cargarSalas();
        },
        error: (err) => {
          console.error('Error al actualizar laboratorio:', err);
          alert('No se pudo actualizar el laboratorio.');
        }
      });
    } else {
      let nextId = 1;
      if (this.labs && this.labs.length > 0) {
        const numericIds = this.labs.map(l => Number(l.id)).filter(id => !isNaN(id));
        if (numericIds.length > 0) {
          nextId = Math.max(...numericIds) + 1;
        }
      }
      labData.id = nextId;

      this.labsService.createLab(labData).subscribe({
        next: () => {
          alert('Laboratorio creado correctamente.');
          this.cancelarForm();
          this.cargarSalas();
        },
        error: (err) => {
          console.error('Error al crear laboratorio:', err);
          alert('No se pudo crear el laboratorio.');
        }
      });
    }
  }

  eliminarLaboratorio(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Desea eliminar este laboratorio?')) {
      this.labsService.deleteLab(id).subscribe({
        next: () => {
          alert('Laboratorio eliminado correctamente.');
          this.cargarSalas();
        },
        error: (err) => {
          console.error('Error al eliminar laboratorio:', err);
          alert('No se pudo eliminar el laboratorio.');
        }
      });
    }
  }
}