# Piki Ora Medical Centre
## ISCG7420 Assignment 2 | Django REST Framework Backend

A full-stack appointment booking system for a medical centre.

**Live URLs:**
- Backend API: https://piki-ora-medical-centre.onrender.com/api/
- Frontend: https://piki-ora-medical-centre-frontend.vercel.app

---

## Repositories

| Part | Repository |
|------|-----------|
| Backend (Django REST Framework) | https://github.com/RogerStanley6090/piki-ora-medical-centre |
| Frontend (React JS) | https://github.com/RogerStanley6090/piki-ora-medical-centre-frontend |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL (Neon) in production, SQLite locally |
| Authentication | Token-based auth (DRF TokenAuthentication) |
| Frontend | React JS (Create React App) + React Bootstrap |
| HTTP Client | Axios |
| Hosting | Render (backend) + Vercel (frontend) |

---

## Backend Project Structure

```
backend/
├── api/
│   ├── migrations/
│   ├── management/
│   │   └── commands/
│   │       └── seed_data.py     # Seeds admin + doctors + slots
│   ├── models.py                # User, Doctor, AppointmentSlot, Appointment
│   ├── serializers.py
│   ├── permissions.py           # IsAdminStaff permission class
│   ├── views.py                 # ViewSets + auth endpoints
│   └── urls.py
├── pikiora_backend/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── requirements.txt
└── manage.py
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | Public | Register new patient |
| POST | `/api/auth/login/` | Public | Login, returns token |
| POST | `/api/auth/logout/` | Token | Invalidate token |
| GET | `/api/auth/me/` | Token | Current user profile |
| GET/POST | `/api/doctors/` | Token | List doctors / create (admin) |
| GET/PUT/DELETE | `/api/doctors/{id}/` | Token | Doctor detail (write: admin) |
| GET/POST | `/api/slots/` | Token | List slots / create (admin) |
| GET/POST | `/api/appointments/` | Token | List own / book appointment |
| PATCH/DELETE | `/api/appointments/{id}/` | Token | Cancel or delete appointment |
| GET/DELETE | `/api/patients/` | Admin | Patient management |

---

## Running Locally

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Backend runs at: http://localhost:8000/api/

**Default login:** username=`admin` password=`Admin123!`

---

## Data Models

```
User (AbstractUser)
 ├── role: PATIENT | ADMIN
 └── phone: str

Doctor
 ├── name, specialization, email, phone, bio
 └── slots → AppointmentSlot[]

AppointmentSlot
 ├── doctor → Doctor
 ├── date, start_time, end_time
 └── is_available: bool

Appointment
 ├── patient → User
 ├── slot → AppointmentSlot
 ├── reason, status: CONFIRMED | CANCELLED
 └── timestamps
```

---

*ISCG7420 Web Application Development — Assignment 2 | UNITEC 2026*
