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
    forzarSolapamiento = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Reserva
        fields = [
            'id', 'usuarioId', 'usuarioNombre', 'usuarioEmail', 'salaId',
            'inicio', 'fin', 'curso', 'materia', 'netbooks', 'estado', 'fecha_creacion',
            'forzarSolapamiento'
        ]

    def get_usuarioNombre(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}".strip()
        return "Docente"

    def get_usuarioEmail(self, obj):
        return obj.usuario.email if obj.usuario else ""

    def validate(self, data):
        forzar_solapamiento = data.pop('forzarSolapamiento', False)
        self._forzar_solapamiento = forzar_solapamiento
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
                    mensaje_fuera_horario = "No es posible realizar esa reserva: No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs)."
                    raise serializers.ValidationError({
                        "horario_escolar": mensaje_fuera_horario,
                        "non_field_errors": [mensaje_fuera_horario]
                    })

                # Validación automática de topes semanales de reserva por materia (máx 3 reservas por semana)
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
                        mensaje_tope = f"No es posible realizar esa reserva: se ha alcanzado el tope semanal de {TOPE_SEMANAL_MATERIA} reservas para la materia '{materia}'."
                        raise serializers.ValidationError({
                            "materia": mensaje_tope,
                            "non_field_errors": [mensaje_tope]
                        })

                # Validación de Asignación Docente: Un docente sólo puede reservar en materias, cursos, días y horarios asignados
                usuario_reserva = data.get('usuario', getattr(self.instance, 'usuario', None))
                curso_reserva = data.get('curso', getattr(self.instance, 'curso', ''))
                if usuario_reserva and usuario_reserva.rol == 'docente' and materia and str(materia).strip():
                    from docentes.models import AsignacionDocente
                    asignaciones_doc = AsignacionDocente.objects.filter(docente=usuario_reserva)
                    if asignaciones_doc.exists():
                        match_mat = asignaciones_doc.filter(materia__nombre__iexact=str(materia).strip())
                        if not match_mat.exists():
                            msg_mat = f"No es posible realizar esa reserva: el docente no tiene asignada la materia '{materia}'."
                            raise serializers.ValidationError({
                                "materia": msg_mat,
                                "non_field_errors": [msg_mat]
                            })
                        if curso_reserva and str(curso_reserva).strip():
                            match_cur = match_mat.filter(curso__nombre__iexact=str(curso_reserva).strip())
                            if not match_cur.exists():
                                msg_cur = f"No es posible realizar esa reserva: el docente no tiene asignado el curso '{curso_reserva}' para la materia '{materia}'."
                                raise serializers.ValidationError({
                                    "curso": msg_cur,
                                    "non_field_errors": [msg_cur]
                                })

                        dias_map = {0: 'lunes', 1: 'martes', 2: 'miercoles', 3: 'jueves', 4: 'viernes', 5: 'sabado', 6: 'domingo'}
                        dia_semana_reserva = dias_map.get(inicio_local.weekday(), '')
                        match_dia = match_mat.filter(dia_semana=dia_semana_reserva)
                        if not match_dia.exists():
                            msg_dia = f"No es posible realizar esa reserva: no tienes clases asignadas los días {dia_semana_reserva}. Solo podés reservar en los días y horarios en los que das clase."
                            raise serializers.ValidationError({
                                "horario": msg_dia,
                                "inicio": msg_dia,
                                "non_field_errors": [msg_dia]
                            })

                        horario_valido = False
                        for asig in match_dia:
                            if inicio_local.time() >= asig.hora_inicio and fin_local.time() <= asig.hora_fin:
                                horario_valido = True
                                break
                        if not horario_valido:
                            msg_horario = f"No es posible realizar esa reserva: el horario solicitado está fuera del horario en el que das clase ({dia_semana_reserva}). Solo puedes reservar dentro de tu horario escolar oficial."
                            raise serializers.ValidationError({
                                "horario": msg_horario,
                                "non_field_errors": [msg_horario]
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
                    if solapadas.exists() and not forzar_solapamiento:
                        conflicto = solapadas.select_related('usuario', 'sala').first()
                        nombre_docente = (
                            f"{conflicto.usuario.nombre} {conflicto.usuario.apellido}".strip()
                            if conflicto and conflicto.usuario else "otro docente"
                        )
                        inicio_conflicto = conflicto.inicio.strftime('%d/%m/%Y %H:%M') if conflicto else ''
                        fin_conflicto = conflicto.fin.strftime('%H:%M') if conflicto else ''
                        mensaje_sala_ocupada = (
                            "El laboratorio seleccionado ya se encuentra reservado "
                            f"por {nombre_docente} el {inicio_conflicto} a {fin_conflicto}."
                        )
                        raise serializers.ValidationError({
                            "sala_ocupada": mensaje_sala_ocupada,
                            "non_field_errors": [mensaje_sala_ocupada]
                        })

        return data

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance._omitir_solapamiento = getattr(self, '_forzar_solapamiento', False)
        instance.save()
        return instance
