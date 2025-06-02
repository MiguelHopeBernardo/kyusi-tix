
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up the database with all necessary tables and initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Create a superuser after setting up tables',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database setup...'))
        
        # Check database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(self.style.SUCCESS('✓ Database connection successful'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Database connection failed: {e}'))
            return
        
        # Run migrations
        self.stdout.write('Running migrations...')
        try:
            call_command('makemigrations', 'users', verbosity=1)
            call_command('makemigrations', 'tickets', verbosity=1)
            call_command('migrate', verbosity=1)
            self.stdout.write(self.style.SUCCESS('✓ Migrations completed successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Migration failed: {e}'))
            return
        
        # Create superuser if requested
        if options['create_superuser']:
            self.create_superuser()
        
        self.stdout.write(self.style.SUCCESS('Database setup completed successfully!'))
        self.stdout.write('You can now:')
        self.stdout.write('1. Start the Django server: python manage.py runserver')
        self.stdout.write('2. Access the admin panel at: http://localhost:8000/admin')

    def create_superuser(self):
        self.stdout.write('Creating superuser...')
        try:
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser(
                    username='admin',
                    email='admin@qctix.local',
                    password='admin123',
                    first_name='Admin',
                    last_name='User',
                    role='admin'
                )
                self.stdout.write(self.style.SUCCESS('✓ Superuser created successfully'))
                self.stdout.write('Username: admin')
                self.stdout.write('Password: admin123')
                self.stdout.write('Email: admin@qctix.local')
            else:
                self.stdout.write(self.style.WARNING('Superuser already exists'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Failed to create superuser: {e}'))
