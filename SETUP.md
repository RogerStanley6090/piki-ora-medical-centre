# Piki Ora Medical Centre — Setup Instructions
## ISCG7420 Assignment 2

---

## Project Structure

This project has two separate GitHub repositories:

- **Backend** (Django REST Framework): https://github.com/RogerStanley6090/piki-ora-medical-centre
- **Frontend** (React JS): https://github.com/RogerStanley6090/piki-ora-medical-centre-frontend

---

## STEP 1 — Set Up the Backend (Django)

Open Terminal and run these commands one by one:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create a virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
source venv/bin/activate

# 4. Install required packages
pip install -r requirements.txt

# 5. Create the database tables
python manage.py migrate

# 6. Load demo data (creates admin + doctors + slots)
python manage.py seed_data

# 7. Start the backend server
python manage.py runserver
```

Backend will be running at: http://localhost:8000/api/

**Demo login credentials:**
- Admin: username=`admin` password=`Admin123!`

---

## STEP 2 — Set Up the Frontend (React)

The frontend is in a separate repository. Clone it first:

```bash
git clone https://github.com/RogerStanley6090/piki-ora-medical-centre-frontend.git
cd piki-ora-medical-centre-frontend
npm install
npm start
```

Frontend will open at: http://localhost:3000

---

## Deployed URLs

- Backend: https://piki-ora-medical-centre.onrender.com/api/
- Frontend: https://piki-ora-medical-centre-frontend.vercel.app
