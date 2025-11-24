#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sojibWebApp.settings')
sys.path.insert(0, os.path.dirname(__file__))

django.setup()

# Run migrations
from django.core.management import execute_from_command_line

print("Running migrations...")
execute_from_command_line(['manage.py', 'migrate', '--noinput'])
print("Migrations completed!")
