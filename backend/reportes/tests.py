from rest_framework.test import APITestCase
from rest_framework import status

class ReportesAPITestCase(APITestCase):
    def test_get_reportes(self):
        response = self.client.get('/api/v1/reportes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('totalReservas', response.data)
        self.assertIn('docentesRegistrados', response.data)
        self.assertIn('labsDisponibles', response.data)
