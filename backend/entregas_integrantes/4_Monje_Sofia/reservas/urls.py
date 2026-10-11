from django.urls import path
from .views import ReservaListCreateAPIView, ReservaDetailAPIView

urlpatterns = [
    path('reservas/', ReservaListCreateAPIView.as_view(), name='reserva-list-create'),
    path('reservas/<int:pk>/', ReservaDetailAPIView.as_view(), name='reserva-detail'),
    # Aliases /reservation/ and /reservations/ for Angular services compatibility
    path('reservation/', ReservaListCreateAPIView.as_view(), name='reservation-list-create'),
    path('reservation/<int:pk>/', ReservaDetailAPIView.as_view(), name='reservation-detail'),
    path('reservations/', ReservaListCreateAPIView.as_view(), name='reservations-list-create'),
    path('reservations/<int:pk>/', ReservaDetailAPIView.as_view(), name='reservations-detail'),
]
