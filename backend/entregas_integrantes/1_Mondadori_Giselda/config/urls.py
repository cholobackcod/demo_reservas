from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Endpoints REST Nomenclatura v1
    path('api/v1/', include('usuarios.urls')),
    path('api/v1/', include('salas.urls')),
    path('api/v1/', include('reservas.urls')),
    path('api/v1/', include('reportes.urls')),

    # Direct compatibility fallback endpoints for existing frontend URLs if requested without /v1/
    path('api/', include('usuarios.urls')),
    path('api/', include('salas.urls')),
    path('api/', include('reservas.urls')),
    path('api/', include('reportes.urls')),
]
