
"""
Ticket routing system to automatically assign tickets to departments and users
based on predefined rules.
"""
from django.conf import settings
from django.db.models import Q
from users.models import CustomUser
from .models import Ticket
import re

class TicketRouter:
    """
    Rule-based router for assigning tickets to appropriate departments and users.
    """
    
    # Define routing rules based on keywords and content
    ROUTING_RULES = {
        'IT': {
            'keywords': [
                'password', 'login', 'portal', 'system', 'network', 'computer',
                'internet', 'wifi', 'email', 'account', 'access', 'website',
                'technology', 'software', 'hardware', 'server', 'database'
            ],
            'department': 'IT'
        },
        'Academic Affairs': {
            'keywords': [
                'grade', 'academic', 'course', 'curriculum', 'transcript',
                'enrollment', 'class', 'schedule', 'professor', 'instructor',
                'exam', 'assignment', 'study', 'academic record'
            ],
            'department': 'Academic Affairs'
        },
        'Registrar': {
            'keywords': [
                'registration', 'transcript', 'certificate', 'diploma',
                'enrollment', 'records', 'official document', 'verification',
                'certification', 'student record'
            ],
            'department': 'Registrar'
        },
        'Finance (Accounting)': {
            'keywords': [
                'tuition', 'payment', 'fee', 'billing', 'invoice', 'receipt',
                'financial', 'money', 'scholarship', 'financial aid',
                'accounting', 'refund'
            ],
            'department': 'Finance (Accounting)'
        },
        'Student Affairs (OSAS)': {
            'keywords': [
                'student life', 'organization', 'club', 'event', 'activity',
                'counseling', 'guidance', 'discipline', 'student services',
                'extracurricular', 'student affairs'
            ],
            'department': 'Student Affairs (OSAS)'
        },
        'Alumni Affairs': {
            'keywords': [
                'alumni', 'graduate', 'alumni database', 'alumni update',
                'alumni contact', 'alumni information'
            ],
            'department': 'Alumni Affairs'
        },
        'Scholarship': {
            'keywords': [
                'scholarship', 'financial aid', 'grant', 'scholarship application',
                'scholarship requirements', 'scholarship status'
            ],
            'department': 'Scholarship'
        }
    }
    
    @classmethod
    def route_ticket(cls, ticket):
        """
        Analyze ticket content and return recommended department and assignee.
        Returns tuple: (department, assigned_user)
        """
        content = f"{ticket.subject} {ticket.description}".lower()
        
        # Score each department based on keyword matches
        department_scores = {}
        
        for dept_name, rules in cls.ROUTING_RULES.items():
            score = 0
            for keyword in rules['keywords']:
                # Count occurrences of each keyword
                score += len(re.findall(r'\b' + re.escape(keyword) + r'\b', content))
            
            if score > 0:
                department_scores[dept_name] = score
        
        # Get the department with the highest score
        if department_scores:
            best_department = max(department_scores, key=department_scores.get)
            
            # Find an available user in that department
            assigned_user = cls._find_assignee(best_department, ticket.priority)
            
            return best_department, assigned_user
        
        # Default to IT if no matches found
        return 'IT', cls._find_assignee('IT', ticket.priority)
    
    @classmethod
    def _find_assignee(cls, department, priority='medium'):
        """
        Find the best assignee in the given department.
        Prioritizes faculty/staff members and considers workload.
        """
        # Get users in the department
        users = CustomUser.objects.filter(
            department=department,
            is_active=True
        ).exclude(role='student')  # Exclude students from assignment
        
        if not users.exists():
            # Fallback to admin users if no department staff found
            users = CustomUser.objects.filter(
                is_staff=True,
                is_active=True
            )
        
        if not users.exists():
            return None
        
        # For urgent tickets, prefer admin users
        if priority == 'urgent':
            admin_users = users.filter(is_staff=True)
            if admin_users.exists():
                users = admin_users
        
        # Simple round-robin assignment based on current ticket count
        # In a real system, you might want more sophisticated load balancing
        user_workloads = []
        for user in users:
            active_tickets = user.assigned_tickets.filter(
                status__in=['open', 'in_progress']
            ).count()
            user_workloads.append((user, active_tickets))
        
        # Sort by workload (ascending) and return user with least active tickets
        user_workloads.sort(key=lambda x: x[1])
        return user_workloads[0][0] if user_workloads else None
