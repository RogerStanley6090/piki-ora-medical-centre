from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Doctor, AppointmentSlot, Appointment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Piki Ora Roles', {'fields': ('is_patient', 'is_admin_staff', 'phone')}),
    )


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'email', 'phone']
    search_fields = ['name', 'specialization']


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'date', 'start_time', 'end_time', 'is_available']
    list_filter = ['doctor', 'is_available', 'date']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'slot', 'status', 'created_at']
    list_filter = ['status']
