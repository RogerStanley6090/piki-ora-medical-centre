from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('doctors', views.DoctorViewSet, basename='doctor')
router.register('slots', views.AppointmentSlotViewSet, basename='slot')
router.register('appointments', views.AppointmentViewSet, basename='appointment')
router.register('patients', views.UserManagementViewSet, basename='patient')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
]
