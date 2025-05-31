
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    user_message = models.TextField()
    ai_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    response_time = models.FloatField(null=True, blank=True)  # Response time in seconds
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        user_name = self.user.username if self.user else "Anonymous"
        return f"{user_name} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class ChatCache(models.Model):
    question_hash = models.CharField(max_length=64, unique=True)  # MD5 hash of normalized question
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    hit_count = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['-hit_count', '-created_at']
    
    def __str__(self):
        return f"Cached response (hits: {self.hit_count})"
