from django.db import models
from django.core.exceptions import ValidationError
from usuarios.models import Usuario

class Materia(models.Model):
    TIPOS = (
        ('materia', 'Materia / Espacio Curricular'),
        ('tutoria', 'Tutoría'),
        ('taller', 'Taller'),
        ('club', 'Club'),
    )

    nombre = models.CharField(
        max_length=150,
        unique=True,
        verbose_name="Nombre de la Materia"
    )
    codigo = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Código Oficial"
    )
    tipo_predeterminado = models.CharField(
        max_length=20,
        choices=TIPOS,
        default='materia',
        verbose_name="Tipo Predeterminado"
    )
    activa = models.BooleanField(
        default=True,
        verbose_name="Activa"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    class Meta:
        verbose_name = "Materia"
        verbose_name_plural = "Materias"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Curso(models.Model):
    anio = models.PositiveSmallIntegerField(
        verbose_name="Año (1 a 6)"
    )
    division = models.CharField(
        max_length=20,
        blank=True,
        default='A',
        verbose_name="División"
    )
    nombre = models.CharField(
        max_length=60,
        unique=True,
        verbose_name="Nombre Completo del Curso"
    )

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"
        ordering = ['anio', 'division', 'nombre']

    def __str__(self):
        return self.nombre


class ConfiguracionInstitucional(models.Model):
    duracion_modulo_minutos = models.PositiveIntegerField(
        default=40,
        verbose_name="Duración del Módulo Pedagógico (minutos reloj)"
    )
    ciclo_lectivo_actual = models.CharField(
        max_length=10,
        default='2026',
        verbose_name="Ciclo Lectivo Actual"
    )
    nombre_institucion = models.CharField(
        max_length=150,
        default='Escuela Experimental con énfasis en T.I.C. Sede Capital Norte',
        verbose_name="Nombre Institución"
    )

    class Meta:
        verbose_name = "Configuración Institucional"
        verbose_name_plural = "Configuraciones Institucionales"

    @classmethod
    def get_config(cls):
        config, _ = cls.objects.get_or_create(id=1)
        return config

    def __str__(self):
        return f"{self.nombre_institucion} (Módulo: {self.duracion_modulo_minutos} min - Ciclo: {self.ciclo_lectivo_actual})"


class AsignacionDocente(models.Model):
    DIAS = (
        ('lunes', 'Lunes'),
        ('martes', 'Martes'),
        ('miercoles', 'Miércoles'),
        ('jueves', 'Jueves'),
        ('viernes', 'Viernes'),
    )

    TIPOS_ACTIVIDAD = (
        ('materia', 'Materia'),
        ('tutoria', 'Tutoría'),
        ('taller', 'Taller'),
        ('club', 'Club'),
    )

    docente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='asignaciones_docente',
        verbose_name="Docente"
    )
    materia = models.ForeignKey(
        Materia,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name="Materia / Espacio Curricular"
    )
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name="Curso"
    )
    dia_semana = models.CharField(
        max_length=15,
        choices=DIAS,
        verbose_name="Día de la Semana"
    )
    hora_inicio = models.TimeField(
        verbose_name="Hora de Inicio"
    )
    hora_fin = models.TimeField(
        verbose_name="Hora de Finalización"
    )
    tipo_actividad = models.CharField(
        max_length=20,
        choices=TIPOS_ACTIVIDAD,
        default='materia',
        verbose_name="Tipo de Actividad"
    )
    ciclo_lectivo = models.CharField(
        max_length=10,
        default='2026',
        verbose_name="Ciclo Lectivo"
    )
    observaciones = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name="Observaciones"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    class Meta:
        verbose_name = "Asignación Docente"
        verbose_name_plural = "Asignaciones Docentes"
        ordering = ['dia_semana', 'hora_inicio']

    @property
    def duracion_minutos(self):
        if not self.hora_inicio or not self.hora_fin:
            return 0
        min_inicio = self.hora_inicio.hour * 60 + self.hora_inicio.minute
        min_fin = self.hora_fin.hour * 60 + self.hora_fin.minute
        return max(0, min_fin - min_inicio)

    @property
    def duracion_horas_formato(self):
        m = self.duracion_minutos
        horas = m // 60
        mins = m % 60
        if horas > 0 and mins > 0:
            return f"{horas}h {mins}m"
        elif horas > 0:
            return f"{horas}h"
        return f"{mins}m"

    @property
    def es_catedra_compartida(self):
        if not self.pk or not self.curso_id or not self.materia_id or not self.hora_inicio or not self.hora_fin:
            return False
        return AsignacionDocente.objects.filter(
            curso_id=self.curso_id,
            materia_id=self.materia_id,
            dia_semana=self.dia_semana,
            ciclo_lectivo=self.ciclo_lectivo,
            hora_inicio__lt=self.hora_fin,
            hora_fin__gt=self.hora_inicio
        ).exclude(pk=self.pk).exists()

    @property
    def co_docentes(self):
        if not self.pk or not self.curso_id or not self.materia_id or not self.hora_inicio or not self.hora_fin:
            return []
        co_asigs = AsignacionDocente.objects.filter(
            curso_id=self.curso_id,
            materia_id=self.materia_id,
            dia_semana=self.dia_semana,
            ciclo_lectivo=self.ciclo_lectivo,
            hora_inicio__lt=self.hora_fin,
            hora_fin__gt=self.hora_inicio
        ).exclude(pk=self.pk).select_related('docente')
        return [f"{a.docente.nombre} {a.docente.apellido}".strip() for a in co_asigs if a.docente]

    def clean(self):
        super().clean()
        if self.hora_inicio and self.hora_fin:
            if self.hora_fin <= self.hora_inicio:
                raise ValidationError({
                    'hora_fin': 'La hora de finalización debe ser posterior a la hora de inicio.'
                })

            # 1. Detección de superposiciones horarias para el mismo docente
            overlap_docente = AsignacionDocente.objects.filter(
                docente=self.docente,
                dia_semana=self.dia_semana,
                ciclo_lectivo=self.ciclo_lectivo,
                hora_inicio__lt=self.hora_fin,
                hora_fin__gt=self.hora_inicio
            )
            if self.pk:
                overlap_docente = overlap_docente.exclude(pk=self.pk)

            if overlap_docente.exists():
                ch = overlap_docente.first()
                raise ValidationError({
                    'hora_inicio': f"Conflicto horario para {self.docente.nombre} {self.docente.apellido}: Ya tiene asignada '{ch.materia.nombre}' ({ch.curso.nombre}) el {self.get_dia_semana_display()} de {ch.hora_inicio.strftime('%H:%M')} a {ch.hora_fin.strftime('%H:%M')}."
                })

            # 2. Detección de superposiciones horarias para el mismo curso
            # Se permite Cátedra Compartida (pareja pedagógica): dos docentes distintos
            # impartiendo la misma materia al mismo curso en el mismo horario.
            # Solo se genera conflicto si el curso ya tiene asignada OTRA materia diferente.
            overlap_curso = AsignacionDocente.objects.filter(
                curso=self.curso,
                dia_semana=self.dia_semana,
                ciclo_lectivo=self.ciclo_lectivo,
                hora_inicio__lt=self.hora_fin,
                hora_fin__gt=self.hora_inicio
            )
            if self.materia_id:
                overlap_curso = overlap_curso.exclude(materia_id=self.materia_id)
            if self.pk:
                overlap_curso = overlap_curso.exclude(pk=self.pk)

            if overlap_curso.exists():
                ch = overlap_curso.first()
                raise ValidationError({
                    'curso': f"Conflicto de curso: El curso {self.curso.nombre} ya tiene clase asignada de '{ch.materia.nombre}' con el docente {ch.docente.nombre} {ch.docente.apellido} el {self.get_dia_semana_display()} de {ch.hora_inicio.strftime('%H:%M')} a {ch.hora_fin.strftime('%H:%M')}."
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.docente.nombre} {self.docente.apellido} - {self.materia.nombre} ({self.curso.nombre}) [{self.dia_semana} {self.hora_inicio}-{self.hora_fin}]"
