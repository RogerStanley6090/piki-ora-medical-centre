# Piki Ora Medical Centre — Setup Instructions
## ISCG7420 Assignment 2 | Due: June 19, 2026

---

## Project Structure

```
Assignment 2/
├── backend/        ← Django REST Framework (Python)
├── frontend/       ← React + Vite (JavaScript)
└── SETUP.md        ← This file
```

---

## STEP 1 — Set Up the Backend (Django)

Open Terminal and run these commands **one by one**:

```bash
# 1. Navigate to the backend folder
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/UNITEC/SEM\ 1\ 2026/Web\ Application\ Development/Assignment\ 2/backend

# 2. Create a virtual environment (keeps packages isolated)
python3 -m venv venv

# 3. Activate the virtual environment
source venv/bin/activate

# 4. Install required packages
pip install -r requirements.txt

# 5. Create the database tables
python manage.py migrate

# 6. Load demo data (creates admin + patient user + doctors + slots)
python manage.py seed_data

# 7. Start the backend server
python manage.py runserver
```

Backend will be running at: http://localhost:8000/api/

**Demo login credentials (created by seed_data):**
- Admin:   username=`admin`    password=`admin123`
- Patient: username=`patient`  password=`patient123`

---

## STEP 2 — Set Up the Frontend (React)

Open a **NEW Terminal tab/window** (keep the backend running) and run:

```bash
# 1. Navigate to the frontend folder
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/UNITEC/SEM\ 1\ 2026/Web\ Application\ Development/Assignment\ 2/frontend

# 2. Install Node packages
npm install

# 3. Create the environment file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 4. Start the React dev server
npm run dev
```

Frontend will open at: http://localhost:5173

---

## STEP 3 — GitHub Setup

```bash
# From the Assignment 2 root folder:
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/UNITEC/SEM\ 1\ 2026/Web\ Application\ Development/Assignment\ 2

git init
git add .
git commit -m "Initial commit: Piki Ora Medical Centre full-stack app"

# Then create a repo on github.com and push:
git remote add origin https://github.com/YOUR_USERNAME/pikiora-assignment2.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up/log in with GitHub
2. Click **Add New Project** → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL` = your deployed backend URL
5. Click **Deploy**

---

## STEP 5 — Deploy Backend to Vercel (or Render)

**Recommended: Use Render (easier for Django)**
1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Set Root Directory: `backend`
4. Build command: `pip install -r requirements.txt && python manage.py migrate`
5. Start command: `gunicorn pikiora_backend.wsgi:application`
6. Add to requirements.txt: `gunicorn`

---

## Daily Development Commands

```bash
# Backend (in backend/ folder with venv active):
source venv/bin/activate
python manage.py runserver

# Frontend (in frontend/ folder):
npm run dev

# After making model changes:
python manage.py makemigrations
python manage.py migrate

# Save progress to GitHub:
git add .
git commit -m "Description of what you changed"
git push
```
