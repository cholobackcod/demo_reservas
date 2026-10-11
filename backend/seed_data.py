import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usuarios.models import Usuario
from salas.models import Sala
from reservas.models import Reserva
from django.utils import timezone
import datetime

def seed():
    print("Sembrando datos iniciales...")

    # Crear Usuarios
    u1, _ = Usuario.objects.get_or_create(
        id=1,
        defaults={
            'nombre': 'Admin',
            'apellido': 'Sistema',
            'email': 'admin@demo.com',
            'password': 'admin123',
            'rol': 'admin'
        }
    )
    u2, _ = Usuario.objects.get_or_create(
        id=2,
        defaults={
            'nombre': 'Federico',
            'apellido': 'Udovich',
            'email': 'fede@demo.com',
            'password': '1234',
            'rol': 'docente'
        }
    )
    u3, _ = Usuario.objects.get_or_create(
        id=3,
        defaults={
            'nombre': 'Giselda',
            'apellido': 'Mondadori',
            'email': 'giselda@demo.com',
            'password': '1234',
            'rol': 'docente'
        }
    )
    u4, _ = Usuario.objects.get_or_create(
        id=4,
        defaults={
            'nombre': 'Andres',
            'apellido': 'Bianchi',
            'email': 'andres@demo.com',
            'password': '1234',
            'rol': 'docente'
        }
    )

    # Crear Salas
    s1, _ = Sala.objects.get_or_create(
        id=1,
        defaults={
            'nombre': 'Laboratorio Informática A',
            'ciclo': 'Ciclo Básico',
            'descripcion': 'Laboratorio equipado con 35 PCs para prácticas de programación.',
            'capacidad': 35,
            'activa': True
        }
    )
    s2, _ = Sala.objects.get_or_create(
        id=2,
        defaults={
            'nombre': 'Laboratorio Redes y Hardware B',
            'ciclo': 'Ciclo Superior',
            'descripcion': 'Espacio equipado para ensamblado de redes y mantenimiento.',
            'capacidad': 25,
            'activa': True
        }
    )
    s3, _ = Sala.objects.get_or_create(
        id=3,
        defaults={
            'nombre': 'Laboratorio Desarrollo Software C',
            'ciclo': 'Ciclo Superior',
            'descripcion': 'Laboratorio avanzado para desarrollo web y sistemas distribuidos.',
            'capacidad': 30,
            'activa': True
        }
    )

    # Crear Reservas
    now = timezone.now()
    r1, _ = Reserva.objects.get_or_create(
        id=1,
        defaults={
            'usuario': u2,
            'sala': s1,
            'inicio': now + datetime.timedelta(days=1, hours=2),
            'fin': now + datetime.timedelta(days=1, hours=4),
            'estado': 'confirmada'
        }
    )
    r2, _ = Reserva.objects.get_or_create(
        id=2,
        defaults={
            'usuario': u3,
            'sala': s2,
            'inicio': now + datetime.timedelta(days=2, hours=3),
            'fin': now + datetime.timedelta(days=2, hours=5),
            'estado': 'confirmada'
        }
    )

    print("Datos iniciales cargados con éxito en la base de datos.")

if __name__ == '__main__':
    seed()
