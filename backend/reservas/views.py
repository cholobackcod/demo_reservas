from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Reserva
from .serializers import ReservaSerializer

class ReservaListCreateAPIView(APIView):
    """
    Vista APIView para listar reservas (GET) con filtros por usuarioId/salaId y crear reserva (POST).
    """
    def get(self, request):
        usuario_id = request.query_params.get('usuarioId') or request.query_params.get('usuario')
        sala_id = request.query_params.get('salaId') or request.query_params.get('sala')
        estado = request.query_params.get('estado')

        reservas = Reserva.objects.all()

        if usuario_id:
            reservas = reservas.filter(usuario_id=usuario_id)
        if sala_id:
            reservas = reservas.filter(sala_id=sala_id)
        if estado:
            reservas = reservas.filter(estado=estado)

        serializer = ReservaSerializer(reservas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReservaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        reserva.delete()
        return Response({"mensaje": "Reserva eliminada correctamente."}, status=status.HTTP_200_OK)
