from django.urls import path
from . import views

urlpatterns = [
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/logout', views.logout, name='logout'),
    path('auth/admin-password-reset', views.admin_password_reset, name='admin_password_reset'),
    
    path('reminders', views.reminder_list, name='reminder_list'),
    path('reminders/<int:reminder_id>', views.reminder_detail, name='reminder_detail'),
    
    path('tasks', views.task_list, name='task_list'),
    path('tasks/<int:task_id>', views.task_detail, name='task_detail'),
    
    path('notes', views.note_list, name='note_list'),
    path('notes/<int:note_id>', views.note_detail, name='note_detail'),
    path('notes/search', views.search_notes, name='search_notes'),
    
    path('users/<int:user_id>', views.user_profile, name='user_profile'),
    path('users/<int:user_id>/update', views.user_update, name='user_update'),
    
    path('attachments/upload', views.upload_attachment, name='upload_attachment'),
]
