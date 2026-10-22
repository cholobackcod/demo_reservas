from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
from usuarios.models import Usuario
from salas.models import Sala
from .models import Reserva
from django.utils import timezone
import datetime

class ReservaAPITestCase(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create(
            nombre="Carlos",
            apellido="Lopez",
            email="carlos@test.com",
            password="1234",
            rol="docente"
        )
        self.sala = Sala.objects.create(
            nombre="Lab 101",
            ciclo="Ciclo Básico",
            capacidad=30,
            activa=True
        )
        base = timezone.localtime(timezone.now()).replace(hour=8, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)
        self.now = base
        self.reserva = Reserva.objects.create(
            usuario=self.user,
            sala=self.sala,
            inicio=self.now,
            fin=self.now + datetime.timedelta(hours=2),
            estado="confirmada"
        )

    def test_consulta_disponibilidad_laboratorio_pasos_2_a_7(self):
        """
        Paso 2 al 7 del Diagrama de Secuencia:
        GET /api/v1/reservas/?salaId={id}&estado=confirmada
        Debe devolver 200 OK con la lista de reservas confirmadas de dicha sala.
        """
        url = f'/api/v1/reservas/?salaId={self.sala.id}&estado=confirmada'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['salaId'], self.sala.id)
        self.assertEqual(data[0]['estado'], 'confirmada')

    def test_create_reserva_ids_inexistentes_pasos_13_a_17(self):
        """
        Pasos 13 al 17 del Diagrama de Secuencia:
        alt [usuarioId o salaId inexistente] -> 400 Bad Request
        """
        payload = {
            "usuarioId": self.user.id,
            "salaId": 999999,  # Sala inexistente
            "inicio": (self.now + datetime.timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(hours=6)).strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('salaId', response.json())

    def test_create_reserva_rango_horario_invalido_pasos_18_a_21(self):
        """
        Pasos 18 al 21 del Diagrama de Secuencia:
        alt [fin <= inicio] -> ValidationError (fin) -> 400 Bad Request
        """
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": (self.now + datetime.timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(hours=3)).strftime("%Y-%m-%dT%H:%M"),  # fin anterior a inicio
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('fin', response.json())

    def test_create_reserva_solapamiento_sala_ocupada_pasos_22_a_26(self):
        """
        Pasos 22 al 26 del Diagrama de Secuencia:
        alt [Existe solapamiento horario] -> ValidationError (sala ocupada) -> 400 Bad Request (sala ocupada)
        """
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": self.now.strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertTrue('sala_ocupada' in data or 'non_field_errors' in data)

    def test_create_reserva_exito_pasos_27_a_40(self):
        """
        Pasos 27 al 40 del Diagrama de Secuencia:
        [Sala disponible] -> is_valid() = True -> save() -> INSERT -> 201 Created
        """
        inicio_nuevo = self.now + datetime.timedelta(hours=4)
        fin_nuevo = self.now + datetime.timedelta(hours=6)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio_nuevo.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin_nuevo.strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['estado'], 'confirmada')

    def test_create_reserva_error_interno_servidor_500_pasos_33_a_35(self):
        """
        Pasos 33 al 35 del Diagrama de Secuencia:
        alt [Solapamiento tardío o error al guardar] -> Excepción no controlada -> 500 Internal Server Error
        """
        inicio_nuevo = self.now + datetime.timedelta(hours=7)
        fin_nuevo = self.now + datetime.timedelta(hours=9)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio_nuevo.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin_nuevo.strftime("%Y-%m-%dT%H:%M"),
        }
        with patch.object(Reserva, 'save', side_effect=RuntimeError("Solapamiento concurrente tardío en base de datos")):
            response = self.client.post('/api/v1/reservas/', payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertIn('detail', response.json())

    def test_create_reserva_fuera_horario_escolar(self):
        """
        Validación de horario escolar (07:00 a 18:00 hs):
        Reservas fuera de ese horario deben retornar 400 Bad Request.
        """
        # Antes de las 07:00 hs
        inicio_temprano = self.now.replace(hour=6, minute=0)
        fin_temprano = self.now.replace(hour=7, minute=30)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio_temprano.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin_temprano.strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No es posible realizar reservas fuera del horario escolar", str(response.json()))

        # Después de las 18:00 hs
        inicio_tarde = self.now.replace(hour=17, minute=0)
        fin_tarde = self.now.replace(hour=19, minute=0)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio_tarde.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin_tarde.strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No es posible realizar reservas fuera del horario escolar", str(response.json()))

    def test_create_reserva_dias_distintos(self):
        """
        La reserva debe iniciar y finalizar en el mismo día.
        """
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": self.now.replace(hour=10).strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(days=1)).replace(hour=11).strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mismo día", str(response.json()))

    def test_cancelar_reserva_no_elimina_y_libera_horario(self):
        """
        Al cancelar una reserva:
        1. No se elimina de la base de datos (se mantiene con estado 'cancelada').
        2. El horario queda liberado para una nueva reserva en esa misma sala y franja.
        """
        # Cancelar la reserva creada en setUp
        response = self.client.delete(f'/api/v1/reservas/{self.reserva.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que sigue existiendo en BD con estado 'cancelada'
        self.reserva.refresh_from_db()
        self.assertEqual(self.reserva.estado, 'cancelada')
        self.assertTrue(Reserva.objects.filter(pk=self.reserva.pk).exists())

        # Intentar reservar exactamente el mismo horario liberado
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": self.now.strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M"),
        }
        nueva_response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(nueva_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(nueva_response.json()['estado'], 'confirmada')

    def test_create_reserva_fecha_u_hora_pasada(self):
        """
        No debe permitir cargar reservas en fechas u horas que ya hayan pasado.
        """
        pasado = timezone.localtime(timezone.now()) - datetime.timedelta(hours=2)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": pasado.strftime("%Y-%m-%dT%H:%M"),
            "fin": (pasado + datetime.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M"),
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("ya ha transcurrido", str(response.json()))

    def test_create_reserva_hu03_campos_curso_materia_netbooks(self):
        """
        HU03: Alta de reservas con campos curso, materia y netbooks.
        """
        inicio = self.now + datetime.timedelta(hours=4)
        fin = self.now + datetime.timedelta(hours=6)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin.strftime("%Y-%m-%dT%H:%M"),
            "curso": "4° Año Informática",
            "materia": "Programación",
            "netbooks": 25
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['curso'], "4° Año Informática")
        self.assertEqual(data['materia'], "Programación")
        self.assertEqual(data['netbooks'], 25)

    def test_create_reserva_hu05_tope_semanal_por_materia(self):
        """
        HU05: Validación automática de topes semanales de reserva por materia (máximo 3 por semana).
        """
        # Calcular los días martes, miércoles y jueves de la misma semana
        lunes = self.now.date() - datetime.timedelta(days=self.now.date().weekday())
        
        # Crear 3 reservas confirmadas para la materia 'Programación' en esa misma semana
        # Usamos horas diferentes o días diferentes para no colisionar horarios
        dia1 = timezone.make_aware(datetime.datetime.combine(lunes, datetime.time(8, 0)))
        if dia1 <= timezone.now():
            # Si lunes ya pasó, usamos la siguiente semana completa para la prueba
            lunes = lunes + datetime.timedelta(days=7)
            dia1 = timezone.make_aware(datetime.datetime.combine(lunes, datetime.time(8, 0)))

        dia2 = timezone.make_aware(datetime.datetime.combine(lunes + datetime.timedelta(days=1), datetime.time(8, 0)))
        dia3 = timezone.make_aware(datetime.datetime.combine(lunes + datetime.timedelta(days=2), datetime.time(8, 0)))
        dia4 = timezone.make_aware(datetime.datetime.combine(lunes + datetime.timedelta(days=3), datetime.time(8, 0)))

        # Reserva 1
        Reserva.objects.create(
            usuario=self.user,
            sala=self.sala,
            inicio=dia1,
            fin=dia1 + datetime.timedelta(hours=2),
            materia="Programación",
            curso="4° Año Informática",
            estado="confirmada"
        )
        # Reserva 2
        Reserva.objects.create(
            usuario=self.user,
            sala=self.sala,
            inicio=dia2,
            fin=dia2 + datetime.timedelta(hours=2),
            materia="Programación",
            curso="4° Año Informática",
            estado="confirmada"
        )
        # Reserva 3
        Reserva.objects.create(
            usuario=self.user,
            sala=self.sala,
            inicio=dia3,
            fin=dia3 + datetime.timedelta(hours=2),
            materia="Programación",
            curso="4° Año Informática",
            estado="confirmada"
        )

        # Intentar crear una 4ta reserva en la misma semana para 'Programación' -> Debe fallar con 400
        payload4 = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": dia4.strftime("%Y-%m-%dT%H:%M"),
            "fin": (dia4 + datetime.timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M"),
            "materia": "Programación",
            "curso": "4° Año Informática",
            "netbooks": 10
        }
        res4 = self.client.post('/api/v1/reservas/', payload4, format='json')
        self.assertEqual(res4.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tope semanal", str(res4.json()))

        # En cambio, para OTRA materia ('Bases de Datos') sí debe permitirlo
        payload_otra = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": dia4.strftime("%Y-%m-%dT%H:%M"),
            "fin": (dia4 + datetime.timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M"),
            "materia": "Bases de Datos",
            "curso": "4° Año Informática",
            "netbooks": 10
        }
        res_otra = self.client.post('/api/v1/reservas/', payload_otra, format='json')
        self.assertEqual(res_otra.status_code, status.HTTP_201_CREATED)


