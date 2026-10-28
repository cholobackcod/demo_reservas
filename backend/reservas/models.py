from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import datetime
from usuarios.models import Usuario
from salas.models import Sala

class Reserva(models.Model):
    ESTADOS = (
        ('confirmada', 'Confirmada'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada'),
    )

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Usuario"
    )
    sala = models.ForeignKey(
        Sala,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Sala"
    )
    inicio = models.DateTimeField(verbose_name="Fecha/Hora de Inicio")
    fin = models.DateTimeField(verbose_name="Fecha/Hora de Fin")
    curso = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Curso"
    )
    materia = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name="Materia"
    )
    netbooks = models.PositiveIntegerField(
        default=0,
        verbose_name="Cantidad de Netbooks"
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='confirmada',
        verbose_name="Estado"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-inicio']

    def clean(self):
        super().clean()
        if self.inicio and self.fin:
            if self.inicio >= self.fin:
                raise ValidationError({'fin': 'La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.'})
            
            # Validación de horario escolar (07:00 a 18:00 hs) y mismo día para reservas confirmadas
            if self.estado == 'confirmada':
                # Validar que la fecha y hora de inicio no haya pasado al crear una nueva reserva
                if (self._state.adding or not self.pk) and self.inicio < timezone.now():
                    raise ValidationError({'inicio': 'No es posible realizar reservas en una fecha u hora que ya ha transcurrido.'})

                inicio_local = timezone.localtime(self.inicio) if timezone.is_aware(self.inicio) else self.inicio
                fin_local = timezone.localtime(self.fin) if timezone.is_aware(self.fin) else self.fin

                if inicio_local.date() != fin_local.date():
                    raise ValidationError({'fin': 'La reserva debe iniciar y finalizar en el mismo día.'})

                hora_apertura = datetime.time(7, 0)
                hora_cierre = datetime.time(18, 0)

                if (inicio_local.time() < hora_apertura or 
                    inicio_local.time() >= hora_cierre or 
                    fin_local.time() > hora_cierre or 
                    fin_local.time() <= hora_apertura):
                    raise ValidationError('No es posible realizar reservas fuera del horario escolar (07:00 a 18:00 hs).')

                # Validación automática de topes semanales de reserva por materia (máx 3 reservas por semana)
                if self.materia and self.materia.strip():
                    lunes = inicio_local.date() - datetime.timedelta(days=inicio_local.date().weekday())
                    domingo = lunes + datetime.timedelta(days=6)
                    inicio_sem = timezone.make_aware(datetime.datetime.combine(lunes, datetime.time.min)) if timezone.is_aware(self.inicio) else datetime.datetime.combine(lunes, datetime.time.min)
                    fin_sem = timezone.make_aware(datetime.datetime.combine(domingo, datetime.time.max)) if timezone.is_aware(self.inicio) else datetime.datetime.combine(domingo, datetime.time.max)

                    TOPE_SEMANAL_MATERIA = 3
                    reservas_materia = Reserva.objects.filter(
                        materia__iexact=self.materia.strip(),
                        estado='confirmada',
                        inicio__gte=inicio_sem,
                        inicio__lte=fin_sem
                    )
                    if self.pk:
                        reservas_materia = reservas_materia.exclude(pk=self.pk)

                    if reservas_materia.count() >= TOPE_SEMANAL_MATERIA:
                        raise ValidationError({
                            'materia': f"Se ha alcanzado el tope semanal de {TOPE_SEMANAL_MATERIA} reservas para la materia '{self.materia}'."
                        })

                # Paso 31 del Diagrama de Secuencia:
                # SELECT reservas solapadas (revalidación en modelo antes de persistir)
                solapadas = Reserva.objects.filter(
                    sala=self.sala,
                    estado='confirmada',
                    inicio__lt=self.fin,
                    fin__gt=self.inicio
                )
                if self.pk:
                    solapadas = solapadas.exclude(pk=self.pk)
                
                # Paso 32: Resultado revalidación
                if solapadas.exists() and not getattr(self, '_omitir_solapamiento', False):
                    raise ValidationError('La sala ya se encuentra reservada en ese horario por otro docente.')

    def save(self, *args, **kwargs):
        # Paso 30 del Diagrama de Secuencia: save() -> full_clean() -> clean()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva #{self.id} - Sala {self.sala.nombre} ({self.inicio} a {self.fin})"
