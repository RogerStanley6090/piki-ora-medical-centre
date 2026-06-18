from rest_framework import serializers
from .models import User, Doctor, AppointmentSlot, Appointment


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Handles patient self-registration (POST /api/auth/register/).
    Validates that both password fields match, then creates the user
    with a hashed password and role=PATIENT.
    write_only=True ensures passwords are never returned in responses.
    """
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # hashes the password — never store plain text
        user.role = User.Roles.PATIENT   # all self-registered users are patients
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only user representation returned after login and at /api/auth/me/.
    is_patient and is_admin_staff are @property methods on the model —
    they must be declared explicitly for DRF to include them in the response.
    The React frontend uses is_admin_staff to decide which nav/routes to show.
    """
    is_patient = serializers.BooleanField(read_only=True)
    is_admin_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'is_admin_staff', 'is_patient',
        ]


class DoctorSerializer(serializers.ModelSerializer):
    """
    Serializer for the Doctor model.
    Adds two computed fields using SerializerMethodField:
      - slot_count: total number of slots for this doctor
      - available_slots: slots that are still open for booking
    These are displayed on the Doctors page to help patients choose.
    """
    slot_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()

    def get_slot_count(self, obj):
        return obj.slots.count()

    def get_available_slots(self, obj):
        return obj.slots.filter(is_available=True).count()

    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'email', 'phone', 'bio', 'slot_count', 'available_slots', 'created_at']


class AppointmentSlotSerializer(serializers.ModelSerializer):
    """
    Serializer for AppointmentSlot.
    Flattens the doctor FK into doctor_name and doctor_specialization
    so the frontend can display slot info without a second API call.
    """
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)

    class Meta:
        model = AppointmentSlot
        fields = ['id', 'doctor', 'doctor_name', 'doctor_specialization', 'date', 'start_time', 'end_time', 'is_available']


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Appointment.
    Nests slot_details (full slot + doctor info) for read operations,
    while still accepting a plain slot ID for write operations.
    patient is set automatically in the view (perform_create), so it is
    read-only here to prevent patients from booking on behalf of others.
    """
    slot_details = AppointmentSlotSerializer(source='slot', read_only=True)
    patient_name = serializers.SerializerMethodField()
    patient_username = serializers.CharField(source='patient.username', read_only=True)

    def get_patient_name(self, obj):
        """Returns full name if available, otherwise falls back to username."""
        full_name = obj.patient.get_full_name()
        return full_name.strip() if full_name.strip() else obj.patient.username

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_username',
            'slot', 'slot_details', 'reason', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['patient', 'created_at', 'updated_at']
