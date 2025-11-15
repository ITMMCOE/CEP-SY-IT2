from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Handle user login."""
    try:
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'detail': 'Username and password are required'
            }, status=400)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'detail': 'Invalid username or password'
            }, status=401)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """Handle user logout."""
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@require_http_methods(["GET"])
def current_user_view(request):
    """Get current authenticated user info."""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'user': None
        })


@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """Register a new user (optional - can be disabled in production)."""
    try:
        data = json.loads(request.body) if request.body else {}
        username = data.get('username') or request.POST.get('username')
        password = data.get('password') or request.POST.get('password')
        email = data.get('email') or request.POST.get('email', '')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'detail': 'Username and password are required'
            }, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'detail': 'Username already exists'
            }, status=400)
        
        user = User.objects.create_user(username=username, password=password, email=email)
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'detail': str(e)
        }, status=500)
