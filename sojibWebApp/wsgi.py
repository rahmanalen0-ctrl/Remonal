import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sojibWebApp.settings')

# Run migrations on startup
from django.core.management import execute_from_command_line
try:
    print("Checking for pending migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    print("Database migrations completed successfully!")
except Exception as e:
    print(f"Migration warning: {e}")

application = get_wsgi_application()
