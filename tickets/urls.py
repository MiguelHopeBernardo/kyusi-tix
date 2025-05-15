
from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    path('', views.ticket_list, name='ticket_list'),
    path('<int:ticket_id>/', views.ticket_detail, name='ticket_detail'),
    path('create/', views.create_ticket, name='create_ticket'),
    path('<int:ticket_id>/update/', views.update_ticket, name='update_ticket'),
    path('attachment/<int:attachment_id>/delete/', views.delete_attachment, name='delete_attachment'),
]
