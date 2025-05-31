
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

def login_view(request):
    if request.user.is_authenticated:
        # For API requests, return JSON
        if request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json':
            return JsonResponse({
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
        return redirect('dashboard:dashboard')
        
    if request.method == 'POST':
        # Handle JSON API requests
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
        else:
            # Handle form-based requests
            username = request.POST.get('username')
            password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            # For API requests, return JSON
            if request.content_type == 'application/json':
                return JsonResponse({
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
            
            # For form requests, redirect
            next_url = request.GET.get('next', 'dashboard:dashboard')
            return redirect(next_url)
        else:
            # For API requests, return JSON error
            if request.content_type == 'application/json':
                return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
            
            # For form requests, show error message
            messages.error(request, 'Invalid username or password')
    
    # For GET requests to API, return method not allowed
    if request.content_type == 'application/json':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    return render(request, 'users/login.html')

@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    
    # For API requests, return JSON
    if request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json':
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    
    return redirect('login')

@login_required
def profile(request):
    # For API requests, return JSON user data
    if request.method == 'GET' and (request.content_type == 'application/json' or request.META.get('HTTP_ACCEPT') == 'application/json'):
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'role': request.user.role,
            'department': request.user.department,
            'profile_image': request.user.profile_image.url if request.user.profile_image else None,
        })
    
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated')
            return redirect('users:profile')
    else:
        form = CustomUserChangeForm(instance=request.user)
    
    return render(request, 'users/profile.html', {'form': form})

@login_required
def user_list(request):
    if not request.user.is_staff:
        messages.error(request, 'You do not have permission to view this page')
        return redirect('dashboard:dashboard')
        
    users = CustomUser.objects.all()
    return render(request, 'users/user_list.html', {'users': users})

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created successfully! You can now log in.')
            return redirect('login')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'users/register.html', {'form': form})
