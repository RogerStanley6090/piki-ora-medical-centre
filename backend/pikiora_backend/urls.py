from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('django-admin/', admin.site.urls),   # Django admin kept at non-standard URL
    path('api/', include('api.urls')),
]
