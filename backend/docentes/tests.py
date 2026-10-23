import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone

from usuarios.models import Usuario
from salas.models import Sala
from reservas.models import Reserva
from docentes.models import Materia, Curso, ConfiguracionInstitucional, AsignacionDocente

class DocentesGestionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Configuración institucional (Módulo de 40 min reloj)
        self.config = ConfiguracionInstitucional.objects.create(
            id=1,
            duracion_modulo_minutos=40,
            ciclo_lectivo_actual='2026'
        )

        # Admin
        self.admin = Usuario.objects.create(
            nombre='Admin',
            apellido='General',
            email='admin@proa.edu.ar',
            password='admin',
            rol='admin'
        )

        # Docente
        self.docente = Usuario.objects.create(
            nombre='Andres',
            apellido='Bianchi',
            email='andres.bianchi@proa.edu.ar',
            password='password123',
            rol='docente'
        )

        # Materias
        self.materia_prog2 = Materia.objects.create(nombre='Programación II', tipo_predeterminado='materia')
        self.materia_diseno = Materia.objects.create(nombre='Diseño de Interfaces y Usabilidad I', tipo_predeterminado='materia')
        self.materia_redes = Materia.objects.create(nombre='Redes y Telecomunicaciones', tipo_predeterminado='materia')

        # Cursos
        self.curso_4to = Curso.objects.create(anio=4, division='Informática', nombre='4° Año Informática')
        self.curso_5to = Curso.objects.create(anio=5, division='Informática', nombre='5° Año Informática')

        # Sala de laboratorio
        self.sala = Sala.objects.create(nombre='Laboratorio A', capacidad=30, activa=True)

    def test_01_crear_docente_con_password_autogenerada_o_manual(self):
        """Caso 1: El administrador crea un docente nuevo."""
        payload = {
            'nombre': 'Cristian',
            'apellido': 'Conci',
            'email': 'cristian.conci@proa.edu.ar',
            'password': '', # Debería autogenerar contraseña segura
        }
        res = self.client.post('/api/v1/docentes/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('passwordGenerada', res.data)
        self.assertIsNotNone(res.data['passwordGenerada'])
        self.assertTrue(Usuario.objects.filter(email='cristian.conci@proa.edu.ar', rol='docente').exists())

    def test_02_asignar_varias_materias_y_cursos_y_calcular_carga_horaria(self):
        """Casos 2, 3 y 4: Asigna materias y horarios y calcula automáticamente la carga horaria."""
        # Asignación 1: Lunes 10:20 a 12:00 (100 minutos reloj)
        res1 = self.client.post('/api/v1/asignaciones/', {
            'docenteId': self.docente.id,
            'materiaId': self.materia_prog2.id,
            'cursoId': self.curso_4to.id,
            'dia_semana': 'lunes',
            'hora_inicio': '10:20',
            'hora_fin': '12:00',
            'tipo_actividad': 'materia',
            'ciclo_lectivo': '2026'
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['duracionMinutos'], 100)

        # Asignación 2: Lunes 12:10 a 12:50 (40 minutos reloj)
        res2 = self.client.post('/api/v1/asignaciones/', {
            'docenteId': self.docente.id,
            'materiaId': self.materia_diseno.id,
            'cursoId': self.curso_4to.id,
            'dia_semana': 'lunes',
            'hora_inicio': '12:10',
            'hora_fin': '12:50',
            'tipo_actividad': 'materia',
            'ciclo_lectivo': '2026'
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['duracionMinutos'], 40)

        # Asignación 3: Jueves 11:30 a 12:50 (80 minutos reloj)
        res3 = self.client.post('/api/v1/asignaciones/', {
            'docenteId': self.docente.id,
            'materiaId': self.materia_diseno.id,
            'cursoId': self.curso_4to.id,
            'dia_semana': 'jueves',
            'hora_inicio': '11:30',
            'hora_fin': '12:50',
            'tipo_actividad': 'materia',
            'ciclo_lectivo': '2026'
        }, format='json')
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res3.data['duracionMinutos'], 80)

        # Total esperado: 100 + 40 + 80 = 220 minutos = 3 horas y 40 minutos reloj.
        # Módulos: 220 / 40 = 5.5 módulos pedagógicos de 40 min.
        res_docente = self.client.get(f'/api/v1/docentes/{self.docente.id}/')
        self.assertEqual(res_docente.status_code, status.HTTP_200_OK)
        self.assertEqual(res_docente.data['totalMinutosSemanal'], 220)
        self.assertEqual(res_docente.data['totalHorasRelojFormato'], '3h 40m')
        self.assertEqual(res_docente.data['totalModulos'], 5.5)

        # Desglose diario
        desglose = res_docente.data['desgloseDias']
        self.assertEqual(desglose['lunes']['minutos'], 140) # 100 + 40
        self.assertEqual(desglose['lunes']['horasFormato'], '2h 20m')
        self.assertEqual(desglose['jueves']['minutos'], 80)
        self.assertEqual(desglose['viernes']['minutos'], 0)

    def test_05_modificar_y_eliminar_asignacion_actualiza_total(self):
        """Caso 5: Al modificar o eliminar una asignación se actualiza el total semanal."""
        asig = AsignacionDocente.objects.create(
            docente=self.docente,
            materia=self.materia_prog2,
            curso=self.curso_4to,
            dia_semana='martes',
            hora_inicio=datetime.time(10, 0),
            hora_fin=datetime.time(11, 0), # 60 min
            ciclo_lectivo='2026'
        )

        # Verificar 60 min
        res1 = self.client.get(f'/api/v1/docentes/{self.docente.id}/')
        self.assertEqual(res1.data['totalMinutosSemanal'], 60)

        # Modificar a 10:00 a 11:30 (90 min)
        res_patch = self.client.patch(f'/api/v1/asignaciones/{asig.id}/', {
            'hora_fin': '11:30'
        }, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)

        # Total ahora 90 min = 1h 30m
        res2 = self.client.get(f'/api/v1/docentes/{self.docente.id}/')
        self.assertEqual(res2.data['totalMinutosSemanal'], 90)
        self.assertEqual(res2.data['totalHorasRelojFormato'], '1h 30m')

        # Eliminar asignación
        res_del = self.client.delete(f'/api/v1/asignaciones/{asig.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

        # Total ahora 0 min
        res3 = self.client.get(f'/api/v1/docentes/{self.docente.id}/')
        self.assertEqual(res3.data['totalMinutosSemanal'], 0)

    def test_06_deteccion_de_superposicion_docente_y_curso(self):
        """Caso 6: El sistema advierte y rechaza superposiciones horarias."""
        AsignacionDocente.objects.create(
            docente=self.docente,
            materia=self.materia_prog2,
            curso=self.curso_4to,
            dia_semana='lunes',
            hora_inicio=datetime.time(10, 20),
            hora_fin=datetime.time(12, 0),
            ciclo_lectivo='2026'
        )

        # Intento de solapar el mismo docente (ej. 11:00 a 12:30 el lunes)
        res_conflict_docente = self.client.post('/api/v1/asignaciones/', {
            'docenteId': self.docente.id,
            'materiaId': self.materia_diseno.id,
            'cursoId': self.curso_5to.id,
            'dia_semana': 'lunes',
            'hora_inicio': '11:00',
            'hora_fin': '12:30',
            'ciclo_lectivo': '2026'
        }, format='json')
        self.assertEqual(res_conflict_docente.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Superposición horaria', str(res_conflict_docente.data))

        # Intento de solapar el mismo curso con otro docente (ej. 4° Año a las 10:30 con otro docente)
        otro_docente = Usuario.objects.create(
            nombre='Mariana',
            apellido='Archimio',
            email='mariana@proa.edu.ar',
            password='pass',
            rol='docente'
        )
        res_conflict_curso = self.client.post('/api/v1/asignaciones/', {
            'docenteId': otro_docente.id,
            'materiaId': self.materia_redes.id,
            'cursoId': self.curso_4to.id,
            'dia_semana': 'lunes',
            'hora_inicio': '10:30',
            'hora_fin': '11:30',
            'ciclo_lectivo': '2026'
        }, format='json')
        self.assertEqual(res_conflict_curso.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Conflicto de curso', str(res_conflict_curso.data))

    def test_07_docente_consulta_mi_horario(self):
        """Caso 7: El docente consulta su horario personal."""
        AsignacionDocente.objects.create(
            docente=self.docente,
            materia=self.materia_prog2,
            curso=self.curso_4to,
            dia_semana='miercoles',
            hora_inicio=datetime.time(9, 30),
            hora_fin=datetime.time(10, 10),
            ciclo_lectivo='2026'
        )
        res = self.client.get(f'/api/v1/docentes/mi-horario/?docente_id={self.docente.id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['totalMinutosSemanal'], 40)
        self.assertEqual(res.data['nombre'], 'Andres')
        self.assertIn('Programación II', res.data['materiasAsignadas'])

    def test_08_docente_solo_reserva_materias_y_cursos_autorizados(self):
        """Caso 8: Docente sólo puede reservar con materias y cursos que tiene asignados."""
        # Andrés Bianchi sólo tiene asignada 'Programación II' en 4° Año
        AsignacionDocente.objects.create(
            docente=self.docente,
            materia=self.materia_prog2,
            curso=self.curso_4to,
            dia_semana='jueves',
            hora_inicio=datetime.time(8, 0),
            hora_fin=datetime.time(9, 0),
            ciclo_lectivo='2026'
        )

        now = timezone.now() + datetime.timedelta(days=1)
        inicio = now.replace(hour=10, minute=0, second=0, microsecond=0)
        fin = now.replace(hour=11, minute=0, second=0, microsecond=0)

        # 1. Intento de reservar una materia NO asignada ('Redes y Telecomunicaciones')
        res_no_autorizado = self.client.post('/api/v1/reservas/', {
            'usuarioId': self.docente.id,
            'salaId': self.sala.id,
            'inicio': inicio.strftime('%Y-%m-%dT%H:%M'),
            'fin': fin.strftime('%Y-%m-%dT%H:%M'),
            'materia': 'Redes y Telecomunicaciones',
            'curso': '4° Año Informática',
            'netbooks': 10
        }, format='json')
        self.assertEqual(res_no_autorizado.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no tiene asignada la materia', str(res_no_autorizado.data))

        # 2. Intento de reservar curso incorrecto para su materia
        res_curso_invalido = self.client.post('/api/v1/reservas/', {
            'usuarioId': self.docente.id,
            'salaId': self.sala.id,
            'inicio': inicio.strftime('%Y-%m-%dT%H:%M'),
            'fin': fin.strftime('%Y-%m-%dT%H:%M'),
            'materia': 'Programación II',
            'curso': '6° Año Informática', # no asignado
            'netbooks': 10
        }, format='json')
        self.assertEqual(res_curso_invalido.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no tiene asignado el curso', str(res_curso_invalido.data))

        # 3. Reserva con materia y curso correctos y autorizados -> Debe crearse con 201 Created
        res_ok = self.client.post('/api/v1/reservas/', {
            'usuarioId': self.docente.id,
            'salaId': self.sala.id,
            'inicio': inicio.strftime('%Y-%m-%dT%H:%M'),
            'fin': fin.strftime('%Y-%m-%dT%H:%M'),
            'materia': 'Programación II',
            'curso': '4° Año Informática',
            'netbooks': 20
        }, format='json')
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)

    def test_09_baja_logica_y_restablecer_password(self):
        """Caso 9: Desactivar cuenta docente (baja lógica) y restablecer contraseña."""
        # Desactivar
        res_del = self.client.delete(f'/api/v1/docentes/{self.docente.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)
        self.docente.refresh_from_db()
        self.assertFalse(self.docente.activo)

        # Restablecer contraseña
        res_pass = self.client.post(f'/api/v1/docentes/{self.docente.id}/reset-password/', {
            'password': 'NuevaPassword2026!'
        }, format='json')
        self.assertEqual(res_pass.status_code, status.HTTP_200_OK)
        self.docente.refresh_from_db()
        self.assertEqual(self.docente.password, 'NuevaPassword2026!')

    def test_10_endpoint_materias_docente_para_formulario_reserva(self):
        """Caso 10: Endpoint para filtrar dropdowns del formulario de reservas en frontend."""
        AsignacionDocente.objects.create(
            docente=self.docente,
            materia=self.materia_prog2,
            curso=self.curso_4to,
            dia_semana='lunes',
            hora_inicio=datetime.time(10, 0),
            hora_fin=datetime.time(11, 0),
            ciclo_lectivo='2026'
        )
        res = self.client.get(f'/api/v1/docentes/{self.docente.id}/materias/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['tieneAsignaciones'])
        self.assertEqual(len(res.data['materias']), 1)
        self.assertEqual(res.data['materias'][0]['nombre'], 'Programación II')
