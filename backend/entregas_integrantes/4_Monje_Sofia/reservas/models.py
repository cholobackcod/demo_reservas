from django.db import models
from django.core.exceptions import ValidationError
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
            
            # Validar solapamientos con reservas activas (confirmadas) para la misma sala
            solapadas = Reserva.objects.filter(
                sala=self.sala,
                estado='confirmada',
                inicio__lt=self.fin,
                fin__gt=self.inicio
            )
            if self.pk:
                solapadas = solapadas.exclude(pk=self.pk)
            
            if solapadas.exists():
                raise ValidationError('La sala ya se encuentra reservada en ese horario por otro docente.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reserva #{self.id} - Sala {self.sala.nombre} ({self.inicio} a {self.fin})"
