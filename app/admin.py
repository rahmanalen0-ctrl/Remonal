from django.contrib import admin
from .models import User, Reminder, Task, Note, Tag, NoteTag, Attachment, Notification, TokenBlacklist

admin.site.register(User)
admin.site.register(Reminder)
admin.site.register(Task)
admin.site.register(Note)
admin.site.register(Tag)
admin.site.register(NoteTag)
admin.site.register(Attachment)
admin.site.register(Notification)
admin.site.register(TokenBlacklist)
