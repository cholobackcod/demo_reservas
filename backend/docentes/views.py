import secrets
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q

from usuarios.models import Usuario
from .models import Materia, Curso, ConfiguracionInstitucional, AsignacionDocente
from .serializers import (
    MateriaSerializer,
    CursoSerializer,
    ConfiguracionInstitucionalSerializer,
    AsignacionDocenteSerializer,
    DocenteCargaHorariaSerializer
)

def generar_password_segura(longitud=8):
    alfabeto = string.ascii_letters + string.digits
    return 'ProA' + ''.join(secrets.choice(alfabeto) for _ in range(longitud)) + '!'

class DocenteListCreateAPIView(APIView):
    """
    Vista APIView para listar docentes con su carga horaria calculada (GET)
    y crear nuevas cuentas docentes (POST).
    """
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        activo = request.query_params.get('activo')
        ciclo = request.query_params.get('ciclo_lectivo')
        if not ciclo:
            ciclo = ConfiguracionInstitucional.get_config().ciclo_lectivo_actual

        docentes = Usuario.objects.filter(rol='docente')

        if q:
            docentes = docentes.filter(
                Q(nombre__icontains=q) | 
                Q(apellido__icontains=q) | 
                Q(email__icontains=q)
            )

        if activo is not None:
            if activo.lower() in ['true', '1']:
                docentes = docentes.filter(activo=True)
            elif activo.lower() in ['false', '0']:
                docentes = docentes.filter(activo=False)

        serializer = DocenteCargaHorariaSerializer(
            docentes,
            many=True,
            context={'ciclo_lectivo': ciclo}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data['rol'] = 'docente'

        auto_password = False
        if not data.get('password') or str(data.get('password')).strip() == '':
            data['password'] = generar_password_segura(6)
            auto_password = True

        from usuarios.serializers import UsuarioSerializer
        user_serializer = UsuarioSerializer(data=data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            ciclo = ConfiguracionInstitucional.get_config().ciclo_lectivo_actual
            out = DocenteCargaHorariaSerializer(user, context={'ciclo_lectivo': ciclo}).data
            out['passwordGenerada'] = data['password'] if auto_password else None
            return Response(out, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocenteDetailAPIView(APIView):
    """
    Obtener detalle completo de un docente con su carga horaria (GET),
    actualizar sus datos o estado (PUT/PATCH), o baja lógica / eliminación (DELETE).
    """
    def get(self, request, pk):
        docente = get_object_or_404(Usuario, pk=pk, rol='docente')
        ciclo = request.query_params.get('ciclo_lectivo') or ConfiguracionInstitucional.get_config().ciclo_lectivo_actual
        serializer = DocenteCargaHorariaSerializer(docente, context={'ciclo_lectivo': ciclo})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        docente = get_object_or_404(Usuario, pk=pk, rol='docente')
        from usuarios.serializers import UsuarioSerializer
        serializer = UsuarioSerializer(docente, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            ciclo = ConfiguracionInstitucional.get_config().ciclo_lectivo_actual
            out = DocenteCargaHorariaSerializer(updated, context={'ciclo_lectivo': ciclo}).data
            return Response(out, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        docente = get_object_or_404(Usuario, pk=pk, rol='docente')
        # Baja lógica preservando historial
        hard_delete = request.query_params.get('hard', 'false').lower() == 'true'
        if hard_delete:
            docente.delete()
            return Response({"mensaje": "Docente eliminado definitivamente."}, status=status.HTTP_200_OK)
        else:
            docente.activo = False
            docente.save()
            return Response({"mensaje": f"Cuenta docente de {docente.nombre} {docente.apellido} desactivada (baja lógica)."}, status=status.HTTP_200_OK)


class DocenteResetPasswordAPIView(APIView):
    """
    Restablece la contraseña de una cuenta docente.
    """
    def post(self, request, pk):
        docente = get_object_or_404(Usuario, pk=pk, rol='docente')
        nueva_pass = request.data.get('password')
        auto = False
        if not nueva_pass or str(nueva_pass).strip() == '':
            nueva_pass = generar_password_segura(6)
            auto = True

        if len(nueva_pass) < 4:
            return Response({"error": "La contraseña debe tener al menos 4 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        docente.password = nueva_pass
        docente.save()

        return Response({
            "mensaje": f"Contraseña restablecida con éxito para {docente.nombre} {docente.apellido}.",
            "nuevaPassword": nueva_pass,
            "autoGenerada": auto
        }, status=status.HTTP_200_OK)


class DocenteMiHorarioAPIView(APIView):
    """
    Retorna el horario y la carga horaria semanal para el docente autenticado.
    """
    def get(self, request):
        docente_id = request.query_params.get('docente_id')
        if not docente_id:
            return Response({"error": "Se requiere el ID del docente."}, status=status.HTTP_400_BAD_REQUEST)

        docente = get_object_or_404(Usuario, pk=docente_id, rol='docente')
        ciclo = request.query_params.get('ciclo_lectivo') or ConfiguracionInstitucional.get_config().ciclo_lectivo_actual
        serializer = DocenteCargaHorariaSerializer(docente, context={'ciclo_lectivo': ciclo})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DocenteMateriasAsignadasAPIView(APIView):
    """
    Retorna el catálogo filtrado de materias y cursos que el docente tiene oficialmente asignados.
    Permite validar y poblar el formulario de reserva de laboratorio.
    """
    def get(self, request, pk):
        docente = get_object_or_404(Usuario, pk=pk, rol='docente')
        ciclo = request.query_params.get('ciclo_lectivo') or ConfiguracionInstitucional.get_config().ciclo_lectivo_actual

        asignaciones = AsignacionDocente.objects.filter(docente=docente, ciclo_lectivo=ciclo)

        materias_dict = {}
        cursos_dict = {}
        relaciones = []

        for a in asignaciones:
            materias_dict[a.materia.id] = a.materia.nombre
            cursos_dict[a.curso.id] = a.curso.nombre
            relaciones.append({
                'materiaId': a.materia.id,
                'materiaNombre': a.materia.nombre,
                'cursoId': a.curso.id,
                'cursoNombre': a.curso.nombre
            })

        return Response({
            'docenteId': docente.id,
            'docenteNombre': f"{docente.nombre} {docente.apellido}".strip(),
            'materias': [{'id': k, 'nombre': v} for k, v in materias_dict.items()],
            'cursos': [{'id': k, 'nombre': v} for k, v in cursos_dict.items()],
            'relaciones': relaciones,
            'tieneAsignaciones': asignaciones.exists()
        }, status=status.HTTP_200_OK)


class AsignacionListCreateAPIView(APIView):
    """
    Listar asignaciones horarias con filtros (GET) y crear nueva asignación con validación de superposición (POST).
    """
    def get(self, request):
        docente_id = request.query_params.get('docente_id')
        materia_id = request.query_params.get('materia_id')
        curso_id = request.query_params.get('curso_id')
        dia = request.query_params.get('dia')
        ciclo = request.query_params.get('ciclo_lectivo')

        qs = AsignacionDocente.objects.all()
        if docente_id:
            qs = qs.filter(docente_id=docente_id)
        if materia_id:
            qs = qs.filter(materia_id=materia_id)
        if curso_id:
            qs = qs.filter(curso_id=curso_id)
        if dia:
            qs = qs.filter(dia_semana=dia)
        if ciclo:
            qs = qs.filter(ciclo_lectivo=ciclo)

        serializer = AsignacionDocenteSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AsignacionDocenteSerializer(data=request.data)
        if serializer.is_valid():
            asig = serializer.save()
            return Response(AsignacionDocenteSerializer(asig).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AsignacionDetailAPIView(APIView):
    """
    Obtener (GET), editar (PUT/PATCH) o eliminar (DELETE) una asignación docente.
    """
    def get(self, request, pk):
        asig = get_object_or_404(AsignacionDocente, pk=pk)
        return Response(AsignacionDocenteSerializer(asig).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        asig = get_object_or_404(AsignacionDocente, pk=pk)
        serializer = AsignacionDocenteSerializer(asig, data=request.data)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(AsignacionDocenteSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        asig = get_object_or_404(AsignacionDocente, pk=pk)
        serializer = AsignacionDocenteSerializer(asig, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(AsignacionDocenteSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        asig = get_object_or_404(AsignacionDocente, pk=pk)
        asig.delete()
        return Response({"mensaje": "Asignación eliminada correctamente."}, status=status.HTTP_200_OK)


class MateriaListCreateAPIView(APIView):
    def get(self, request):
        materias = Materia.objects.filter(activa=True)
        return Response(MateriaSerializer(materias, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MateriaSerializer(data=request.data)
        if serializer.is_valid():
            m = serializer.save()
            return Response(MateriaSerializer(m).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CursoListCreateAPIView(APIView):
    def get(self, request):
        cursos = Curso.objects.all()
        return Response(CursoSerializer(cursos, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CursoSerializer(data=request.data)
        if serializer.is_valid():
            c = serializer.save()
            return Response(CursoSerializer(c).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfiguracionInstitucionalAPIView(APIView):
    def get(self, request):
        config = ConfiguracionInstitucional.get_config()
        return Response(ConfiguracionInstitucionalSerializer(config).data, status=status.HTTP_200_OK)

    def patch(self, request):
        config = ConfiguracionInstitucional.get_config()
        serializer = ConfiguracionInstitucionalSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
