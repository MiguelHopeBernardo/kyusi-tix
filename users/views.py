
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
import json
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

@csrf_exempt
def login_view(request):
    # Add CORS headers for preflight requests
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

    if request.user.is_authenticated:
        # For API requests, return JSON
        if request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json':
            response = JsonResponse({
                'success': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'role': request.user.role,
                    'department': request.user.department,
                    'profile_image': request.user.profile_image.url if request.user.profile_image else None,
                }
            })
            response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
        return redirect('dashboard:dashboard')
        
    if request.method == 'POST':
        # Handle JSON API requests
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
                print(f"Login attempt for user: {username}")  # Debug log
            except json.JSONDecodeError:
                response = JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
                response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
                response['Access-Control-Allow-Credentials'] = 'true'
                return response
        else:
            # Handle form-based requests
            username = request.POST.get('username')
            password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        print(f"Authentication result for {username}: {user is not None}")  # Debug log
        
        if user is not None:
            login(request, user)
            print(f"User {username} logged in successfully")  # Debug log
            
            # For API requests, return JSON
            if request.content_type == 'application/json':
                response = JsonResponse({
                    'success': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'department': user.department,
                        'profile_image': user.profile_image.url if user.profile_image else None,
                    }
                })
                response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
                response['Access-Control-Allow-Credentials'] = 'true'
                return response
            
            # For form requests, redirect
            next_url = request.GET.get('next', 'dashboard:dashboard')
            return redirect(next_url)
        else:
            print(f"Authentication failed for {username}")  # Debug log
            # For API requests, return JSON error
            if request.content_type == 'application/json':
                response = JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
                response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
                response['Access-Control-Allow-Credentials'] = 'true'
                return response
            
            # For form requests, show error message
            messages.error(request, 'Invalid username or password')
    
    # For GET requests to API, return method not allowed
    if request.content_type == 'application/json':
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    return render(request, 'users/login.html')

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def logout_view(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
        
    logout(request)
    
    # For API requests, return JSON
    if request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json':
        response = JsonResponse({'success': True, 'message': 'Logged out successfully'})
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    return redirect('login')

@csrf_exempt
@login_required
def profile(request):
    # Handle OPTIONS requests
    if request.method == 'OPTIONS':
        response = JsonResponse({'status': 'ok'})
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
        
    # For API requests, return JSON user data
    if request.method == 'GET' and (request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json'):
        response = JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'role': request.user.role,
            'department': request.user.department,
            'profile_image': request.user.profile_image.url if request.user.profile_image else None,
        })
        response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', '')
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated')
            return redirect('users:profile')
    else:
        form = CustomUserChangeForm(instance=request.user)
    
    return render(request, 'users/profile.html', {'form': form})

# ... keep existing code (user_list, register functions)
