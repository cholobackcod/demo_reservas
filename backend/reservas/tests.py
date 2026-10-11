from rest_framework.test import APITestCase
from rest_framework import status
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
        base = timezone.localtime(timezone.now()).replace(minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)
        self.now = base
        self.reserva = Reserva.objects.create(
            usuario=self.user,
            sala=self.sala,
            inicio=self.now,
            fin=self.now + datetime.timedelta(hours=2),
            estado="confirmada"
        )

    def test_list_reservas(self):
        response = self.client.get('/api/v1/reservas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_reserva_overlap_error(self):
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": self.now.strftime("%Y-%m-%dT%H:%M"),
            "fin": (self.now + datetime.timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M"),
            "estado": "confirmada"
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_reserva_success(self):
        inicio_nuevo = self.now + datetime.timedelta(hours=4)
        fin_nuevo = self.now + datetime.timedelta(hours=6)
        payload = {
            "usuarioId": self.user.id,
            "salaId": self.sala.id,
            "inicio": inicio_nuevo.strftime("%Y-%m-%dT%H:%M"),
            "fin": fin_nuevo.strftime("%Y-%m-%dT%H:%M"),
            "estado": "confirmada"
        }
        response = self.client.post('/api/v1/reservas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
