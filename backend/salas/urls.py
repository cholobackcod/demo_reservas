from django.urls import path
from .views import SalaListCreateAPIView, SalaDetailAPIView

urlpatterns = [
    path('salas/', SalaListCreateAPIView.as_view(), name='sala-list-create'),
    path('salas/<int:pk>/', SalaDetailAPIView.as_view(), name='sala-detail'),
    # Alias /labs/ for Angular frontend backward compatibility
    path('labs/', SalaListCreateAPIView.as_view(), name='lab-list-create'),
    path('labs/<int:pk>/', SalaDetailAPIView.as_view(), name='lab-detail'),
]
