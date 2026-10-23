from django.urls import path
from .views import (
    DocenteListCreateAPIView,
    DocenteDetailAPIView,
    DocenteResetPasswordAPIView,
    DocenteMiHorarioAPIView,
    DocenteMateriasAsignadasAPIView,
    AsignacionListCreateAPIView,
    AsignacionDetailAPIView,
    MateriaListCreateAPIView,
    CursoListCreateAPIView,
    ConfiguracionInstitucionalAPIView
)

urlpatterns = [
    # Gestión de Docentes
    path('docentes/', DocenteListCreateAPIView.as_view(), name='docente-list-create'),
    path('docentes/mi-horario/', DocenteMiHorarioAPIView.as_view(), name='docente-mi-horario'),
    path('docentes/<int:pk>/', DocenteDetailAPIView.as_view(), name='docente-detail'),
    path('docentes/<int:pk>/reset-password/', DocenteResetPasswordAPIView.as_view(), name='docente-reset-password'),
    path('docentes/<int:pk>/materias/', DocenteMateriasAsignadasAPIView.as_view(), name='docente-materias-asignadas'),

    # Asignaciones Horarias
    path('asignaciones/', AsignacionListCreateAPIView.as_view(), name='asignacion-list-create'),
    path('asignaciones/<int:pk>/', AsignacionDetailAPIView.as_view(), name='asignacion-detail'),

    # Catálogos y Configuración
    path('materias/', MateriaListCreateAPIView.as_view(), name='materia-list-create'),
    path('cursos/', CursoListCreateAPIView.as_view(), name='curso-list-create'),
    path('configuracion/', ConfiguracionInstitucionalAPIView.as_view(), name='configuracion-institucional'),
]
