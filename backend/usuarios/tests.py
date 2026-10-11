from rest_framework.test import APITestCase
from rest_framework import status
from .models import Usuario

class UsuarioAPITestCase(APITestCase):
    def setUp(self):
        self.user_data = {
            "nombre": "Juan",
            "apellido": "Pérez",
            "email": "juan@test.com",
            "password": "password123",
            "rol": "docente"
        }
        self.user = Usuario.objects.create(**self.user_data)

    def test_list_usuarios(self):
        response = self.client.get('/api/v1/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_usuario_success(self):
        new_user = {
            "nombre": "Maria",
            "apellido": "Gomez",
            "email": "maria@test.com",
            "password": "password123",
            "rol": "docente"
        }
        response = self.client.post('/api/v1/usuarios/', new_user, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_usuario_duplicate_email(self):
        response = self.client.post('/api/v1/usuarios/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_usuario_detail(self):
        response = self.client.get(f'/api/v1/usuarios/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_get_usuario_not_found(self):
        response = self.client.get('/api/v1/usuarios/9999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_login_success(self):
        payload = {"email": "juan@test.com", "password": "password123"}
        response = self.client.post('/api/v1/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_failure(self):
        payload = {"email": "juan@test.com", "password": "wrongpassword"}
        response = self.client.post('/api/v1/auth/login/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
