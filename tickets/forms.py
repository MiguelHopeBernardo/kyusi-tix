
from django import forms
from .models import Ticket, TicketComment

class TicketForm(forms.ModelForm):
    attachments = forms.FileField(
        required=False,
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
        help_text='Upload JPEG, PNG, or PDF files (max 10MB each)'
    )
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description', 'priority', 'department']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class TicketUpdateForm(forms.ModelForm):
    attachments = forms.FileField(
        required=False,
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
        help_text='Upload JPEG, PNG, or PDF files (max 10MB each)'
    )
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description', 'status', 'priority', 'department', 'assigned_to']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class TicketCommentForm(forms.ModelForm):
    class Meta:
        model = TicketComment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Add your comment here...'}),
        }
