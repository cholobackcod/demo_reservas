from rest_framework import serializers
from .models import Materia, Curso, ConfiguracionInstitucional, AsignacionDocente
from usuarios.models import Usuario

class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = ['id', 'nombre', 'codigo', 'tipo_predeterminado', 'activa', 'fecha_creacion']


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = ['id', 'anio', 'division', 'nombre']


class ConfiguracionInstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionInstitucional
        fields = ['id', 'duracion_modulo_minutos', 'ciclo_lectivo_actual', 'nombre_institucion']


class AsignacionDocenteSerializer(serializers.ModelSerializer):
    docenteId = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='docente',
        error_messages={'does_not_exist': 'El docente especificado no existe.'}
    )
    docenteNombre = serializers.SerializerMethodField(read_only=True)
    docenteEmail = serializers.SerializerMethodField(read_only=True)
    materiaId = serializers.PrimaryKeyRelatedField(
        queryset=Materia.objects.all(),
        source='materia',
        error_messages={'does_not_exist': 'La materia seleccionada no existe.'}
    )
    materiaNombre = serializers.SerializerMethodField(read_only=True)
    cursoId = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        source='curso',
        error_messages={'does_not_exist': 'El curso seleccionado no existe.'}
    )
    cursoNombre = serializers.SerializerMethodField(read_only=True)
    duracionMinutos = serializers.IntegerField(source='duracion_minutos', read_only=True)
    duracionHorasFormato = serializers.CharField(source='duracion_horas_formato', read_only=True)
    hora_inicio = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])
    hora_fin = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])

    class Meta:
        model = AsignacionDocente
        fields = [
            'id', 'docenteId', 'docenteNombre', 'docenteEmail',
            'materiaId', 'materiaNombre', 'cursoId', 'cursoNombre',
            'dia_semana', 'hora_inicio', 'hora_fin', 'duracionMinutos',
            'duracionHorasFormato', 'tipo_actividad', 'ciclo_lectivo',
            'observaciones', 'fecha_creacion'
        ]

    def get_docenteNombre(self, obj):
        if obj.docente:
            return f"{obj.docente.nombre} {obj.docente.apellido}".strip()
        return ""

    def get_docenteEmail(self, obj):
        return obj.docente.email if obj.docente else ""

    def get_materiaNombre(self, obj):
        return obj.materia.nombre if obj.materia else ""

    def get_cursoNombre(self, obj):
        return obj.curso.nombre if obj.curso else ""

    def validate(self, data):
        hora_inicio = data.get('hora_inicio', getattr(self.instance, 'hora_inicio', None))
        hora_fin = data.get('hora_fin', getattr(self.instance, 'hora_fin', None))
        docente = data.get('docente', getattr(self.instance, 'docente', None))
        curso = data.get('curso', getattr(self.instance, 'curso', None))
        dia_semana = data.get('dia_semana', getattr(self.instance, 'dia_semana', None))
        ciclo_lectivo = data.get('ciclo_lectivo', getattr(self.instance, 'ciclo_lectivo', '2026'))

        if hora_inicio and hora_fin:
            if hora_fin <= hora_inicio:
                raise serializers.ValidationError({
                    'hora_fin': 'La hora de finalización debe ser posterior a la de inicio.'
                })

            # Validar superposiciones para el docente
            if docente and dia_semana:
                overlap_doc = AsignacionDocente.objects.filter(
                    docente=docente,
                    dia_semana=dia_semana,
                    ciclo_lectivo=ciclo_lectivo,
                    hora_inicio__lt=hora_fin,
                    hora_fin__gt=hora_inicio
                )
                if self.instance:
                    overlap_doc = overlap_doc.exclude(pk=self.instance.pk)

                if overlap_doc.exists():
                    ch = overlap_doc.first()
                    raise serializers.ValidationError({
                        'superposicion': f"Superposición horaria: El docente ya tiene asignada '{ch.materia.nombre}' ({ch.curso.nombre}) el {dia_semana.capitalize()} de {ch.hora_inicio.strftime('%H:%M')} a {ch.hora_fin.strftime('%H:%M')} hs.",
                        'non_field_errors': [f"Superposición horaria: El docente ya tiene clase de '{ch.materia.nombre}' el {dia_semana.capitalize()} de {ch.hora_inicio.strftime('%H:%M')} a {ch.hora_fin.strftime('%H:%M')} hs."]
                    })

            # Validar superposiciones para el curso
            if curso and dia_semana:
                overlap_cur = AsignacionDocente.objects.filter(
                    curso=curso,
                    dia_semana=dia_semana,
                    ciclo_lectivo=ciclo_lectivo,
                    hora_inicio__lt=hora_fin,
                    hora_fin__gt=hora_inicio
                )
                if self.instance:
                    overlap_cur = overlap_cur.exclude(pk=self.instance.pk)

                if overlap_cur.exists():
                    ch = overlap_cur.first()
                    raise serializers.ValidationError({
                        'superposicion_curso': f"Conflicto de curso: El curso {curso.nombre} ya tiene clase de '{ch.materia.nombre}' con {ch.docente.nombre} {ch.docente.apellido} el {dia_semana.capitalize()} de {ch.hora_inicio.strftime('%H:%M')} a {ch.hora_fin.strftime('%H:%M')} hs.",
                        'non_field_errors': [f"Conflicto de curso: El curso {curso.nombre} ya tiene asignada la materia '{ch.materia.nombre}' en ese horario."]
                    })

        return data


class DocenteCargaHorariaSerializer(serializers.ModelSerializer):
    totalMinutosSemanal = serializers.SerializerMethodField()
    totalHorasRelojFormato = serializers.SerializerMethodField()
    totalHorasReloj = serializers.SerializerMethodField()
    totalModulos = serializers.SerializerMethodField()
    duracionModuloMinutos = serializers.SerializerMethodField()
    desgloseDias = serializers.SerializerMethodField()
    materiasAsignadas = serializers.SerializerMethodField()
    asignaciones = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'apellido', 'email', 'rol', 'activo', 'fecha_creacion',
            'totalMinutosSemanal', 'totalHorasRelojFormato', 'totalHorasReloj',
            'totalModulos', 'duracionModuloMinutos', 'desgloseDias',
            'materiasAsignadas', 'asignaciones'
        ]

    def _get_asignaciones_qs(self, obj):
        ciclo = self.context.get('ciclo_lectivo')
        qs = obj.asignaciones_docente.all()
        if ciclo:
            qs = qs.filter(ciclo_lectivo=ciclo)
        return qs

    def get_totalMinutosSemanal(self, obj):
        qs = self._get_asignaciones_qs(obj)
        return sum(a.duracion_minutos for a in qs)

    def get_totalHorasRelojFormato(self, obj):
        total_m = self.get_totalMinutosSemanal(obj)
        h = total_m // 60
        m = total_m % 60
        if h > 0 and m > 0:
            return f"{h}h {m}m"
        elif h > 0:
            return f"{h}h"
        return f"{m}m"

    def get_totalHorasReloj(self, obj):
        total_m = self.get_totalMinutosSemanal(obj)
        return round(total_m / 60.0, 2)

    def get_duracionModuloMinutos(self, obj):
        config = ConfiguracionInstitucional.get_config()
        return config.duracion_modulo_minutos

    def get_totalModulos(self, obj):
        total_m = self.get_totalMinutosSemanal(obj)
        mod_min = self.get_duracionModuloMinutos(obj)
        if mod_min <= 0:
            return 0
        return round(total_m / float(mod_min), 1)

    def get_desgloseDias(self, obj):
        qs = self._get_asignaciones_qs(obj)
        mod_min = self.get_duracionModuloMinutos(obj)
        dias_keys = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
        dias_labels = {
            'lunes': 'Lunes',
            'martes': 'Martes',
            'miercoles': 'Miércoles',
            'jueves': 'Jueves',
            'viernes': 'Viernes'
        }

        res = {}
        for dk in dias_keys:
            asigs = [a for a in qs if a.dia_semana == dk]
            min_dia = sum(a.duracion_minutos for a in asigs)
            h = min_dia // 60
            m = min_dia % 60
            horas_fmt = f"{h}h {m}m" if (h > 0 and m > 0) else (f"{h}h" if h > 0 else f"{m}m")
            modulos_dia = round(min_dia / float(mod_min), 1) if mod_min > 0 else 0

            res[dk] = {
                'nombre': dias_labels[dk],
                'minutos': min_dia,
                'horasFormato': horas_fmt,
                'modulos': modulos_dia,
                'cantidadBloques': len(asigs),
                'bloques': AsignacionDocenteSerializer(asigs, many=True).data
            }
        return res

    def get_materiasAsignadas(self, obj):
        qs = self._get_asignaciones_qs(obj)
        materias_set = set()
        for a in qs:
            materias_set.add(a.materia.nombre)
        return sorted(list(materias_set))

    def get_asignaciones(self, obj):
        qs = self._get_asignaciones_qs(obj)
        return AsignacionDocenteSerializer(qs, many=True).data
