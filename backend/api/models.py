from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Adds a role field (PATIENT or ADMIN) and an optional phone number.
    Using AUTH_USER_MODEL = 'api.User' in settings ensures Django uses this
    model throughout — including for authentication and the admin site.

    The is_admin_staff property is used by the React frontend and the
    IsAdminStaff permission class to gate admin-only views.
    """

    class Roles(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        ADMIN = 'ADMIN', 'Admin Staff'

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.PATIENT,
    )
    phone = models.CharField(max_length=20, blank=True)

    @property
    def is_patient(self):
        return self.role == self.Roles.PATIENT

    @property
    def is_admin_staff(self):
        """Used by ProtectedRoute (adminOnly) and IsAdminStaff permission."""
        return self.role == self.Roles.ADMIN

    def __str__(self):
        return self.username


class Doctor(models.Model):
    """
    Represents a doctor at Piki Ora Medical Centre.

    Doctors are created by admin staff via the ManageDoctors page.
    Each doctor can have multiple AppointmentSlots assigned to them.
    """
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"


class AppointmentSlot(models.Model):
    """
    A specific time slot for a doctor on a given date.

    Slots are created by admin staff via the ManageSlots page.
    The is_available flag is set to False when a patient books the slot,
    and restored to True when the appointment is cancelled or deleted.
    unique_together ensures no double-booking for the same doctor/date/time.
    """
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.doctor.name} — {self.date} {self.start_time}"


class Appointment(models.Model):
    """
    A booking record linking a patient to a specific AppointmentSlot.

    Uses a OneToOneField on slot to enforce one appointment per slot.
    When an appointment is cancelled or deleted, the view logic sets
    slot.is_available = True so the slot can be rebooked by another patient.
    """
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    slot = models.OneToOneField(AppointmentSlot, on_delete=models.CASCADE, related_name='appointment')
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} → {self.slot}"
