import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usuarios.models import Usuario
from salas.models import Sala
from reservas.models import Reserva
from docentes.models import Materia, Curso, ConfiguracionInstitucional, AsignacionDocente
from django.utils import timezone
import datetime

def seed():
    print("Sembrando datos iniciales del sistema Escuela ProA Sede Capital Norte...")

    # 1. Configuración Institucional
    config = ConfiguracionInstitucional.get_config()
    config.duracion_modulo_minutos = 40
    config.ciclo_lectivo_actual = '2026'
    config.nombre_institucion = 'Escuela Experimental con énfasis en T.I.C. Sede Capital Norte'
    config.save()
    print("[OK] Configuración institucional establecida (Módulo: 40 min, Ciclo: 2026).")

    # 2. Catálogo de Cursos
    cursos_data = [
        (1, 'Única', '1° Año'),
        (2, 'Única', '2° Año'),
        (3, 'Única', '3° Año'),
        (4, 'Informática', '4° Año Informática'),
        (5, 'Informática', '5° Año Informática'),
        (6, 'Informática', '6° Año Informática'),
    ]
    cursos_dict = {}
    for anio, div, nombre in cursos_data:
        c, _ = Curso.objects.get_or_create(nombre=nombre, defaults={'anio': anio, 'division': div})
        cursos_dict[nombre] = c
    print(f"[OK] {len(cursos_dict)} cursos registrados.")

    # 3. Catálogo de Materias / Espacios Curriculares
    materias_data = [
        ('Programación II', 'materia'),
        ('Diseño de Interfaces y Usabilidad I', 'materia'),
        ('Diseño de Interfaces y Usabilidad', 'materia'),
        ('Programación', 'materia'),
        ('Ética y Legislación', 'materia'),
        ('Estructura y Almacenam. de Datos', 'materia'),
        ('Algoritmos y Programación', 'materia'),
        ('Entornos Digitales', 'materia'),
        ('Sistemas Op. y Software de Aplicación', 'materia'),
        ('Taller de Inglés Aplicado', 'taller'),
        ('Robótica', 'materia'),
        ('Testing', 'materia'),
        ('Desarrollo de Aplicaciones Móviles', 'materia'),
        ('Matemática', 'materia'),
        ('Tutoría Matemática', 'tutoria'),
        ('Lengua y Literatura', 'materia'),
        ('Tutoría Lengua y Literatura', 'tutoria'),
        ('Ciencias Naturales Física', 'materia'),
        ('Física', 'materia'),
        ('Tutoría de Física', 'tutoria'),
        ('Ciencias Naturales Biología', 'materia'),
        ('Biología', 'materia'),
        ('Tutoría Biología', 'tutoria'),
        ('Ciencias Naturales Química', 'materia'),
        ('Química', 'materia'),
        ('Tutoría Química', 'tutoria'),
        ('Ciencias Sociales Historia', 'materia'),
        ('Historia', 'materia'),
        ('Tutoría Historia', 'tutoria'),
        ('Ciencias Sociales Geografía', 'materia'),
        ('Geografía', 'materia'),
        ('Tutoría de Geografía', 'tutoria'),
        ('Ciudadanía y Participación', 'materia'),
        ('Ciudadanía y Política', 'materia'),
        ('Inglés', 'materia'),
        ('Tutoría Inglés', 'tutoria'),
        ('Educación Física', 'materia'),
        ('Educación Tecnológica', 'materia'),
        ('Artes Visuales', 'materia'),
        ('Educación Artística: Plástica', 'materia'),
        ('Educación Artística: Música', 'materia'),
        ('Educación Artística Teatro', 'materia'),
        ('Formación para la Vida y el Trabajo', 'materia'),
        ('Club de Ciencias', 'club'),
        ('Club de Arte', 'club'),
        ('Club de Deportes', 'club'),
        ('Filosofía', 'materia'),
        ('Psicología', 'materia'),
    ]
    materias_dict = {}
    for nombre, tipo in materias_data:
        m, _ = Materia.objects.get_or_create(nombre=nombre, defaults={'tipo_predeterminado': tipo})
        materias_dict[nombre] = m
    print(f"[OK] {len(materias_dict)} materias registradas en el catálogo.")

    # 4. Usuarios (Admin y Docentes reales del cuerpo docente de ProA)
    usuarios_data = [
        (1, 'Admin', 'Sistema', 'admin@demo.com', 'admin123', 'admin'),
        (2, 'Andrés', 'Bianchi', 'andres@demo.com', '1234', 'docente'),
        (3, 'Cristian Ariel', 'Conci', 'cristian.conci@demo.com', '1234', 'docente'),
        (4, 'Virginia', 'Riquel', 'virginia.riquel@demo.com', '1234', 'docente'),
        (5, 'Santiago', 'Ferreyra Lazcano', 'santiago.ferreyra@demo.com', '1234', 'docente'),
        (6, 'Sofía', 'Fernandez Cebollada', 'sofia.fernandez@demo.com', '1234', 'docente'),
        (7, 'Delfina', 'Vernet', 'delfina.vernet@demo.com', '1234', 'docente'),
        (8, 'Facundo', 'Mingorance', 'facundo.mingorance@demo.com', '1234', 'docente'),
        (9, 'Evangelina', 'Espeche', 'evangelina.espeche@demo.com', '1234', 'docente'),
        (10, 'Federico', 'Udovich', 'fede@demo.com', '1234', 'docente'),
        (11, 'Giselda', 'Mondadori', 'giselda@demo.com', '1234', 'docente'),
    ]
    usuarios_dict = {}
    for uid, nom, ape, email, pwd, rol in usuarios_data:
        u, _ = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'nombre': nom,
                'apellido': ape,
                'password': pwd,
                'rol': rol,
                'activo': True
            }
        )
        usuarios_dict[email] = u
    print(f"[OK] {len(usuarios_dict)} usuarios registrados.")

    # 5. Salas de Laboratorio
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
    print("[OK] Salas de laboratorio registradas.")

    # 6. Asignaciones Docentes y Horarios Reales (extraídos de la Planilla Oficial ProA Sede Capital Norte)
    docente_bianchi = usuarios_dict['andres@demo.com']
    docente_conci = usuarios_dict['cristian.conci@demo.com']
    docente_riquel = usuarios_dict['virginia.riquel@demo.com']
    docente_santiago = usuarios_dict['santiago.ferreyra@demo.com']

    asignaciones_raw = [
        # --- Andrés Bianchi (Especialidad Software / Web) ---
        # Lunes: 10:20 a 12:00 (100 min) - Programación II (4° Año Informática)
        (docente_bianchi, 'Programación II', '4° Año Informática', 'lunes', '10:20', '12:00', 'materia'),
        # Lunes: 12:10 a 12:50 (40 min) - Diseño de Interfaces y Usabilidad I (4° Año Informática)
        (docente_bianchi, 'Diseño de Interfaces y Usabilidad I', '4° Año Informática', 'lunes', '12:10', '12:50', 'materia'),
        # Martes: 12:45 a 13:45 (60 min) - Programación (4° Año Informática)
        (docente_bianchi, 'Programación', '4° Año Informática', 'martes', '12:45', '13:45', 'materia'),
        # Miércoles: 09:30 a 10:10 (40 min) - Ética y Legislación (5° Año Informática)
        (docente_bianchi, 'Ética y Legislación', '5° Año Informática', 'miercoles', '09:30', '10:10', 'materia'),
        # Jueves: 11:30 a 12:50 (80 min) - Diseño de Interfaces y Usabilidad (4° Año Informática)
        (docente_bianchi, 'Diseño de Interfaces y Usabilidad', '4° Año Informática', 'jueves', '11:30', '12:50', 'materia'),
        # Viernes: 12:40 a 13:40 (60 min) - Estructura y Almacenam. de Datos (4° Año Informática)
        (docente_bianchi, 'Estructura y Almacenam. de Datos', '4° Año Informática', 'viernes', '12:40', '13:40', 'materia'),
        # Viernes: 13:50 a 14:50 (60 min) - Estructura y Almacenam. de Datos (4° Año Informática)
        (docente_bianchi, 'Estructura y Almacenam. de Datos', '4° Año Informática', 'viernes', '13:50', '14:50', 'materia'),

        # --- Cristian Ariel Conci (Entornos Digitales, Algoritmos, Estructuras) ---
        (docente_conci, 'Entornos Digitales', '1° Año', 'lunes', '09:40', '11:00', 'materia'), # 80 min
        (docente_conci, 'Algoritmos y Programación', '2° Año', 'lunes', '11:00', '12:20', 'materia'), # 80 min
        (docente_conci, 'Estructura y Almacenam. de Datos', '2° Año', 'lunes', '12:40', '14:00', 'materia'), # 80 min
        (docente_conci, 'Sistemas Op. y Software de Aplicación', '1° Año', 'martes', '10:40', '12:00', 'materia'), # 80 min
        (docente_conci, 'Club de Ciencias', '3° Año', 'miercoles', '10:30', '11:50', 'club'), # 80 min

        # --- Virginia Riquel (Matemática) ---
        (docente_riquel, 'Matemática', '3° Año', 'lunes', '10:10', '11:50', 'materia'), # 100 min
        (docente_riquel, 'Matemática', '5° Año Informática', 'lunes', '08:50', '10:10', 'materia'), # 80 min
        (docente_riquel, 'Matemática', '3° Año', 'martes', '08:40', '10:20', 'materia'), # 100 min
        (docente_riquel, 'Matemática', '6° Año Informática', 'martes', '10:40', '12:00', 'materia'), # 80 min

        # --- Santiago Ferreyra Lazcano (Programación, Robótica, Testing) ---
        (docente_santiago, 'Programación', '6° Año Informática', 'lunes', '08:50', '10:10', 'materia'), # 80 min
        (docente_santiago, 'Robótica', '5° Año Informática', 'miercoles', '11:50', '12:50', 'materia'), # 60 min
        (docente_santiago, 'Testing', '6° Año Informática', 'miercoles', '10:20', '11:40', 'materia'), # 80 min
    ]

    for doc, mat_nom, cur_nom, dia, hi, hf, tipo in asignaciones_raw:
        materia_obj = materias_dict[mat_nom]
        curso_obj = cursos_dict[cur_nom]
        t_hi = datetime.datetime.strptime(hi, '%H:%M').time()
        t_hf = datetime.datetime.strptime(hf, '%H:%M').time()

        AsignacionDocente.objects.get_or_create(
            docente=doc,
            materia=materia_obj,
            curso=curso_obj,
            dia_semana=dia,
            hora_inicio=t_hi,
            hora_fin=t_hf,
            ciclo_lectivo='2026',
            defaults={
                'tipo_actividad': tipo,
                'observaciones': 'Horario asignado oficial ProA Capital Norte'
            }
        )
    print(f"[OK] {len(asignaciones_raw)} bloques horarios asignados a docentes.")

    # 7. Reservas iniciales coherentes con las asignaciones docentes
    manana = (timezone.now() + datetime.timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    pasado = (timezone.now() + datetime.timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)

    r1, _ = Reserva.objects.get_or_create(
        id=1,
        defaults={
            'usuario': docente_bianchi,
            'sala': s1,
            'inicio': manana,
            'fin': manana + datetime.timedelta(hours=2),
            'curso': '4° Año Informática',
            'materia': 'Programación II',
            'netbooks': 25,
            'estado': 'confirmada'
        }
    )
    r2, _ = Reserva.objects.get_or_create(
        id=2,
        defaults={
            'usuario': docente_conci,
            'sala': s2,
            'inicio': pasado,
            'fin': pasado + datetime.timedelta(hours=2),
            'curso': '2° Año',
            'materia': 'Algoritmos y Programación',
            'netbooks': 20,
            'estado': 'confirmada'
        }
    )
    print("[OK] Reservas iniciales cargadas y sincronizadas con asignaciones.")
    print("¡Proceso de sembrado (seed_data) completado exitosamente!")

if __name__ == '__main__':
    seed()
