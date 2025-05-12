
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tickets.models import Ticket
from django.db.models import Count

@login_required
def dashboard_view(request):
    # Get ticket statistics based on user role
    if request.user.is_staff:
        open_tickets = Ticket.objects.filter(status='open').count()
        in_progress_tickets = Ticket.objects.filter(status='in_progress').count()
        resolved_tickets = Ticket.objects.filter(status__in=['resolved', 'closed']).count()
        
        # Get latest tickets for staff (admins)
        latest_tickets = Ticket.objects.all().order_by('-created_at')[:5]
    else:
        # Regular users only see their own tickets
        open_tickets = Ticket.objects.filter(created_by=request.user, status='open').count()
        in_progress_tickets = Ticket.objects.filter(created_by=request.user, status='in_progress').count()
        resolved_tickets = Ticket.objects.filter(created_by=request.user, 
                                               status__in=['resolved', 'closed']).count()
        
        # Get user's latest tickets
        latest_tickets = Ticket.objects.filter(created_by=request.user).order_by('-created_at')[:5]
    
    context = {
        'title': 'Dashboard',
        'open_tickets': open_tickets,
        'in_progress_tickets': in_progress_tickets,
        'resolved_tickets': resolved_tickets,
        'latest_tickets': latest_tickets,
    }
    return render(request, 'dashboard/dashboard.html', context)
