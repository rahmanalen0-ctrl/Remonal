# Sojib Web App - Reminder, Planner, Notes

A complete web application for managing reminders, tasks, and notes with a simple 2005-style UI. Built with Django backend and HTML/CSS/JavaScript frontend.

## Features

- **User Authentication**: Register and login with secure password hashing
- **Reminders**: Create reminders with dates, times, categories, and notifications
- **Tasks/Planner**: Manage to-do items with priorities and deadlines
- **Notes**: Create, edit, and organize notes with tags
- **Dashboard**: View quick stats and recent items
- **Settings**: Update profile, change password, toggle dark mode
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle dark mode in settings

## Project Structure

```
sojibWebApp/
├── app/
│   ├── migrations/
│   ├── models.py          (Database models)
│   ├── views.py           (API endpoints)
│   ├── serializers.py     (Data serializers)
│   ├── urls.py            (API routes)
│   ├── admin.py           (Django admin)
│   └── apps.py
├── sojibWebApp/
│   ├── settings.py        (Django settings)
│   ├── urls.py            (URL routing)
│   ├── wsgi.py            (WSGI config)
│   └── __init__.py
├── templates/
│   └── index.html         (Main frontend)
├── static/
│   ├── css/
│   │   └── style.css      (Styling)
│   └── js/
│       └── app.js         (Frontend logic)
├── manage.py              (Django management)
├── requirements.txt       (Python dependencies)
└── run.bat                (Run script for Windows)
```

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone/Download the project** and navigate to the project directory

2. **Create a virtual environment** (optional but recommended):
```bash
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Run migrations** to create the database:
```bash
python manage.py migrate
```

5. **Start the server**:
```bash
python manage.py runserver
```

Or on Windows, simply double-click `run.bat`

6. **Access the application**:
Open your browser and go to `http://localhost:8000`

## Usage

### Authentication
- Click "Register" to create a new account
- Log in with your email and password
- Access your personalized dashboard

### Creating Reminders
1. Go to "Reminders" section
2. Click "+ Add Reminder"
3. Fill in title, description, date/time, and category
4. Click "Save Reminder"

### Managing Tasks
1. Go to "Tasks" section
2. Click "+ Add Task"
3. Enter title, description, due date, and priority
4. Tasks can be marked as complete or deleted

### Creating Notes
1. Go to "Notes" section
2. Click "+ Add Note"
3. Enter title and content
4. Optionally add tags (comma-separated)
5. Click "Save Note"

### Dashboard
- View upcoming reminders
- See recent tasks
- View pinned notes
- Check statistics (total items, completed items)

### Settings
- Update your profile name
- Change password (must match confirmation)
- Toggle dark mode
- View your email (read-only)

## Database Models

### User
- ID, Name, Email, Password Hash, Timezone, Dark Mode, Created/Updated Dates

### Reminder
- ID, User ID, Title, Description, Date/Time, Timezone, Recurrence Rule, Status, Category, Created/Updated Dates

### Task
- ID, User ID, Title, Description, Due Date, Priority, Status, Parent Task, Order Index, Created/Updated Dates

### Note
- ID, User ID, Title, Body, Is Pinned, Is Archived, Created/Updated Dates

### Tag & NoteTag
- Tags with user scope and note associations

### Attachment
- File storage with owner type and ID

### Notification
- Notification queue with status tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/<id>` - Get single reminder
- `PATCH /api/reminders/<id>` - Update reminder
- `DELETE /api/reminders/<id>` - Delete reminder

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/<id>` - Get single task
- `PATCH /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/<id>` - Get single note
- `PATCH /api/notes/<id>` - Update note
- `DELETE /api/notes/<id>` - Delete note (archives)
- `GET /api/notes/search` - Search notes

### User
- `GET /api/users/<id>` - Get user profile
- `PATCH /api/users/<id>/update` - Update user

## Features Implemented

✅ User Registration & Authentication
✅ Reminder Management (CRUD operations)
✅ Task/Planner Management (CRUD operations)
✅ Notes Management with Tags
✅ Dashboard with Statistics
✅ Dark Mode Toggle
✅ Settings Panel
✅ Responsive Design (Mobile, Tablet, Desktop)
✅ Filter & Search Functionality
✅ Password Hashing & Security

## Technology Stack

**Backend:**
- Django 4.2
- Django REST Framework
- SQLite (default database)
- Python 3.8+

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript (No frameworks)
- LocalStorage for authentication tokens

**Security:**
- Password hashing with bcrypt
- JWT token-based authentication
- CORS support
- Input validation

## Supported Browsers

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Mobile: ≤ 480px
- Tablet: 481px - 768px
- Desktop: 769px+

## Timezone Support

The app supports multiple timezones:
- UTC
- America/New_York, America/Chicago, America/Denver, America/Los_Angeles
- Europe/London, Europe/Paris
- Asia/Tokyo, Asia/Shanghai, Asia/Dubai
- Australia/Sydney
- (More can be added in settings)

## Future Enhancements

- Email notifications for reminders
- Recurring reminders with RRULE support
- Collaborative features (share reminders/tasks)
- Calendar integration
- Export/Import functionality
- Drag and drop for task reordering
- Note version history
- File attachments for notes
- Mobile app (React Native/Flutter)

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it in the run command:
```bash
python manage.py runserver 8080
```

### Database Errors
Reset the database:
```bash
python manage.py migrate --run-syncdb
```

### Static Files Not Loading
Collect static files:
```bash
python manage.py collectstatic --noinput
```

## Support

For issues or questions, review the code structure and comments in:
- `app/models.py` - Database structure
- `app/views.py` - API logic
- `static/js/app.js` - Frontend logic

## License

This project is open source and available for personal and commercial use.

## Created By

Sojib Web App Development Team
