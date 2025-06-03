
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Ticket, TicketComment, TicketAttachment
from .forms import TicketForm, TicketUpdateForm, TicketCommentForm
from .routing import TicketRouter
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.utils.html import escape
from django.core.paginator import Paginator
from django.db.models import Q, Count
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from datetime import datetime, timedelta

@login_required
def ticket_list(request):
    tickets = Ticket.objects.all()
    return render(request, 'tickets/ticket_list.html', {'tickets': tickets})

@login_required
def get_tickets_api(request):
    """
    API endpoint to get tickets with filtering and pagination
    """
    # Get query parameters
    status = request.GET.get('status', '')
    priority = request.GET.get('priority', '')
    department = request.GET.get('department', '')
    assigned_to_me = request.GET.get('assigned_to_me', 'false').lower() == 'true'
    my_tickets = request.GET.get('my_tickets', 'false').lower() == 'true'
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 20))
    
    # Start with base queryset
    tickets = Ticket.objects.all()
    
    # Apply filters based on user role
    if not request.user.is_staff:
        # Regular users only see their own tickets or tickets assigned to them
        tickets = tickets.filter(
            Q(created_by=request.user) | Q(assigned_to=request.user)
        )
    
    # Apply additional filters
    if status:
        tickets = tickets.filter(status=status)
    if priority:
        tickets = tickets.filter(priority=priority)
    if department:
        tickets = tickets.filter(department=department)
    if assigned_to_me:
        tickets = tickets.filter(assigned_to=request.user)
    if my_tickets:
        tickets = tickets.filter(created_by=request.user)
    
    # Order by creation date (newest first)
    tickets = tickets.order_by('-created_at')
    
    # Paginate
    paginator = Paginator(tickets, per_page)
    page_obj = paginator.get_page(page)
    
    # Serialize tickets
    tickets_data = []
    for ticket in page_obj:
        tickets_data.append({
            'id': ticket.id,
            'subject': ticket.subject,
            'description': ticket.description,
            'status': ticket.status,
            'priority': ticket.priority,
            'department': ticket.department,
            'created_by': ticket.created_by.username,
            'assigned_to': ticket.assigned_to.username if ticket.assigned_to else None,
            'created_at': ticket.created_at.isoformat(),
            'updated_at': ticket.updated_at.isoformat(),
            'comments_count': ticket.comments.count(),
            'attachments_count': ticket.attachments.count(),
        })
    
    return JsonResponse({
        'tickets': tickets_data,
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }
    })

@login_required
def get_ticket_stats_api(request):
    """
    API endpoint to get ticket statistics
    """
    if request.user.is_staff:
        # Admin stats - all tickets
        stats = {
            'open': Ticket.objects.filter(status='open').count(),
            'in_progress': Ticket.objects.filter(status='in_progress').count(),
            'on_hold': Ticket.objects.filter(status='on_hold').count(),
            'resolved': Ticket.objects.filter(status='resolved').count(),
            'closed': Ticket.objects.filter(status='closed').count(),
            'urgent': Ticket.objects.filter(priority='urgent', status__in=['open', 'in_progress']).count(),
            'total': Ticket.objects.count(),
        }
        
        # Recent activity
        today = timezone.now().date()
        stats['created_today'] = Ticket.objects.filter(created_at__date=today).count()
        stats['resolved_today'] = Ticket.objects.filter(
            status='resolved', 
            updated_at__date=today
        ).count()
        
    else:
        # User stats - only their tickets
        user_tickets = Ticket.objects.filter(
            Q(created_by=request.user) | Q(assigned_to=request.user)
        )
        
        stats = {
            'open': user_tickets.filter(status='open').count(),
            'in_progress': user_tickets.filter(status='in_progress').count(),
            'on_hold': user_tickets.filter(status='on_hold').count(),
            'resolved': user_tickets.filter(status='resolved').count(),
            'closed': user_tickets.filter(status='closed').count(),
            'urgent': user_tickets.filter(priority='urgent', status__in=['open', 'in_progress']).count(),
            'total': user_tickets.count(),
            'my_tickets': Ticket.objects.filter(created_by=request.user).count(),
            'assigned_to_me': Ticket.objects.filter(assigned_to=request.user).count(),
        }
    
    return JsonResponse(stats)
    
@login_required
def ticket_detail(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    comments = ticket.comments.all()
    
    if request.method == 'POST':
        comment_form = TicketCommentForm(request.POST)
        if comment_form.is_valid():
            # Sanitize content to prevent XSS
            content = escape(comment_form.cleaned_data['content'])
            
            comment = comment_form.save(commit=False)
            comment.ticket = ticket
            comment.author = request.user
            comment.content = content  # Use sanitized content
            comment.save()
            
            # Set ticket status to in_progress if it's currently open
            if ticket.status == 'open':
                ticket.status = 'in_progress'
                ticket.save()
                messages.info(request, "Ticket status updated to 'In Progress'")
            
            messages.success(request, 'Comment added successfully.')
            return redirect('tickets:ticket_detail', ticket_id=ticket.id)
    else:
        comment_form = TicketCommentForm()
    
    return render(request, 'tickets/ticket_detail.html', {
        'ticket': ticket,
        'comments': comments,
        'comment_form': comment_form
    })

@login_required
def get_ticket_detail_api(request, ticket_id):
    """
    API endpoint to get detailed ticket information
    """
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Check permissions
    if not request.user.is_staff and request.user != ticket.created_by and request.user != ticket.assigned_to:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    # Serialize ticket data
    ticket_data = {
        'id': ticket.id,
        'subject': ticket.subject,
        'description': ticket.description,
        'status': ticket.status,
        'priority': ticket.priority,
        'department': ticket.department,
        'created_by': {
            'id': ticket.created_by.id,
            'username': ticket.created_by.username,
            'email': ticket.created_by.email,
        },
        'assigned_to': {
            'id': ticket.assigned_to.id,
            'username': ticket.assigned_to.username,
            'email': ticket.assigned_to.email,
        } if ticket.assigned_to else None,
        'created_at': ticket.created_at.isoformat(),
        'updated_at': ticket.updated_at.isoformat(),
    }
    
    # Get comments
    comments = []
    for comment in ticket.comments.all():
        # Only show internal comments to staff
        if comment.is_internal and not request.user.is_staff:
            continue
            
        comments.append({
            'id': comment.id,
            'content': comment.content,
            'author': {
                'id': comment.author.id,
                'username': comment.author.username,
            },
            'created_at': comment.created_at.isoformat(),
            'is_internal': comment.is_internal,
        })
    
    # Get attachments
    attachments = []
    for attachment in ticket.attachments.all():
        attachments.append({
            'id': attachment.id,
            'filename': attachment.filename,
            'file_type': attachment.file_type,
            'file_size': attachment.file_size,
            'uploaded_by': attachment.uploaded_by.username,
            'uploaded_at': attachment.uploaded_at.isoformat(),
            'url': attachment.file.url if attachment.file else None,
        })
    
    ticket_data['comments'] = comments
    ticket_data['attachments'] = attachments
    
    return JsonResponse(ticket_data)

@login_required
def create_ticket(request):
    if request.method == 'POST':
        form = TicketForm(request.POST)
        if form.is_valid():
            # Sanitize input to prevent XSS
            subject = escape(form.cleaned_data['subject'])
            description = escape(form.cleaned_data['description'])
            
            ticket = form.save(commit=False)
            ticket.created_by = request.user
            ticket.subject = subject
            ticket.description = description
            
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
@require_http_methods(["POST"])
def submit_ticket_api(request):
    """
    API endpoint to submit/create a new ticket
    """
    try:
        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('subject') or not data.get('description'):
            return JsonResponse({'error': 'Subject and description are required'}, status=400)
        
        # Sanitize input
        subject = escape(data['subject'][:255])  # Limit length
        description = escape(data['description'][:2000])  # Limit length
        priority = data.get('priority', 'medium')
        department = data.get('department', '')
        
        # Create ticket
        ticket = Ticket.objects.create(
            subject=subject,
            description=description,
            priority=priority,
            department=department,
            created_by=request.user,
        )
        
        # Auto-assign using the ticket router
        if not request.user.is_staff:
            dept, assigned_user = TicketRouter.route_ticket(ticket)
            if dept:
                ticket.department = dept
            if assigned_user:
                ticket.assigned_to = assigned_user
                ticket.status = 'in_progress'
            ticket.save()
        
        return JsonResponse({
            'success': True,
            'ticket_id': ticket.id,
            'message': 'Ticket created successfully',
            'assigned_to': ticket.assigned_to.username if ticket.assigned_to else None,
            'department': ticket.department,
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def add_comment_api(request, ticket_id):
    """
    API endpoint to add a comment to a ticket
    """
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        
        # Check permissions
        if not request.user.is_staff and request.user != ticket.created_by and request.user != ticket.assigned_to:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        data = json.loads(request.body)
        content = data.get('content', '').strip()
        is_internal = data.get('is_internal', False)
        
        if not content:
            return JsonResponse({'error': 'Comment content is required'}, status=400)
        
        # Only staff can make internal comments
        if is_internal and not request.user.is_staff:
            is_internal = False
        
        # Sanitize content
        content = escape(content[:1000])  # Limit length
        
        # Create comment
        comment = TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=content,
            is_internal=is_internal,
        )
        
        # Update ticket status if it's currently open
        if ticket.status == 'open':
            ticket.status = 'in_progress'
            ticket.save()
        
        return JsonResponse({
            'success': True,
            'comment_id': comment.id,
            'message': 'Comment added successfully',
            'comment': {
                'id': comment.id,
                'content': comment.content,
                'author': comment.author.username,
                'created_at': comment.created_at.isoformat(),
                'is_internal': comment.is_internal,
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def update_ticket_status_api(request, ticket_id):
    """
    API endpoint to update ticket status
    """
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        
        # Check permissions
        if not request.user.is_staff and request.user != ticket.created_by and request.user != ticket.assigned_to:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if new_status not in ['open', 'in_progress', 'on_hold', 'resolved', 'closed']:
            return JsonResponse({'error': 'Invalid status'}, status=400)
        
        old_status = ticket.status
        ticket.status = new_status
        ticket.save()
        
        # Add a system comment about the status change
        TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=f'Status changed from "{old_status}" to "{new_status}"',
            is_internal=True,
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Ticket status updated to {new_status}',
            'old_status': old_status,
            'new_status': new_status,
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def assign_ticket_api(request, ticket_id):
    """
    API endpoint to assign a ticket to a user (admin only)
    """
    if not request.user.is_staff:
        return JsonResponse({'error': 'Permission denied - admin only'}, status=403)
    
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        data = json.loads(request.body)
        
        assignee_id = data.get('assignee_id')
        if assignee_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            assignee = get_object_or_404(User, id=assignee_id)
            
            old_assignee = ticket.assigned_to
            ticket.assigned_to = assignee
            
            # Update status to in_progress if it was open
            if ticket.status == 'open':
                ticket.status = 'in_progress'
            
            ticket.save()
            
            # Add a system comment
            old_name = old_assignee.username if old_assignee else 'no one'
            TicketComment.objects.create(
                ticket=ticket,
                author=request.user,
                content=f'Ticket assigned from "{old_name}" to "{assignee.username}"',
                is_internal=True,
            )
            
            return JsonResponse({
                'success': True,
                'message': f'Ticket assigned to {assignee.username}',
                'assignee': {
                    'id': assignee.id,
                    'username': assignee.username,
                    'email': assignee.email,
                }
            })
        else:
            # Unassign ticket
            old_assignee = ticket.assigned_to
            ticket.assigned_to = None
            ticket.save()
            
            if old_assignee:
                TicketComment.objects.create(
                    ticket=ticket,
                    author=request.user,
                    content=f'Ticket unassigned from "{old_assignee.username}"',
                    is_internal=True,
                )
            
            return JsonResponse({
                'success': True,
                'message': 'Ticket unassigned',
                'assignee': None
            })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def bulk_update_tickets_api(request):
    """
    API endpoint for bulk operations on tickets (admin only)
    """
    if not request.user.is_staff:
        return JsonResponse({'error': 'Permission denied - admin only'}, status=403)
    
    try:
        data = json.loads(request.body)
        ticket_ids = data.get('ticket_ids', [])
        action = data.get('action')
        
        if not ticket_ids:
            return JsonResponse({'error': 'No tickets selected'}, status=400)
        
        tickets = Ticket.objects.filter(id__in=ticket_ids)
        updated_count = 0
        
        if action == 'close':
            updated_count = tickets.update(status='closed')
        elif action == 'reopen':
            updated_count = tickets.update(status='open')
        elif action == 'mark_resolved':
            updated_count = tickets.update(status='resolved')
        elif action == 'assign':
            assignee_id = data.get('assignee_id')
            if assignee_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                assignee = get_object_or_404(User, id=assignee_id)
                updated_count = tickets.update(assigned_to=assignee)
        else:
            return JsonResponse({'error': 'Invalid action'}, status=400)
        
        return JsonResponse({
            'success': True,
            'message': f'{updated_count} tickets updated successfully',
            'updated_count': updated_count,
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def search_tickets_api(request):
    """
    API endpoint to search tickets
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'tickets': []})
    
    # Start with base queryset based on user permissions
    if request.user.is_staff:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(
            Q(created_by=request.user) | Q(assigned_to=request.user)
        )
    
    # Search in subject, description, and comments
    tickets = tickets.filter(
        Q(subject__icontains=query) |
        Q(description__icontains=query) |
        Q(comments__content__icontains=query)
    ).distinct()
    
    # Limit results
    tickets = tickets[:20]
    
    # Serialize results
    results = []
    for ticket in tickets:
        results.append({
            'id': ticket.id,
            'subject': ticket.subject,
            'status': ticket.status,
            'priority': ticket.priority,
            'created_by': ticket.created_by.username,
            'created_at': ticket.created_at.isoformat(),
        })
    
    return JsonResponse({'tickets': results})

@login_required
def export_tickets_csv(request):
    """
    API endpoint to export tickets as CSV
    """
    import csv
    from django.http import HttpResponse
    
    # Get tickets based on user permissions
    if request.user.is_staff:
        tickets = Ticket.objects.all()
    else:
        tickets = Ticket.objects.filter(
            Q(created_by=request.user) | Q(assigned_to=request.user)
        )
    
    # Create HTTP response with CSV content type
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="tickets_export_{timezone.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    # Write header
    writer.writerow([
        'Ticket ID', 'Title', 'Description', 'Status', 'Priority', 
        'Creator', 'Assignee', 'Department', 'Created At', 'Updated At'
    ])
    
    # Write ticket data
    for ticket in tickets:
        writer.writerow([
            ticket.id,
            ticket.subject,
            ticket.description,
            ticket.get_status_display(),
            ticket.get_priority_display(),
            ticket.created_by.username,
            ticket.assigned_to.username if ticket.assigned_to else 'Unassigned',
            ticket.department or 'N/A',
            ticket.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ticket.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
        ])
    
    return response

@login_required
def get_departments_api(request):
    """
    API endpoint to get all departments
    """
    # Since departments are stored as strings in tickets, we'll get unique departments
    departments = Ticket.objects.values_list('department', flat=True).distinct()
    departments = [dept for dept in departments if dept]  # Remove None values
    
    # Add standard departments that might not have tickets yet
    standard_departments = [
        'Academic Affairs', 'Registrar', 'IT', 'Finance (Accounting)',
        'Alumni Affairs', 'Student Affairs (OSAS)', 'Scholarship'
    ]
    
    all_departments = list(set(list(departments) + standard_departments))
    
    department_data = []
    for dept in all_departments:
        ticket_count = Ticket.objects.filter(department=dept).count()
        department_data.append({
            'id': dept.lower().replace(' ', '_').replace('(', '').replace(')', ''),
            'name': dept,
            'ticket_count': ticket_count,
        })
    
    return JsonResponse({'departments': department_data})

@login_required
def get_users_api(request):
    """
    API endpoint to get users (admin only)
    """
    if not request.user.is_staff:
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    users = User.objects.all()
    users_data = []
    
    for user in users:
        users_data.append({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'username': user.username,
            'role': 'admin' if user.is_staff else getattr(user, 'role', 'student'),
            'department': getattr(user, 'department', ''),
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
        })
    
    return JsonResponse({'users': users_data})

# ... keep existing code (update_ticket, delete_attachment, reroute_ticket methods)
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
    attachment = get_object_or_404(TicketAttachment, id=attachment_id)
    
    # Check if user has permission to delete this attachment
    if not request.user.is_staff and request.user != attachment.uploaded_by:
        messages.error(request, "You don't have permission to delete this attachment")
        return redirect('tickets:ticket_detail', ticket_id=attachment.ticket.id)
    
    ticket_id = attachment.ticket.id
    attachment.delete()
    messages.success(request, 'Attachment deleted successfully!')
    return redirect('tickets:ticket_detail', ticket_id=ticket_id)

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
