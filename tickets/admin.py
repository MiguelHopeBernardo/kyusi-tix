
from django.contrib import admin
from .models import Ticket, TicketComment, TicketAttachment

class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ('created_at',)

class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    readonly_fields = ('uploaded_at', 'file_size')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'status', 'priority', 'created_by', 'assigned_to', 'department', 'created_at')
    list_filter = ('status', 'priority', 'department', 'created_at')
    search_fields = ('subject', 'description', 'created_by__username', 'assigned_to__username')
    date_hierarchy = 'created_at'
    inlines = [TicketCommentInline, TicketAttachmentInline]
    list_per_page = 20
    raw_id_fields = ('created_by', 'assigned_to')

@admin.register(TicketComment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('content', 'author__username', 'ticket__subject')
    raw_id_fields = ('ticket', 'author')

@admin.register(TicketAttachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'filename', 'file_type', 'uploaded_by', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('filename', 'ticket__subject', 'uploaded_by__username')
    raw_id_fields = ('ticket', 'uploaded_by')
