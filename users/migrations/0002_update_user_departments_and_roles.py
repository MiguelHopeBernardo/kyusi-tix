
# Generated migration for user model updates

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrator'),
                    ('staff', 'Staff'),
                    ('faculty', 'Faculty'),
                    ('student', 'Student'),
                    ('alumni', 'Alumni'),
                ],
                default='student',
                max_length=20
            ),
        ),
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
                    ('computer_science', 'Computer Science'),
                    ('information_technology', 'Information Technology'),
                ],
                max_length=100,
                null=True
            ),
        ),
    ]
