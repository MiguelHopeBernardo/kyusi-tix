from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Ticket, TicketComment, TicketAttachment
from .forms import TicketForm, TicketUpdateForm, TicketCommentForm
from .routing import TicketRouter
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@login_required
def ticket_list(request):
    # ... keep existing code
    
@login_required
def ticket_detail(request, ticket_id):
    # ... keep existing code

@login_required
def create_ticket(request):
    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.created_by = request.user
            
            # Auto-assign using the ticket router
            if not request.user.is_staff:  # Staff can override assignments
                department, assigned_user = TicketRouter.route_ticket(ticket)
                if department:
                    ticket.department = department
                if assigned_user:
                    ticket.assigned_to = assigned_user
                    # Set status to in_progress if assigned
                    ticket.status = 'in_progress'
                    messages.info(request, f'Ticket automatically assigned to {assigned_user.username}.')
            
            ticket.save()
            
            # Handle file attachments
            files = request.FILES.getlist('attachments')
            for file in files:
                # Check file type
                if not file.content_type in ['image/jpeg', 'image/png', 'application/pdf']:
                    continue
                
                # Create attachment
                attachment = TicketAttachment(
                    ticket=ticket,
                    file=file,
                    filename=file.name,
                    file_type=file.content_type,
                    file_size=file.size,
                    uploaded_by=request.user
                )
                attachment.save()
            
            messages.success(request, 'Ticket created successfully!')
            return redirect('tickets:ticket_detail', ticket_id=ticket.id)
    else:
        form = TicketForm()
    
    return render(request, 'tickets/create_ticket.html', {'form': form})

@login_required
def update_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Check if user has permission to update this ticket
    if not request.user.is_staff and request.user != ticket.created_by:
        messages.error(request, "You don't have permission to update this ticket")
        return redirect('tickets:ticket_list')
    
    if request.method == 'POST':
        # Staff can update more fields than regular users
        if request.user.is_staff:
            form = TicketUpdateForm(request.POST, instance=ticket)
        else:
            form = TicketForm(request.POST, instance=ticket)
        
        old_assigned_to = ticket.assigned_to
        old_department = ticket.department
            
        if form.is_valid():
            # Save without committing to check for changes
            updated_ticket = form.save(commit=False)
            
            # If non-admin user is updating and significant fields changed
            # re-route the ticket unless admin assigned it manually
            if (not request.user.is_staff and 
                (ticket.subject != updated_ticket.subject or 
                 ticket.description != updated_ticket.description or
                 ticket.priority != updated_ticket.priority) and
                ticket.assigned_to is None):
                
                department, assigned_user = TicketRouter.route_ticket(updated_ticket)
                if department:
                    updated_ticket.department = department
                if assigned_user:
                    updated_ticket.assigned_to = assigned_user
                    updated_ticket.status = 'in_progress'
                    messages.info(request, f'Ticket reassigned to {assigned_user.username} based on your changes.')
            
            updated_ticket.save()
            
            # If admin manually changed assignment, log it
            if request.user.is_staff:
                if old_assigned_to != updated_ticket.assigned_to:
                    new_assignee = updated_ticket.assigned_to.username if updated_ticket.assigned_to else "no one"
                    old_assignee = old_assigned_to.username if old_assigned_to else "no one"
                    
                    comment = TicketComment(
                        ticket=ticket,
                        author=request.user,
                        content=f"Changed assignment from {old_assignee} to {new_assignee}."
                    )
                    comment.save()
                
                if old_department != updated_ticket.department:
                    comment = TicketComment(
                        ticket=ticket,
                        author=request.user,
                        content=f"Changed department from {old_department or 'None'} to {updated_ticket.department or 'None'}."
                    )
                    comment.save()
            
            # Handle file attachments
            files = request.FILES.getlist('attachments')
            for file in files:
                # Check file type
                if not file.content_type in ['image/jpeg', 'image/png', 'application/pdf']:
                    continue
                
                # Create attachment
                attachment = TicketAttachment(
                    ticket=ticket,
                    file=file,
                    filename=file.name,
                    file_type=file.content_type,
                    file_size=file.size,
                    uploaded_by=request.user
                )
                attachment.save()
                
            messages.success(request, 'Ticket updated successfully!')
            return redirect('tickets:ticket_detail', ticket_id=ticket.id)
    else:
        # Staff can update more fields than regular users
        if request.user.is_staff:
            form = TicketUpdateForm(instance=ticket)
        else:
            form = TicketForm(instance=ticket)
    
    return render(request, 'tickets/update_ticket.html', {'form': form, 'ticket': ticket})

@login_required
def delete_attachment(request, attachment_id):
    # ... keep existing code

@login_required
@require_POST
def reroute_ticket(request, ticket_id):
    """
    Re-analyze and route a ticket.
    Only accessible to admins.
    """
    if not request.user.is_staff:
        return JsonResponse({
            'success': False,
            'message': 'Only administrators can manually re-route tickets.'
        }, status=403)
    
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Save old values for comparison
    old_department = ticket.department
    old_assigned_to = ticket.assigned_to
    
    # Get new assignments from router
    department, assigned_user = TicketRouter.route_ticket(ticket)
    
    # Apply changes
    has_changes = False
    
    if department and department != old_department:
        ticket.department = department
        has_changes = True
    
    if assigned_user and assigned_user != old_assigned_to:
        ticket.assigned_to = assigned_user
        has_changes = True
        # If assigned, mark as in-progress
        if ticket.status == 'open':
            ticket.status = 'in_progress'
    
    # Only save if there were changes
    if has_changes:
        ticket.save()
        
        # Add a comment about the re-routing
        comment = TicketComment(
            ticket=ticket,
            author=request.user,
            content=f"Ticket was re-routed to department: {department or 'None'}, assignee: {assigned_user.username if assigned_user else 'None'}."
        )
        comment.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Ticket successfully re-routed.',
            'department': department or '',
            'assignee': assigned_user.username if assigned_user else ''
        })
    else:
        return JsonResponse({
            'success': True,
            'message': 'No routing changes were necessary.'
        })
