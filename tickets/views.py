
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Ticket, TicketComment, TicketAttachment
from .forms import TicketForm, TicketUpdateForm, TicketCommentForm

@login_required
def ticket_list(request):
    # Filter tickets based on user role
    if request.user.is_staff:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(created_by=request.user)
    
    return render(request, 'tickets/ticket_list.html', {'tickets': tickets})

@login_required
def ticket_detail(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Check if user has permission to view this ticket
    if not request.user.is_staff and request.user != ticket.created_by:
        messages.error(request, "You don't have permission to view this ticket")
        return redirect('tickets:ticket_list')
    
    # Handle adding comments
    if request.method == 'POST':
        comment_form = TicketCommentForm(request.POST)
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.ticket = ticket
            new_comment.author = request.user
            new_comment.save()
            messages.success(request, 'Comment added successfully!')
            return redirect('tickets:ticket_detail', ticket_id=ticket.id)
    else:
        comment_form = TicketCommentForm()
    
    # Get all comments for this ticket
    comments = ticket.comments.all()
    
    context = {
        'ticket': ticket,
        'comments': comments,
        'comment_form': comment_form,
    }
    
    return render(request, 'tickets/ticket_detail.html', context)

@login_required
def create_ticket(request):
    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.created_by = request.user
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
            
        if form.is_valid():
            form.save()
            
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
    attachment = get_object_or_404(TicketAttachment, id=attachment_id)
    
    # Check permissions
    if not request.user.is_staff and request.user != attachment.uploaded_by:
        messages.error(request, "You don't have permission to delete this attachment")
        return redirect('tickets:ticket_detail', ticket_id=attachment.ticket.id)
    
    ticket_id = attachment.ticket.id
    attachment.file.delete()  # Delete actual file
    attachment.delete()       # Delete database record
    
    messages.success(request, 'Attachment deleted successfully!')
    return redirect('tickets:ticket_detail', ticket_id=ticket_id)
