import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users';
import { User } from '../../../services/auth';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  loading = true;
  showForm = false;
  editingUserId: number | string | null = null;

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rol: ['docente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }


  abrirCrear(): void {
    this.editingUserId = null;
    this.userForm.reset({ rol: 'docente' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  abrirEditar(user: User): void {
    if (!user.id) return;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      password: user.password || ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showForm = true;
  }

  cancelarForm(): void {
    this.showForm = false;
    this.editingUserId = null;
    this.userForm.reset();
  }

  guardarUsuario(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const val = this.userForm.value;
    const userData: User = {
      nombre: val.nombre,
      apellido: val.apellido,
      email: val.email,
      rol: val.rol
    };
    if (val.password) {
      userData.password = val.password;
    }

    if (this.editingUserId) {
      this.usersService.updateUser(this.editingUserId, userData).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente.');
          this.cancelarForm();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          alert('No se pudo actualizar el usuario.');
        }
      });
    } else {
      let nextId = 1;
      if (this.users && this.users.length > 0) {
        const numericIds = this.users.map(u => Number(u.id)).filter(id => !isNaN(id));
        if (numericIds.length > 0) {
          nextId = Math.max(...numericIds) + 1;
        }
      }
      userData.id = nextId;

      this.usersService.createUser(userData).subscribe({
        next: () => {
          alert('Usuario creado correctamente.');
          this.cancelarForm();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          alert('No se pudo crear el usuario.');
        }
      });
    }
  }

  eliminarUsuario(id?: number | string): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          alert('Usuario eliminado correctamente.');
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('No se pudo eliminar el usuario.');
        }
      });
    }
  }
}