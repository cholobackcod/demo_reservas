from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

def validate_nombre_sala(value):
    if not value or len(value.strip()) < 3:
        raise ValidationError('El nombre de la sala debe tener al menos 3 caracteres.')

class Sala(models.Model):
    nombre = models.CharField(
        max_length=100,
        unique=True,
        validators=[validate_nombre_sala],
        verbose_name="Nombre de Sala",
        error_messages={'unique': 'Ya existe una sala o laboratorio con este nombre.'}
    )
    ciclo = models.CharField(
        max_length=100,
        default='Ciclo Básico',
        verbose_name="Ciclo / Edificio"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    capacidad = models.IntegerField(
        validators=[MinValueValidator(1, message="La capacidad debe ser de al menos 1 persona.")],
        verbose_name="Capacidad"
    )
    imagen = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Imagen URL"
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
        verbose_name = "Sala"
        verbose_name_plural = "Salas"
        ordering = ['id']

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} (Capacidad: {self.capacidad})"
