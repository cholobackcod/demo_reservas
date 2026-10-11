from rest_framework.test import APITestCase
from rest_framework import status
from .models import Sala

class SalaAPITestCase(APITestCase):
    def setUp(self):
        self.sala = Sala.objects.create(
            nombre="Laboratorio Alfa",
            ciclo="Ciclo Básico",
            descripcion="Laboratorio de prueba",
            capacidad=20,
            activa=True
        )

    def test_list_salas(self):
        response = self.client.get('/api/v1/salas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_sala_success(self):
        payload = {
            "nombre": "Laboratorio Beta",
            "ciclo": "Ciclo Superior",
            "capacidad": 25
        }
        response = self.client.post('/api/v1/salas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_sala_invalid_capacidad(self):
        payload = {
            "nombre": "Laboratorio Gamma",
            "ciclo": "Ciclo Superior",
            "capacidad": 0
        }
        response = self.client.post('/api/v1/salas/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_sala(self):
        response = self.client.delete(f'/api/v1/salas/{self.sala.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
