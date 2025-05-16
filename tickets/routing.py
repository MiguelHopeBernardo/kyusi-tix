
"""
Ticket routing system to automatically assign tickets to departments and users
based on predefined rules.
"""
from django.conf import settings
from django.db.models import Q
from users.models import CustomUser
from .models import Ticket

class TicketRouter:
    """
    Rule-based router for assigning tickets to appropriate departments and users.
    """

    @staticmethod
    def route_ticket(ticket):
        """
        Analyzes a ticket and assigns it to the appropriate department and/or user
        based on predefined rules.
        
        Args:
            ticket: The Ticket instance to be routed
            
        Returns:
            tuple: (assigned_department, assigned_user)
        """
        # Initialize with None values (no assignment)
        assigned_department = None
        assigned_user = None
        
        # Convert description to lowercase for case-insensitive matching
        description_lower = ticket.description.lower()
        subject_lower = ticket.subject.lower()
        
        # Rule 1: Enrollment-related issues go to Registrar
        if (ticket.department == 'Registrar' or 
            'enroll' in description_lower or 
            'registration' in description_lower or
            'enroll' in subject_lower):
            assigned_department = 'Registrar'
            # Try to find a staff member in Registrar department
            staff_user = CustomUser.objects.filter(
                department='Registrar', 
                role__in=['staff', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
        
        # Rule 2: Grade-related issues go to Academic Affairs
        elif ('grade' in description_lower or 
              'grades' in description_lower or
              'academic' in description_lower or
              'class' in description_lower):
            assigned_department = 'Academic Affairs'
            # Try to find faculty or staff in Academic Affairs department
            staff_user = CustomUser.objects.filter(
                department='Academic Affairs', 
                role__in=['faculty', 'staff', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
        
        # Rule 3: IT problems
        elif ('password' in description_lower or 
              'login' in description_lower or
              'account' in description_lower or
              'system' in description_lower or
              'technical' in description_lower or
              'error' in description_lower):
            assigned_department = 'IT'
            # Try to find IT staff
            staff_user = CustomUser.objects.filter(
                department='IT', 
                role__in=['staff', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
        
        # Rule 4: Financial concerns
        elif ('payment' in description_lower or 
              'fee' in description_lower or
              'tuition' in description_lower or
              'financial' in description_lower or
              'money' in description_lower):
            assigned_department = 'Finance'
            # Try to find Finance staff
            staff_user = CustomUser.objects.filter(
                department='Finance', 
                role__in=['staff', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
                
        # Rule 5: Alumni-specific
        elif ticket.created_by.role == 'alumni':
            if ('transcript' in description_lower or 
                'certificate' in description_lower or
                'diploma' in description_lower):
                assigned_department = 'Alumni Affairs'
                # Try to find Alumni Affairs staff
                staff_user = CustomUser.objects.filter(
                    department='Alumni Affairs', 
                    role__in=['staff', 'admin']
                ).first()
                if staff_user:
                    assigned_user = staff_user
        
        # Rule 6: Student welfare and concerns
        elif ('counseling' in description_lower or 
              'welfare' in description_lower or
              'assistance' in description_lower or
              'help' in description_lower):
            assigned_department = 'Student Affairs'
            # Try to find Student Affairs staff
            staff_user = CustomUser.objects.filter(
                department='Student Affairs', 
                role__in=['staff', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
        
        # Fallback to the ticket's department if specified
        elif ticket.department:
            assigned_department = ticket.department
            # Find any staff in this department
            staff_user = CustomUser.objects.filter(
                department=ticket.department, 
                role__in=['staff', 'faculty', 'admin']
            ).first()
            if staff_user:
                assigned_user = staff_user
        
        # If no rules matched and no assignments were made
        # Assign to a random admin or staff as a fallback
        if not assigned_user:
            fallback_user = CustomUser.objects.filter(
                role__in=['admin', 'staff']
            ).first()
            
            if fallback_user:
                assigned_user = fallback_user
                if not assigned_department:
                    assigned_department = fallback_user.department
        
        return assigned_department, assigned_user
