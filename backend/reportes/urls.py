from django.urls import path
from .views import ReportesAPIView

urlpatterns = [
    path('reportes/', ReportesAPIView.as_view(), name='reportes'),
]
