@echo off
echo Starting Sojib Web App...
echo.
echo Installing dependencies...
pip install -r requirements.txt >nul 2>&1
echo.
echo Setting up database...
python manage.py migrate
echo.
echo Starting Django server...
echo.
echo Server is running at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver

