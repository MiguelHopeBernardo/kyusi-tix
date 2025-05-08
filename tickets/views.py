
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Ticket

@login_required
def ticket_list(request):
    tickets = Ticket.objects.all()
    return render(request, 'tickets/ticket_list.html', {'tickets': tickets})

@login_required
def ticket_detail(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    return render(request, 'tickets/ticket_detail.html', {'ticket': ticket})

@login_required
def create_ticket(request):
    # Ticket creation logic will go here
    return render(request, 'tickets/create_ticket.html')

@login_required
def update_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    # Ticket update logic will go here
    return render(request, 'tickets/update_ticket.html', {'ticket': ticket})
