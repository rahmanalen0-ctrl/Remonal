from rest_framework import serializers
from .models import User, Reminder, Task, Note, Tag, NoteTag, Attachment, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'timezone', 'dark_mode']

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'user', 'title', 'description', 'reminder_date', 'timezone', 'recurrence_rule', 'status', 'category', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'due_date', 'priority', 'status', 'parent_task', 'order_index', 'created_at', 'updated_at']

class NoteSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = ['id', 'user', 'title', 'body', 'is_pinned', 'is_archived', 'tags', 'created_at', 'updated_at']

    def get_tags(self, obj):
        tags = NoteTag.objects.filter(note=obj).values_list('tag__name', flat=True)
        return list(tags)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'user', 'name']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'owner_type', 'owner_id', 'file', 'mime_type', 'size', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'reminder', 'notify_at', 'channel', 'status', 'created_at']
