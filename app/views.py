from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.db import models
from django.shortcuts import render
from datetime import timedelta
import jwt
import os
import json

from .models import User, Reminder, Task, Note, Tag, NoteTag, Attachment, Notification, TokenBlacklist
from .serializers import UserSerializer, ReminderSerializer, TaskSerializer, NoteSerializer, TagSerializer, AttachmentSerializer, NotificationSerializer

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-test-key')

def generate_tokens(user_id):
    import jwt
    import datetime
    payload = {
        'user_id': user_id,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    access_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return {'access': access_token, 'refresh': access_token}

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'Missing required field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            password_hash=make_password(data.get('password')),
            timezone=data.get('timezone', 'UTC')
        )
        
        tokens = generate_tokens(user.id)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f'Registration error: {str(e)}')
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        data = request.data
        
        # Validate required fields
        if not data.get('email'):
            return Response({'error': 'Missing required field: email'}, status=status.HTTP_400_BAD_REQUEST)
        if not data.get('password'):
            return Response({'error': 'Missing required field: password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(email=data.get('email'))
        
        if not check_password(data.get('password'), user.password_hash):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        tokens = generate_tokens(user.id)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f'Login error: {str(e)}')
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        token = request.auth
        user_id = request.user.id if hasattr(request, 'user') else jwt.decode(str(token), SECRET_KEY, algorithms=['HS256']).get('user_id')
        TokenBlacklist.objects.create(user_id=user_id, token=str(token))
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def reminder_list(request):
    try:
        user_id = request.query_params.get('user_id') if request.method == 'GET' else request.data.get('user_id')
        
        if request.method == 'GET':
            reminders = Reminder.objects.filter(user_id=user_id).order_by('-reminder_date')
            serializer = ReminderSerializer(reminders, many=True)
            return Response(serializer.data)
        
        reminder = Reminder.objects.create(
            user_id=user_id,
            title=request.data.get('title'),
            description=request.data.get('description', ''),
            reminder_date=request.data.get('reminder_date'),
            timezone=request.data.get('timezone', 'UTC'),
            category=request.data.get('category', 'personal')
        )
        return Response(ReminderSerializer(reminder).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def reminder_detail(request, reminder_id):
    try:
        reminder = Reminder.objects.get(id=reminder_id)
        
        if request.method == 'GET':
            return Response(ReminderSerializer(reminder).data)
        elif request.method == 'PATCH':
            for field, value in request.data.items():
                if hasattr(reminder, field):
                    setattr(reminder, field, value)
            reminder.save()
            return Response(ReminderSerializer(reminder).data)
        elif request.method == 'DELETE':
            reminder.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Reminder.DoesNotExist:
        return Response({'error': 'Reminder not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def task_list(request):
    try:
        user_id = request.query_params.get('user_id') if request.method == 'GET' else request.data.get('user_id')
        
        if request.method == 'GET':
            tasks = Task.objects.filter(user_id=user_id).order_by('order_index')
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data)
        
        task = Task.objects.create(
            user_id=user_id,
            title=request.data.get('title'),
            description=request.data.get('description', ''),
            due_date=request.data.get('due_date'),
            priority=request.data.get('priority', 'medium'),
            order_index=request.data.get('order_index', 0)
        )
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def task_detail(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        if request.method == 'GET':
            return Response(TaskSerializer(task).data)
        elif request.method == 'PATCH':
            for field, value in request.data.items():
                if hasattr(task, field):
                    setattr(task, field, value)
            task.save()
            return Response(TaskSerializer(task).data)
        elif request.method == 'DELETE':
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def note_list(request):
    try:
        user_id = request.query_params.get('user_id') if request.method == 'GET' else request.data.get('user_id')
        
        if request.method == 'GET':
            notes = Note.objects.filter(user_id=user_id, is_archived=False).order_by('-created_at')
            serializer = NoteSerializer(notes, many=True)
            return Response(serializer.data)
        
        note = Note.objects.create(
            user_id=user_id,
            title=request.data.get('title'),
            body=request.data.get('body', '')
        )
        
        tags = request.data.get('tags', [])
        for tag_name in tags:
            tag, created = Tag.objects.get_or_create(user_id=user_id, name=tag_name)
            NoteTag.objects.create(note=note, tag=tag)
        
        return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def note_detail(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
        
        if request.method == 'GET':
            return Response(NoteSerializer(note).data)
        elif request.method == 'PATCH':
            for field, value in request.data.items():
                if field == 'tags':
                    NoteTag.objects.filter(note=note).delete()
                    for tag_name in value:
                        tag, created = Tag.objects.get_or_create(user_id=note.user_id, name=tag_name)
                        NoteTag.objects.create(note=note, tag=tag)
                elif hasattr(note, field):
                    setattr(note, field, value)
            note.save()
            return Response(NoteSerializer(note).data)
        elif request.method == 'DELETE':
            note.is_archived = True
            note.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    except Note.DoesNotExist:
        return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return Response(UserSerializer(user).data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
def user_update(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        for field, value in request.data.items():
            if field == 'password':
                user.password_hash = make_password(value)
            elif hasattr(user, field):
                setattr(user, field, value)
        user.save()
        return Response(UserSerializer(user).data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def search_notes(request):
    try:
        user_id = request.query_params.get('user_id')
        query = request.query_params.get('q', '')
        notes = Note.objects.filter(user_id=user_id, is_archived=False).filter(
            models.Q(title__icontains=query) | models.Q(body__icontains=query)
        ).order_by('-created_at')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def upload_attachment(request):
    try:
        file = request.FILES.get('file')
        owner_type = request.data.get('owner_type')
        owner_id = request.data.get('owner_id')
        
        attachment = Attachment.objects.create(
            owner_type=owner_type,
            owner_id=owner_id,
            file=file,
            mime_type=file.content_type,
            size=file.size
        )
        return Response(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def index(request):
    return render(request, 'index.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_password_reset(request):
    """
    Reset Django admin password (use with caution!)
    Requires the old password for security
    """
    try:
        from django.contrib.auth.models import User
        
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Missing old_password or new_password'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            admin_user = User.objects.get(username='admin')
        except User.DoesNotExist:
            return Response({'error': 'Admin user does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify old password
        if not admin_user.check_password(old_password):
            return Response({'error': 'Incorrect old password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Set new password
        admin_user.set_password(new_password)
        admin_user.save()
        
        return Response({'message': 'Admin password updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
