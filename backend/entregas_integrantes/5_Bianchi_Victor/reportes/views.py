from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reservas.models import Reserva
from usuarios.models import Usuario
from salas.models import Sala

class ReportesAPIView(APIView):
    """
    Vista APIView para calcular y devolver estadísticas globales del sistema de gestión de reservas.
    """
    def get(self, request):
        total_reservas = Reserva.objects.count()
        docentes_registrados = Usuario.objects.filter(rol='docente').count()
        labs_disponibles = Sala.objects.filter(activa=True).count()
        
        salas = Sala.objects.all()
        stats_por_lab = []
        
        denominator = max(total_reservas, 1)
        sum_porcentajes = 0
        
        for s in salas:
            count = Reserva.objects.filter(sala=s).count()
            porcentaje = round((count / denominator) * 100)
            stats_por_lab.append({
                "nombre": s.nombre,
                "reservasCount": count,
                "porcentaje": porcentaje
            })
            sum_porcentajes += porcentaje

        ocupacion_promedio = round(sum_porcentajes / max(len(salas), 1)) if salas.exists() else 0

        data = {
            "totalReservas": total_reservas,
            "docentesRegistrados": docentes_registrados,
            "labsDisponibles": labs_disponibles,
            "ocupacionPromedio": ocupacion_promedio,
            "statsPorLab": stats_por_lab
        }

        return Response(data, status=status.HTTP_200_OK)
