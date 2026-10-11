from rest_framework import serializers
from .models import Reserva
from usuarios.models import Usuario
from salas.models import Sala

class ReservaSerializer(serializers.ModelSerializer):
    usuarioId = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario'
    )
    salaId = serializers.PrimaryKeyRelatedField(
        queryset=Sala.objects.all(),
        source='sala'
    )
    # Formatear inicio y fin en ISO8601 string sin offset para Angular
    inicio = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    fin = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")

    class Meta:
        model = Reserva
        fields = ['id', 'usuarioId', 'salaId', 'inicio', 'fin', 'estado', 'fecha_creacion']

    def validate(self, data):
        inicio = data.get('inicio')
        fin = data.get('fin')
        sala = data.get('sala')
        estado = data.get('estado', 'confirmada')

        if inicio and fin:
            if inicio >= fin:
                raise serializers.ValidationError({"fin": "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio."})

            if estado == 'confirmada' and sala:
                instance_id = self.instance.id if self.instance else None
                solapadas = Reserva.objects.filter(
                    sala=sala,
                    estado='confirmada',
                    inicio__lt=fin,
                    fin__gt=inicio
                )
                if instance_id:
                    solapadas = solapadas.exclude(id=instance_id)

                if solapadas.exists():
                    raise serializers.ValidationError({"non_field_errors": ["El laboratorio seleccionado ya se encuentra reservado en ese horario por otro docente."]})

        return data
