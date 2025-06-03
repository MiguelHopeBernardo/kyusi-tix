from django import forms
from .models import Ticket, TicketComment
from django.core.validators import MinLengthValidator, MaxLengthValidator
from .widgets import MultipleFileInput

class TicketForm(forms.ModelForm):
    # Add validators to ensure secure input
    subject = forms.CharField(
        validators=[
            MinLengthValidator(5, message="Ticket title must be at least 5 characters long"),
            MaxLengthValidator(64, message="Ticket title cannot exceed 64 characters")
        ],
        widget=forms.TextInput(attrs={'maxlength': 64})  # Prevent input exceeding max length
    )
    
    description = forms.CharField(
        validators=[
            MinLengthValidator(15, message="Ticket description must be at least 15 characters long"),
            MaxLengthValidator(300, message="Ticket description cannot exceed 300 characters")
        ],
        widget=forms.Textarea(attrs={'rows': 5, 'maxlength': 300})
    )
    
    attachments = forms.FileField(
        required=False,
        widget=MultipleFileInput(),
        help_text='Upload JPEG, PNG, or PDF files (max 10MB each)'
    )
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description', 'priority', 'department']

class TicketUpdateForm(forms.ModelForm):
    # Add validators to ensure secure input
    subject = forms.CharField(
        validators=[
            MinLengthValidator(5, message="Ticket title must be at least 5 characters long"),
            MaxLengthValidator(64, message="Ticket title cannot exceed 64 characters")
        ],
        widget=forms.TextInput(attrs={'maxlength': 64})
    )
    
    description = forms.CharField(
        validators=[
            MinLengthValidator(15, message="Ticket description must be at least 15 characters long"),
            MaxLengthValidator(300, message="Ticket description cannot exceed 300 characters")
        ],
        widget=forms.Textarea(attrs={'rows': 5, 'maxlength': 300})
    )
    
    attachments = forms.FileField(
        required=False,
        widget=MultipleFileInput(),
        help_text='Upload JPEG, PNG, or PDF files (max 10MB each)'
    )
    
    class Meta:
        model = Ticket
        fields = ['subject', 'description', 'status', 'priority', 'department', 'assigned_to']

class TicketCommentForm(forms.ModelForm):
    content = forms.CharField(
        validators=[MinLengthValidator(1, message="Comment cannot be empty")],
        widget=forms.Textarea(attrs={
            'rows': 3, 
            'placeholder': 'Add your comment here...',
            'maxlength': 1000  # Set reasonable comment length
        }),
    )
    
    class Meta:
        model = TicketComment
        fields = ['content']
