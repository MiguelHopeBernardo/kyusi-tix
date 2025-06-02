
# Generated migration to add scholarship department

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_update_user_departments_and_roles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='department',
            field=models.CharField(
                blank=True, 
                choices=[
                    ('academic_affairs', 'Academic Affairs'), 
                    ('registrar', 'Registrar'), 
                    ('it', 'IT'), 
                    ('finance', 'Finance (Accounting)'), 
                    ('alumni_affairs', 'Alumni Affairs'), 
                    ('student_affairs', 'Student Affairs (OSAS)'), 
                    ('scholarship', 'Scholarship'), 
                    ('computer_science', 'Computer Science'), 
                    ('information_technology', 'Information Technology')
                ], 
                max_length=100, 
                null=True
            ),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrator'), 
                    ('staff', 'Staff'), 
                    ('faculty', 'Faculty'), 
                    ('student', 'Student'), 
                    ('alumni', 'Alumni')
                ], 
                default='student', 
                max_length=20
            ),
        ),
    ]
