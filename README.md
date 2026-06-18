# 🏥 Piki Ora Medical Centre

A full-stack appointment booking system for a medical centre, built with Django REST Framework and React.

**Live Demo:**
- 🌐 **Frontend:** https://piki-ora-medical-centre-orcin.vercel.app
- ⚙️ **Backend API:** https://piki-ora-medical-centre.onrender.com/api/

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL (Neon) in production, SQLite locally |
| Authentication | Token-based auth (DRF `TokenAuthentication`) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Hosting | Render (backend) + Vercel (frontend) |

---

## Features

### Patient
- Register and log in
- Browse available doctors and their specialisations
- Book appointment slots
- View, track, and cancel upcoming appointments

### Admin Staff
- Full dashboard with stats
- Manage doctors (add, edit, delete)
- Manage appointment slots (create time slots per doctor)
- View and manage all appointments
- View and manage patient records

---

## Project Structure

```
piki-ora-medical-centre/
├── backend/
│   ├── api/
│   │   ├── migrations/          # Database migrations
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_admin.py  # Seeds admin user + doctors + slots
│   │   ├── models.py            # User, Doctor, AppointmentSlot, Appointment
│   │   ├── serializers.py       # DRF serializers
│   │   ├── permissions.py       # IsAdminStaff permission class
│   │   ├── views.py             # ViewSets + auth endpoints
│   │   └── urls.py              # API URL routing
│   ├── pikiora_backend/
│   │   ├── settings.py          # Django settings (env-based config)
│   │   ├── urls.py              # Root URL config
│   │   └── wsgi.py
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance with token injection
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state (login/logout/register)
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation + dark/light theme toggle
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx
    │   │   ├── Doctors.jsx      # Browse & book appointments
    │   │   ├── MyAppointments.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── ManageDoctors.jsx
    │   │       ├── ManageSlots.jsx
    │   │       ├── ManageAppointments.jsx
    │   │       └── ManagePatients.jsx
    │   ├── App.jsx              # Route definitions
    │   ├── main.jsx
    │   └── index.css            # Dark/light theme CSS variables + layout
    ├── index.html
    ├── package.json
    └── vite.config.js
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
| GET/PUT/DELETE | `/api/appointments/{id}/` | Token | Appointment detail |
| GET/DELETE | `/api/patients/` | Admin | Patient management |

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit .env if needed
python manage.py migrate
python manage.py seed_admin     # Creates admin + doctors + slots
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # Set VITE_API_URL=http://localhost:8000/api
npm run dev
```

### Default Credentials (after seeding)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123!` |
| Patient | Register via the app | — |

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
 ├── slot → AppointmentSlot (OneToOne)
 ├── reason, status: CONFIRMED | CANCELLED
 └── timestamps
```

---

## Authentication Flow

1. User logs in → backend returns a DRF `Token`
2. Token stored in `localStorage`
3. Axios interceptor attaches `Authorization: Token <key>` to every request
4. Backend `TokenAuthentication` validates the token on protected endpoints
5. `IsAdminStaff` permission class restricts write operations to admin users

---

## Deployment

- **Backend** hosted on [Render](https://render.com) — `gunicorn` WSGI server
- **Database** on [Neon](https://neon.tech) — serverless PostgreSQL
- **Frontend** hosted on [Vercel](https://vercel.com) — Vite static build
- Environment variables managed via Render and Vercel dashboards

---

*ISCG7420 Web Application Development — Assignment 2 | UNITEC 2026*
