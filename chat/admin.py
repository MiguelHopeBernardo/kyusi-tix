
from django.contrib import admin
from .models import ChatInteraction, ChatCache

@admin.register(ChatInteraction)
class ChatInteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'timestamp', 'response_time', 'user_message_preview']
    list_filter = ['timestamp', 'user']
    search_fields = ['user_message', 'ai_response', 'user__username']
    readonly_fields = ['timestamp', 'response_time']
    ordering = ['-timestamp']
    
    def user_message_preview(self, obj):
        return obj.user_message[:50] + "..." if len(obj.user_message) > 50 else obj.user_message
    user_message_preview.short_description = "Message Preview"

@admin.register(ChatCache)
class ChatCacheAdmin(admin.ModelAdmin):
    list_display = ['question_hash', 'hit_count', 'created_at', 'response_preview']
    list_filter = ['created_at', 'hit_count']
    search_fields = ['response']
    readonly_fields = ['question_hash', 'created_at']
    ordering = ['-hit_count', '-created_at']
    
    def response_preview(self, obj):
        return obj.response[:50] + "..." if len(obj.response) > 50 else obj.response
    response_preview.short_description = "Response Preview"
