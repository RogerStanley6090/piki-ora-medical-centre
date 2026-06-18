from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate

from .models import User, Doctor, AppointmentSlot, Appointment
from .serializers import (
    UserRegisterSerializer, UserSerializer,
    DoctorSerializer, AppointmentSlotSerializer, AppointmentSerializer,
)
from .permissions import IsAdminStaff


# ─── Authentication ────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})
    return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ─── Doctors ───────────────────────────────────────────────────────────────

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminStaff()]


# ─── Appointment Slots ─────────────────────────────────────────────────────

class AppointmentSlotViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSlotSerializer

    def get_queryset(self):
        qs = AppointmentSlot.objects.select_related('doctor')
        doctor_id = self.request.query_params.get('doctor')
        available = self.request.query_params.get('available')
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        if available == 'true':
            qs = qs.filter(is_available=True)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminStaff()]


# ─── Appointments ──────────────────────────────────────────────────────────

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_staff:
            return Appointment.objects.all().select_related('patient', 'slot', 'slot__doctor')
        return Appointment.objects.filter(patient=user).select_related('slot', 'slot__doctor')

    def perform_create(self, serializer):
        slot = serializer.validated_data.get('slot')
        if not slot.is_available:
            raise ValidationError({'slot': 'This slot is already booked. Please choose another time.'})
        slot.is_available = False
        slot.save()
        serializer.save(patient=self.request.user, status='CONFIRMED')

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = self.request.data.get('status')
        # Free the slot when an appointment is cancelled
        if new_status == 'CANCELLED' and instance.status != 'CANCELLED':
            instance.slot.is_available = True
            instance.slot.save()
        serializer.save()

    def perform_destroy(self, instance):
        # Free the slot before deleting the appointment record
        instance.slot.is_available = True
        instance.slot.save()
        instance.delete()


# ─── Patient (User) Management — Admin only ────────────────────────────────

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role=User.Roles.PATIENT, is_superuser=False).order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminStaff]

    def perform_destroy(self, instance):
        # Free up any confirmed slots before deleting the patient
        for appt in instance.appointments.filter(status='CONFIRMED'):
            appt.slot.is_available = True
            appt.slot.save()
        instance.delete()
