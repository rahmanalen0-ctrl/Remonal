#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sojibWebApp.settings')
sys.path.insert(0, os.path.dirname(__file__))

django.setup()

from django.contrib.auth.models import User

user = User.objects.get(username='admin')
user.set_password('Fayshal5412@@')
user.save()

print('Django Admin Credentials:')
print('=' * 40)
print('Username: admin')
print('Password: admin123')
print('URL: http://localhost:8000/admin/')
print('=' * 40)
