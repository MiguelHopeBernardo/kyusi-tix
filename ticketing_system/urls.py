
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from users import views as user_views

@csrf_exempt
def health_check(request):
    """Simple health check endpoint with proper CORS handling"""
    print(f"Health check request from: {request.META.get('HTTP_ORIGIN', 'Unknown')}")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        print("Responding to OPTIONS request")
        return response
    
    # Handle actual request
    response = JsonResponse({
        'status': 'ok', 
        'message': 'Django server is running',
        'cors_configured': True,
        'timestamp': str(timezone.now())
    })
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Credentials'] = 'true'
    print("Responding to health check")
    return response

# Import timezone for the health check
from django.utils import timezone

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),  # Updated health check with CORS
    path('', RedirectView.as_view(url='login/', permanent=False)),  # Redirect root to login
    path('login/', csrf_exempt(user_views.login_view), name='login'),  # Custom login view with CSRF exemption for API
    path('logout/', csrf_exempt(user_views.logout_view), name='logout'),
    path('dashboard/', include('dashboard.urls')),
    path('tickets/', include('tickets.urls')),
    path('users/', include('users.urls')),
    path('accounts/', include('django.contrib.auth.urls')),  # For built-in auth views
]

# Add media and static files serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
