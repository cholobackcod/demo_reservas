from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Sala
from .serializers import SalaSerializer

class SalaListCreateAPIView(APIView):
    """
    Vista APIView para listar salas/labs (GET) y registrar nueva sala/lab (POST).
    """
    def get(self, request):
        salas = Sala.objects.all()
        serializer = SalaSerializer(salas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SalaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalaDetailAPIView(APIView):
    """
    Vista APIView para consultar (GET), actualizar (PUT/PATCH) y eliminar (DELETE) una sala por ID.
    """
    def get(self, request, pk):
        sala = get_object_or_404(Sala, pk=pk)
        serializer = SalaSerializer(sala)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        sala = get_object_or_404(Sala, pk=pk)
        serializer = SalaSerializer(sala, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        sala = get_object_or_404(Sala, pk=pk)
        serializer = SalaSerializer(sala, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        sala = get_object_or_404(Sala, pk=pk)
        sala.delete()
        return Response({"mensaje": "Sala/Laboratorio eliminado correctamente."}, status=status.HTTP_200_OK)
