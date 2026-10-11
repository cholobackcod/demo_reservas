from django.urls import path
from .views import (
    UsuarioListCreateAPIView,
    UsuarioDetailAPIView,
    LoginAPIView,
    RegisterAPIView
)

urlpatterns = [
    path('usuarios/', UsuarioListCreateAPIView.as_view(), name='usuario-list-create'),
    path('usuarios/<int:pk>/', UsuarioDetailAPIView.as_view(), name='usuario-detail'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('auth/register/', RegisterAPIView.as_view(), name='auth-register'),
]
