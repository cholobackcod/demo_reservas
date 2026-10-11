from rest_framework import serializers
from .models import Sala

class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ['id', 'nombre', 'ciclo', 'descripcion', 'capacidad', 'imagen', 'activa', 'fecha_creacion']

    def validate_capacidad(self, value):
        if value <= 0:
            raise serializers.ValidationError('La capacidad debe ser un número entero mayor a 0.')
        return value
