
import os
import time
import hashlib
import json
import logging
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.utils import timezone
from .models import ChatInteraction, ChatCache
import requests

# Set up logging
logger = logging.getLogger(__name__)

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyCN4jVFK_RS4wX6w3kujYJU5HvHxsDsoYs')  # Fallback for development
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

PUPQC_CONTEXT = """You are KyusiChat, the official AI assistant for Polytechnic University of the Philippines - Quezon City (PUPQC). 

IMPORTANT INSTRUCTIONS:
- Only answer questions related to PUP Quezon City (PUPQC)
- If a question is not related to PUPQC, politely redirect the conversation back to PUPQC topics
- Provide accurate, helpful information about PUPQC services, programs, enrollment, admissions, etc.
- Be friendly but professional
- Keep responses concise and informative

PUPQC KNOWLEDGE BASE:
- Location: San Bartolome, Novaliches, Quezon City
- Contact: (02) 8287-1717, info@pup.edu.ph, www.pup.edu.ph
- Programs: BS Information Technology, BS Business Administration, BS Accountancy, BS Elementary Education, BS Secondary Education, BS Entrepreneurship, and more
- Admission: PUPCET (PUP College Entrance Test) required, applications usually January-February
- Tuition: PHP 1,000-1,500 per semester (very affordable state university)
- Requirements: Form 138, Good Moral Certificate, Birth Certificate, 2x2 photos, Entrance Exam Results
- Services: Student Information System (SIS) for grades and schedules, various scholarship programs
- Events: University Week, Foundation Day, departmental seminars, sports festivals, cultural shows"""

def check_rate_limit(user_id, ip_address):
    """Check if user/IP has exceeded rate limits"""
    # Rate limiting: 10 messages per minute per user, 20 per minute per IP
    user_key = f"chat_rate_user_{user_id}" if user_id else None
    ip_key = f"chat_rate_ip_{ip_address}"
    
    current_time = time.time()
    
    # Check user rate limit (if authenticated)
    if user_key:
        user_requests = cache.get(user_key, [])
        user_requests = [req_time for req_time in user_requests if current_time - req_time < 60]
        if len(user_requests) >= 10:
            return False, "Rate limit exceeded. Please wait a moment before sending another message."
        user_requests.append(current_time)
        cache.set(user_key, user_requests, 60)
    
    # Check IP rate limit
    ip_requests = cache.get(ip_key, [])
    ip_requests = [req_time for req_time in ip_requests if current_time - req_time < 60]
    if len(ip_requests) >= 20:
        return False, "Rate limit exceeded. Please wait a moment before sending another message."
    ip_requests.append(current_time)
    cache.set(ip_key, ip_requests, 60)
    
    return True, None

def normalize_question(question):
    """Normalize question for caching"""
    return question.lower().strip().replace('?', '').replace('.', '').replace(',', '')

def get_cached_response(question):
    """Check if we have a cached response for this question"""
    normalized = normalize_question(question)
    question_hash = hashlib.md5(normalized.encode()).hexdigest()
    
    try:
        cached = ChatCache.objects.get(question_hash=question_hash)
        # Update hit count
        cached.hit_count += 1
        cached.save()
        logger.info(f"Cache hit for question hash: {question_hash}")
        return cached.response
    except ChatCache.DoesNotExist:
        return None

def cache_response(question, response):
    """Cache the response for future use"""
    normalized = normalize_question(question)
    question_hash = hashlib.md5(normalized.encode()).hexdigest()
    
    try:
        ChatCache.objects.create(
            question_hash=question_hash,
            response=response
        )
        logger.info(f"Cached response for question hash: {question_hash}")
    except Exception as e:
        logger.warning(f"Failed to cache response: {e}")

def call_gemini_api(message):
    """Call Gemini API with proper error handling"""
    try:
        headers = {
            'Content-Type': 'application/json',
        }
        
        payload = {
            'contents': [{
                'parts': [{
                    'text': f"{PUPQC_CONTEXT}\n\nUser question: {message}"
                }]
            }],
            'generationConfig': {
                'temperature': 0.7,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 1024,
            },
        }
        
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        else:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return None

@csrf_exempt
@require_http_methods(["POST"])
def chat_ask(request):
    """Handle chat requests with rate limiting, caching, and logging"""
    start_time = time.time()
    
    try:
        # Parse request data
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        user_id = data.get('user_id')
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Get user IP address
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Check rate limits
        is_allowed, rate_limit_msg = check_rate_limit(user_id, ip_address)
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for user {user_id} from IP {ip_address}")
            return JsonResponse({'error': rate_limit_msg}, status=429)
        
        # Check cache first
        cached_response = get_cached_response(user_message)
        if cached_response:
            response_time = time.time() - start_time
            
            # Log interaction
            try:
                user = None
                if user_id and request.user.is_authenticated:
                    user = request.user
                
                ChatInteraction.objects.create(
                    user=user,
                    user_message=user_message,
                    ai_response=cached_response,
                    response_time=response_time
                )
            except Exception as e:
                logger.warning(f"Failed to log interaction: {e}")
            
            logger.info(f"Served cached response in {response_time:.2f}s")
            return JsonResponse({'response': cached_response})
        
        # Call Gemini API
        ai_response = call_gemini_api(user_message)
        
        if not ai_response:
            ai_response = "I apologize, but I'm currently experiencing technical difficulties. For immediate assistance, please contact PUPQC directly at (02) 8287-1717 or visit www.pup.edu.ph."
        
        # Cache the response
        cache_response(user_message, ai_response)
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Log interaction
        try:
            user = None
            if user_id and request.user.is_authenticated:
                user = request.user
            
            ChatInteraction.objects.create(
                user=user,
                user_message=user_message,
                ai_response=ai_response,
                response_time=response_time
            )
        except Exception as e:
            logger.warning(f"Failed to log interaction: {e}")
        
        logger.info(f"Processed chat request in {response_time:.2f}s for user {user_id}")
        
        return JsonResponse({'response': ai_response})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in chat_ask: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

@require_http_methods(["GET"])
def chat_stats(request):
    """Get chat statistics (admin only)"""
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    try:
        # Get statistics for the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        total_interactions = ChatInteraction.objects.filter(timestamp__gte=thirty_days_ago).count()
        unique_users = ChatInteraction.objects.filter(timestamp__gte=thirty_days_ago).values('user').distinct().count()
        avg_response_time = ChatInteraction.objects.filter(
            timestamp__gte=thirty_days_ago,
            response_time__isnull=False
        ).aggregate(avg_time=models.Avg('response_time'))['avg_time'] or 0
        
        cached_responses = ChatCache.objects.count()
        total_cache_hits = sum(cache.hit_count for cache in ChatCache.objects.all())
        
        return JsonResponse({
            'total_interactions': total_interactions,
            'unique_users': unique_users,
            'avg_response_time': round(avg_response_time, 2),
            'cached_responses': cached_responses,
            'total_cache_hits': total_cache_hits,
        })
        
    except Exception as e:
        logger.error(f"Error getting chat stats: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)
