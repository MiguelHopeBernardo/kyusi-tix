
# Welcome to KyusiTix Ticketing System

KyusiTix is a ticketing system built with Django and React. This repository contains both the backend (Django) and frontend (React with Vite) code.

## Project Structure

The project has the following main components:
- Django backend (tickets, users, dashboard apps)
- React frontend (in the src directory)

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL
- Node.js and npm/yarn

### Backend Setup (Django)

1. Create and activate a virtual environment:
```sh
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

2. Install Python dependencies:
```sh
pip install -r requirements.txt
```

3. Configure PostgreSQL:
   - Install PostgreSQL if not already installed
   - Create a database for the project:
```sql
CREATE DATABASE qctix;
CREATE USER postgres WITH PASSWORD 'kanekiken01';
GRANT ALL PRIVILEGES ON DATABASE kyusitix TO qctix;
```

4. Update database settings in `ticketing_system/settings.py`:
```python
DATABASES = {
   'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'qctix,
        'USER': 'postgres',  # or your PostgreSQL username
        'PASSWORD': 'kanekiken01',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

5. Run migrations and create superuser:
```sh
python manage.py migrate
python manage.py createsuperuser
```

6. Create demo users

```sh
python manage.py shell
```
```sh
from users.models import CustomUser

# Create admin user
admin_user = CustomUser.objects.create_user(
    username='admin@pupqc.edu.ph',
    email='admin@pupqc.edu.ph',
    password='password',
    first_name='Admin',
    last_name='User',
    role='admin',
    is_staff=True,
    is_superuser=True
)

# Create faculty user
faculty_user = CustomUser.objects.create_user(
    username='faculty@pupqc.edu.ph',
    email='faculty@pupqc.edu.ph',
    password='password',
    first_name='Faculty',
    last_name='Member',
    role='faculty',
    department='computer_science'
)

# Create student user
student_user = CustomUser.objects.create_user(
    username='student@pupqc.edu.ph',
    email='student@pupqc.edu.ph',
    password='password',
    first_name='Student',
    last_name='User',
    role='student',
    department='computer_science'
)

# Create alumni user
alumni_user = CustomUser.objects.create_user(
    username='alumni@pupqc.edu.ph',
    email='alumni@pupqc.edu.ph',
    password='password',
    first_name='Alumni',
    last_name='User',
    role='alumni'
)

print("Demo users created successfully!")
exit()
```


7. Run the Django development server:
```sh
python manage.py runserver
```


### Frontend Setup (React/Vite)

1. Install Node.js dependencies:
```sh
npm install
```

2. Run the Vite development server:
```sh
npm run dev
```

## Deployment

### Option 1: Deploy Django Backend to PythonAnywhere
1. Create a PythonAnywhere account and set up a web app
2. Upload the code via Git or manual upload
3. Set up a virtual environment and install dependencies
4. Configure the database (PostgreSQL)
5. Update ALLOWED_HOSTS and other settings for production
6. Collect static files: `python manage.py collectstatic`

### Option 2: Deploy to Heroku
1. Install the Heroku CLI
2. Create a Procfile in the project root:
```
web: gunicorn ticketing_system.wsgi
```
3. Add necessary Heroku configuration settings
4. Deploy using Git:
```sh
heroku create your-app-name
git push heroku main
```

## Project URLs
- Admin interface: http://localhost:8000/admin/
- Login page: http://localhost:8000/login/
- Dashboard: http://localhost:8000/dashboard/
- Tickets: http://localhost:8000/tickets/
