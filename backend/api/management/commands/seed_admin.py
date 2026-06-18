from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta, time
from api.models import User, Doctor, AppointmentSlot


class Command(BaseCommand):
    help = 'Seed the database with an admin user, doctors, and appointment slots'

    def handle(self, *args, **kwargs):
        # Create or reset admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@pikiora.com', 'role': 'ADMIN', 'is_superuser': True, 'is_staff': True},
        )
        admin.set_password('Admin123!')
        admin.role = 'ADMIN'
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        self.stdout.write('Admin user ready (password reset).' if not created else 'Admin user created.')

        # Create doctors
        doctors_data = [
            {
                'name': 'Sarah Johnson',
                'specialization': 'General Practice',
                'email': 'sarah.johnson@pikiora.com',
                'bio': 'Experienced GP with 15 years of practice.',
            },
            {
                'name': 'Michael Chen',
                'specialization': 'Cardiology',
                'email': 'michael.chen@pikiora.com',
                'bio': 'Specialist in heart health and cardiovascular disease.',
            },
            {
                'name': 'Aroha Williams',
                'specialization': 'Paediatrics',
                'email': 'aroha.williams@pikiora.com',
                'bio': 'Dedicated to the health and wellbeing of children.',
            },
        ]

        doctors = []
        for d in doctors_data:
            doctor, created = Doctor.objects.get_or_create(
                email=d['email'],
                defaults=d,
            )
            doctors.append(doctor)
            if created:
                self.stdout.write(f'Doctor created: Dr. {doctor.name}')

        # Create appointment slots for the next 7 days
        slot_times = [
            (time(9, 0), time(9, 30)),
            (time(9, 30), time(10, 0)),
            (time(10, 0), time(10, 30)),
            (time(10, 30), time(11, 0)),
            (time(14, 0), time(14, 30)),
            (time(14, 30), time(15, 0)),
            (time(15, 0), time(15, 30)),
        ]

        today = date.today()
        slots_created = 0
        for i in range(1, 8):
            slot_date = today + timedelta(days=i)
            if slot_date.weekday() < 5:  # Weekdays only
                for doctor in doctors:
                    for start, end in slot_times:
                        _, created = AppointmentSlot.objects.get_or_create(
                            doctor=doctor,
                            date=slot_date,
                            start_time=start,
                            defaults={'end_time': end, 'is_available': True},
                        )
                        if created:
                            slots_created += 1

        self.stdout.write(f'{slots_created} appointment slots created.')
        self.stdout.write('Seeding complete.')
