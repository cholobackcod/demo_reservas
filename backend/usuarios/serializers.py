from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email', 'password', 'rol', 'activo', 'fecha_creacion']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def validate_password(self, value):
        if value and len(value) < 4:
            raise serializers.ValidationError('La contraseña debe tener al menos 4 caracteres.')
        return value
