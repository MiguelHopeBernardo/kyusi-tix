
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'dashboard:dashboard')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password')
    
    return render(request, 'users/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def profile(request):
    return render(request, 'users/profile.html')

def user_list(request):
    # Your user list logic here
    return render(request, 'users/user_list.html')

def register(request):
    # Your registration logic here
    return render(request, 'users/register.html')
