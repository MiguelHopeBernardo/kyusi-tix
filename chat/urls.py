
from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('ask/', views.chat_ask, name='chat_ask'),
    path('stats/', views.chat_stats, name='chat_stats'),
]
