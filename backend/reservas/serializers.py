from rest_framework import serializers
from .models import Reserva
from usuarios.models import Usuario
from salas.models import Sala
from django.utils import timezone
import datetime

class ReservaSerializer(serializers.ModelSerializer):
    usuarioId = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario',
        error_messages={'does_not_exist': 'El usuario especificado no existe.'}
    )
    usuarioNombre = serializers.SerializerMethodField(read_only=True)
    usuarioEmail = serializers.SerializerMethodField(read_only=True)
    salaId = serializers.PrimaryKeyRelatedField(
        queryset=Sala.objects.all(),
        source='sala',
        error_messages={'does_not_exist': 'El laboratorio especificado no existe.'}
    )
    # Formatear inicio y fin en ISO8601 string sin offset para Angular
    inicio = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    fin = serializers.DateTimeField(format="%Y-%m-%dT%H:%M")
    curso = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    materia = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    netbooks = serializers.IntegerField(required=False, default=0, min_value=0)
    estado = serializers.CharField(default='confirmada', required=False)

    class Meta:
        model = Reserva
        fields = [
            'id', 'usuarioId', 'usuarioNombre', 'usuarioEmail', 'salaId',
            'inicio', 'fin', 'curso', 'materia', 'netbooks', 'estado', 'fecha_creacion'
        ]

    def get_usuarioNombre(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}".strip()
        return "Docente"

    def get_usuarioEmail(self, obj):
        return obj.usuario.email if obj.usuario else ""

    def validate(self, data):
        # Paso 18 del Diagrama de Secuencia: validate(): inicio < fin
        inicio = data.get('inicio', getattr(self.instance, 'inicio', None))
        fin = data.get('fin', getattr(self.instance, 'fin', None))
        sala = data.get('sala', getattr(self.instance, 'sala', None))
        estado = data.get('estado', getattr(self.instance, 'estado', 'confirmada'))
        materia = data.get('materia', getattr(self.instance, 'materia', ''))

        if inicio and fin:
            # Paso 19: alt [fin <= inicio] -> ValidationError (fin)
            if inicio >= fin:
                raise serializers.ValidationError({
                    "fin": "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio."
                })

            if estado == 'confirmada':
                # Validar que la fecha y hora de inicio no haya pasado
                es_nueva = self.instance is None
                inicio_modificado = self.instance and self.instance.inicio != inicio
                if (es_nueva or inicio_modificado) and inicio < timezone.now():
                    mensaje_pasada = "No es posible realizar reservas en una fecha u hora que ya ha transcurrido."
                    raise serializers.ValidationError({
                        "inicio": mensaje_pasada,
                        "non_field_errors": [mensaje_pasada]
                    })

                inicio_local = timezone.localtime(inicio) if timezone.is_aware(inicio) else inicio
                fin_local = timezone.localtime(fin) if timezone.is_aware(fin) else fin

                # El usuario elije fecha de inicio y por defecto la fecha de fin es el mismo día
                if inicio_local.date() != fin_local.date():
                    raise serializers.ValidationError({
                        "fin": "La reserva debe iniciar y finalizar en el mismo día."
                    })

                # Horario escolar: 07:00 a 18:00 hs
                hora_apertura = datetime.time(7, 0)
                hora_cierre = datetime.time(18, 0)

                if (inicio_local.time() < hora_apertura or 
                    inicio_local.time() >= hora_cierre or 
                    fin_local.time() > hora_cierre or 
                    fin_local.time() <= hora_apertura):
                    mensaje_fuera_horario = "No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs)."
                    raise serializers.ValidationError({
                        "horario_escolar": mensaje_fuera_horario,
                        "non_field_errors": [mensaje_fuera_horario]
                    })

                # HU05: Validación automática de topes semanales de reserva por materia (máx 3 reservas por semana)
                if materia and str(materia).strip():
                    lunes = inicio_local.date() - datetime.timedelta(days=inicio_local.date().weekday())
                    domingo = lunes + datetime.timedelta(days=6)
                    inicio_sem = timezone.make_aware(datetime.datetime.combine(lunes, datetime.time.min)) if timezone.is_aware(inicio) else datetime.datetime.combine(lunes, datetime.time.min)
                    fin_sem = timezone.make_aware(datetime.datetime.combine(domingo, datetime.time.max)) if timezone.is_aware(inicio) else datetime.datetime.combine(domingo, datetime.time.max)

                    TOPE_SEMANAL_MATERIA = 3
                    reservas_materia = Reserva.objects.filter(
                        materia__iexact=str(materia).strip(),
                        estado='confirmada',
                        inicio__gte=inicio_sem,
                        inicio__lte=fin_sem
                    )
                    if self.instance and self.instance.pk:
                        reservas_materia = reservas_materia.exclude(pk=self.instance.pk)

                    if reservas_materia.count() >= TOPE_SEMANAL_MATERIA:
                        mensaje_tope = f"Se ha alcanzado el tope semanal de {TOPE_SEMANAL_MATERIA} reservas para la materia '{materia}'."
                        raise serializers.ValidationError({
                            "materia": mensaje_tope,
                            "non_field_errors": [mensaje_tope]
                        })

                # Paso 22: SELECT reservas confirmadas solapadas (sala, inicio, fin)
                if sala:
                    instance_id = self.instance.id if self.instance else None
                    solapadas = Reserva.objects.filter(
                        sala=sala,
                        estado='confirmada',
                        inicio__lt=fin,
                        fin__gt=inicio
                    )
                    if instance_id:
                        solapadas = solapadas.exclude(id=instance_id)

                    # Paso 24: alt [Existe solapamiento horario] -> ValidationError (sala ocupada)
                    if solapadas.exists():
                        mensaje_sala_ocupada = "El laboratorio seleccionado ya se encuentra reservado en ese horario por otro docente."
                        raise serializers.ValidationError({
                            "sala_ocupada": mensaje_sala_ocupada,
                            "non_field_errors": [mensaje_sala_ocupada]
                        })

        return data
