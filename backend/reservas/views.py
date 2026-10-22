from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Reserva
from .serializers import ReservaSerializer

class ReservaListCreateAPIView(APIView):
    """
    Vista APIView acorde al Diagrama de Secuencia:
    - GET: Consulta de disponibilidad del laboratorio (Pasos 2-7).
           GET /api/v1/reservas/?salaId={id}&estado=confirmada
    - POST: Creación de reserva con validación estricta y revalidación en modelo (Pasos 10-40).
    """
    def get(self, request):
        # Paso 2: GET /api/v1/reservas/?salaId={id}&estado=confirmada
        usuario_id = request.query_params.get('usuarioId') or request.query_params.get('usuario')
        sala_id = request.query_params.get('salaId') or request.query_params.get('sala')
        estado = request.query_params.get('estado')

        # Paso 3: SELECT * FROM reservas_reserva WHERE sala_id = {id} AND estado = 'confirmada'
        reservas = Reserva.objects.all()

        if usuario_id:
            reservas = reservas.filter(usuario_id=usuario_id)
        if sala_id:
            reservas = reservas.filter(sala_id=sala_id)
        if estado:
            reservas = reservas.filter(estado=estado)

        # Paso 5 y 6: ReservaSerializer(reservas, many=True) -> serializer.data
        serializer = ReservaSerializer(reservas, many=True)
        # Paso 7: 200 OK (Lista de reservas)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Paso 10: POST /api/v1/reservas/ {usuarioId, salaId, inicio, fin}
        # Paso 11: ReservaSerializer(data=request.data)
        serializer = ReservaSerializer(data=request.data)

        # Paso 12: is_valid()
        if serializer.is_valid():
            # Paso 27: is_valid() = True
            try:
                # Paso 28: save()
                # Paso 29-32: create() -> save() -> full_clean() -> clean() (revalidación)
                # Paso 36-38: INSERT en base de datos e instancia persistida
                serializer.save()
                # Paso 39-40: serializer.data -> 201 Created
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as exc:
                # Paso 33: alt [Solapamiento tardío o error al guardar] -> Excepción no controlada
                # Paso 34: 500 Internal Server Error
                return Response(
                    {
                        "detail": "Error interno del servidor",
                        "error": str(exc)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Paso 15-16, 19-20, 24-25: errores de validación -> 400 Bad Request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservaDetailAPIView(APIView):
    """
    Vista APIView para consultar (GET), actualizar (PUT/PATCH) y eliminar (DELETE) una reserva por ID.
    """
    def get(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        serializer = ReservaSerializer(reserva, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        serializer = ReservaSerializer(reserva, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        reserva = get_object_or_404(Reserva, pk=pk)
        reserva.estado = 'cancelada'
        reserva.save(update_fields=['estado'])
        return Response(
            {
                "mensaje": "Reserva cancelada correctamente.",
                "id": reserva.id,
                "estado": reserva.estado
            },
            status=status.HTTP_200_OK
        )
