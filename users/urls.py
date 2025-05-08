
from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.user_list, name='user_list'),
    path('profile/', views.profile, name='profile'),
    path('register/', views.register, name='register'),
]
