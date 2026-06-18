"""
Management command to populate the database with demo data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, timedelta
from api.models import User, Doctor, AppointmentSlot


class Command(BaseCommand):
    help = 'Seeds the database with demo doctors, slots, and users'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # ── Admin user ──────────────────────────────────────────────────────
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@pikiora.co.nz',
                password='admin123',
                first_name='Admin',
                last_name='Staff',
                role=User.Roles.ADMIN,
            )
            self.stdout.write(self.style.SUCCESS('  Created admin user (admin / admin123)'))

        # ── Test patient ────────────────────────────────────────────────────
        if not User.objects.filter(username='patient').exists():
            User.objects.create_user(
                username='patient',
                email='patient@example.com',
                password='patient123',
                first_name='John',
                last_name='Doe',
                phone='021 000 0000',
                role=User.Roles.PATIENT,
            )
            self.stdout.write(self.style.SUCCESS('  Created patient user (patient / patient123)'))

        # ── Doctors ─────────────────────────────────────────────────────────
        doctors_data = [
            {'name': 'Sarah Mitchell', 'specialization': 'General Practice', 'email': 'smitchell@pikiora.co.nz', 'phone': '09 111 1001', 'bio': 'Dr Mitchell has 15 years of experience in general practice and preventive care.'},
            {'name': 'James Taufa',    'specialization': 'Cardiology',       'email': 'jtaufa@pikiora.co.nz',    'phone': '09 111 1002', 'bio': 'Specialist cardiologist with expertise in heart disease management.'},
            {'name': 'Aroha Ngata',    'specialization': 'Paediatrics',      'email': 'angata@pikiora.co.nz',    'phone': '09 111 1003', 'bio': 'Dedicated to children\'s health from infancy through adolescence.'},
        ]
        doctors = []
        for d in doctors_data:
            doc, created = Doctor.objects.get_or_create(email=d['email'], defaults=d)
            doctors.append(doc)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created doctor: Dr. {doc.name}'))

        # ── Appointment Slots ───────────────────────────────────────────────
        today = date.today()
        slot_times = [
            (time(9, 0),  time(9, 30)),
            (time(9, 30), time(10, 0)),
            (time(10, 0), time(10, 30)),
            (time(10, 30),time(11, 0)),
            (time(14, 0), time(14, 30)),
            (time(14, 30),time(15, 0)),
        ]
        slots_created = 0
        for doctor in doctors:
            for day_offset in range(1, 8):  # next 7 days
                slot_date = today + timedelta(days=day_offset)
                if slot_date.weekday() >= 5:  # skip weekends
                    continue
                for start, end in slot_times:
                    _, created = AppointmentSlot.objects.get_or_create(
                        doctor=doctor,
                        date=slot_date,
                        start_time=start,
                        defaults={'end_time': end, 'is_available': True},
                    )
                    if created:
                        slots_created += 1

        self.stdout.write(self.style.SUCCESS(f'  Created {slots_created} appointment slots'))
        self.stdout.write(self.style.SUCCESS('\nSeeding complete!'))
        self.stdout.write('')
        self.stdout.write('  Login credentials:')
        self.stdout.write('    Admin   → username: admin    password: admin123')
        self.stdout.write('    Patient → username: patient  password: patient123')
