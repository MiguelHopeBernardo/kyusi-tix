
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('staff', 'Staff'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
        ('alumni', 'Alumni'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('academic_affairs', 'Academic Affairs'),
        ('registrar', 'Registrar'),
        ('it', 'IT'),
        ('finance', 'Finance (Accounting)'),
        ('alumni_affairs', 'Alumni Affairs'),
        ('student_affairs', 'Student Affairs (OSAS)'),
        ('scholarship', 'Scholarship'),
        ('computer_science', 'Computer Science'),
        ('information_technology', 'Information Technology'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.CharField(max_length=100, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    # Avoid conflicts with auth.User by adding unique related_name values
    groups = models.ManyToManyField(Group, related_name="customuser_groups")
    user_permissions = models.ManyToManyField(Permission, related_name="customuser_permissions")

    def __str__(self):
        return self.email
