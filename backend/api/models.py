from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extended user model for Piki Ora Medical Centre.
    Mirrors the role-based approach from Assignment 1 (accounts/models.py)
    but adapted for the DRF API layer.
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
        return self.role == self.Roles.ADMIN

    def __str__(self):
        return self.username


class Doctor(models.Model):
    """A doctor at Piki Ora Medical Centre."""
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
    """A specific time slot for a doctor's consultation."""
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
    """A confirmed booking linking a patient to an appointment slot."""
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
