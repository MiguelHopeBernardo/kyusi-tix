
from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    # Regular views
    path('', views.ticket_list, name='ticket_list'),
    path('<int:ticket_id>/', views.ticket_detail, name='ticket_detail'),
    path('create/', views.create_ticket, name='create_ticket'),
    path('<int:ticket_id>/update/', views.update_ticket, name='update_ticket'),
    path('attachment/<int:attachment_id>/delete/', views.delete_attachment, name='delete_attachment'),
    path('<int:ticket_id>/reroute/', views.reroute_ticket, name='reroute_ticket'),
    
    # API endpoints
    path('api/tickets/', views.get_tickets_api, name='get_tickets_api'),
    path('api/tickets/stats/', views.get_ticket_stats_api, name='get_ticket_stats_api'),
    path('api/tickets/search/', views.search_tickets_api, name='search_tickets_api'),
    path('api/tickets/submit/', views.submit_ticket_api, name='submit_ticket_api'),
    path('api/tickets/bulk-update/', views.bulk_update_tickets_api, name='bulk_update_tickets_api'),
    path('api/tickets/export/', views.export_tickets_csv, name='export_tickets_csv'),
    path('api/departments/', views.get_departments_api, name='get_departments_api'),
    path('api/users/', views.get_users_api, name='get_users_api'),
    path('api/tickets/<int:ticket_id>/', views.get_ticket_detail_api, name='get_ticket_detail_api'),
    path('api/tickets/<int:ticket_id>/comment/', views.add_comment_api, name='add_comment_api'),
    path('api/tickets/<int:ticket_id>/status/', views.update_ticket_status_api, name='update_ticket_status_api'),
    path('api/tickets/<int:ticket_id>/assign/', views.assign_ticket_api, name='assign_ticket_api'),
]
