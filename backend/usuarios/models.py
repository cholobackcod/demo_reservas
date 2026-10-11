from django.db import models
from django.core.exceptions import ValidationError
import re

def validate_nombre_apellido(value):
    if not value or len(value.strip()) < 2:
        raise ValidationError('El campo debe tener al menos 2 caracteres.')
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
        raise ValidationError('El campo solo debe contener letras y espacios.')

class Usuario(models.Model):
    ROLES = (
        ('admin', 'Administrador'),
        ('docente', 'Docente'),
    )

    nombre = models.CharField(
        max_length=100,
        validators=[validate_nombre_apellido],
        verbose_name="Nombre"
    )
    apellido = models.CharField(
        max_length=100,
        validators=[validate_nombre_apellido],
        verbose_name="Apellido"
    )
    email = models.EmailField(
        max_length=150,
        unique=True,
        verbose_name="Correo Electrónico",
        error_messages={'unique': 'Ya existe un usuario registrado con este correo electrónico.'}
    )
    password = models.CharField(
        max_length=255,
        verbose_name="Contraseña"
    )
    rol = models.CharField(
        max_length=20,
        choices=ROLES,
        default='docente',
        verbose_name="Rol"
    )
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ['id']

    def clean(self):
        super().clean()
        if self.password and len(self.password) < 4:
            raise ValidationError({'password': 'La contraseña debe tener al menos 4 caracteres.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
