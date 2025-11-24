// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

let currentUser = null;
let accessToken = null;
let allReminders = [];
let allTasks = [];
let allNotes = [];

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const pageLink = document.querySelector(`.nav-link[onclick*="${pageId}"]`);
    if (pageLink) pageLink.classList.add('active');

    // Close sidebar on mobile when navigating
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }

    if (pageId === 'dashboard-page') {
        loadDashboard();
    } else if (pageId === 'reminders-page') {
        loadReminders();
    } else if (pageId === 'tasks-page') {
        loadTasks();
    } else if (pageId === 'notes-page') {
        loadNotes();
    } else if (pageId === 'settings-page') {
        loadSettings();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        // Close sidebar when clicking outside on mobile
        if (window.innerWidth <= 768) {
            document.addEventListener('click', closeSidebarOnOutsideClick);
        }
    }
}

function closeSidebarOnOutsideClick(e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.sidebar-toggle');

    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
        document.removeEventListener('click', closeSidebarOnOutsideClick);
    }
}

function toggleDarkMode() {
    const isDarkMode = document.getElementById('settings-dark-mode').checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    if (currentUser) {
        updateUserDarkMode(isDarkMode);
    }
    localStorage.setItem('darkMode', isDarkMode);
}

function insertTag(tag) {
    const textarea = document.getElementById('note-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    let insertText = '';
    if (tag === 'b') insertText = `<b>${selectedText}</b>`;
    else if (tag === 'i') insertText = `<i>${selectedText}</i>`;
    else if (tag === 'u') insertText = `<u>${selectedText}</u>`;

    textarea.value = beforeText + insertText + afterText;
}

async function register() {
    const form = document.getElementById('register-form');
    const formData = new FormData(form);

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const timezone = document.getElementById('register-timezone').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, timezone })
        });

        const data = await response.json();

        if (response.ok) {
            accessToken = data.access;
            currentUser = data.user;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showPage('dashboard-page');
            document.getElementById('user-name').textContent = currentUser.name;
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during registration');
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            accessToken = data.access;
            currentUser = data.user;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showPage('dashboard-page');
            document.getElementById('user-name').textContent = currentUser.name;

            const darkMode = localStorage.getItem('darkMode') === 'true';
            if (darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('settings-dark-mode').checked = true;
            }
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during login');
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    accessToken = null;
    currentUser = null;
    showPage('login-page');
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
}

function openReminderModal() {
    document.getElementById('reminder-modal').classList.add('active');
}

function closeReminderModal() {
    document.getElementById('reminder-modal').classList.remove('active');
    document.getElementById('reminder-form').reset();
}

function openTaskModal() {
    document.getElementById('task-modal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    document.getElementById('task-form').reset();
}

function openNoteModal() {
    // Redirect to diary editor instead of modal
    openDiaryEditor();
}

function closeNoteModal() {
    // Deprecated - using diary editor instead
    const modal = document.getElementById('note-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('note-form').reset();
    }
}

async function saveReminder(event) {
    event.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById('reminder-title').value;
    const description = document.getElementById('reminder-description').value;
    const reminderDate = document.getElementById('reminder-datetime').value;
    const category = document.getElementById('reminder-category').value;

    try {
        const response = await fetch(`${API_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                title,
                description,
                reminder_date: reminderDate,
                category,
                timezone: currentUser.timezone
            })
        });

        if (response.ok) {
            closeReminderModal();
            loadReminders();
        } else {
            alert('Error saving reminder');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving reminder');
    }
}

async function saveTask(event) {
    event.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                title,
                description,
                due_date: dueDate || null,
                priority
            })
        });

        if (response.ok) {
            closeTaskModal();
            loadTasks();
        } else {
            alert('Error saving task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving task');
    }
}

async function saveNote(event) {
    event.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById('note-title').value;
    const body = document.getElementById('note-body').value;
    const tagsInput = document.getElementById('note-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                title,
                body,
                tags
            })
        });

        if (response.ok) {
            closeNoteModal();
            loadNotes();
        } else {
            alert('Error saving note');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving note');
    }
}

async function deleteReminder(reminderId) {
    if (!confirm('Delete this reminder?')) return;

    try {
        const response = await fetch(`${API_URL}/reminders/${reminderId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            loadReminders();
        } else {
            alert('Error deleting reminder');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            loadTasks();
        } else {
            alert('Error deleting task');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;

    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            loadNotes();
        } else {
            alert('Error deleting note');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function completeReminder(reminderId) {
    try {
        const response = await fetch(`${API_URL}/reminders/${reminderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ status: 'completed' })
        });

        if (response.ok) {
            loadReminders();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function completeTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ status: 'completed' })
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function toggleNotePin(noteId, isPinned) {
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ is_pinned: !isPinned })
        });

        if (response.ok) {
            loadNotes();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadReminders() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/reminders?user_id=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        allReminders = await response.json();
        renderReminders(allReminders);
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

async function loadTasks() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/tasks?user_id=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        allTasks = await response.json();
        renderTasks(allTasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadNotes() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/notes?user_id=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        allNotes = await response.json();
        renderNotes(allNotes);
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

function renderReminders(reminders) {
    const container = document.getElementById('reminders-list');
    container.innerHTML = '';

    if (reminders.length === 0) {
        container.innerHTML = '<p>No reminders yet</p>';
        return;
    }

    reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.reminder_date);
        const isCompleted = reminder.status === 'completed';

        const html = `
            <div class="reminder-item ${isCompleted ? 'completed' : ''}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${reminder.title}</div>
                        <div class="card-meta">${reminderDate.toLocaleString()}</div>
                        ${reminder.description ? `<p>${reminder.description}</p>` : ''}
                    </div>
                    <span class="badge badge-${reminder.status}">${reminder.status}</span>
                </div>
                <span class="badge" style="background-color: #e3f2fd; color: #0066cc;">${reminder.category}</span>
                <div class="card-actions">
                    ${!isCompleted ? `<button class="btn-small-action" onclick="completeReminder(${reminder.id})">Complete</button>` : ''}
                    <button class="btn-small-action" onclick="deleteReminder(${reminder.id})">Delete</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderTasks(tasks) {
    const container = document.getElementById('tasks-list');
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = '<p>No tasks yet</p>';
        return;
    }

    tasks.forEach(task => {
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : 'No deadline';
        const isCompleted = task.status === 'completed';

        const html = `
            <div class="task-item ${isCompleted ? 'completed' : ''}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${task.title}</div>
                        <div class="card-meta">${dueDate}</div>
                        ${task.description ? `<p>${task.description}</p>` : ''}
                    </div>
                    <span class="badge badge-${task.priority}">${task.priority}</span>
                </div>
                <span class="badge badge-${task.status}">${task.status}</span>
                <div class="card-actions">
                    ${task.status !== 'completed' ? `<button class="btn-small-action" onclick="completeTask(${task.id})">Complete</button>` : ''}
                    <button class="btn-small-action" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderNotes(notes) {
    const container = document.getElementById('notes-list');
    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = '<p>No diary entries yet</p>';
        return;
    }

    const pinnedNotes = notes.filter(n => n.is_pinned);
    const unpinnedNotes = notes.filter(n => !n.is_pinned);

    const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

    sortedNotes.forEach(note => {
        const createdDate = new Date(note.created_at).toLocaleDateString();
        const tagsHtml = note.tags ? note.tags.map(tag => `<span class="badge">${tag}</span>`).join('') : '';

        const html = `
            <div class="note-item">
                <div class="card-header">
                    <div>
                        <div class="card-title">${note.title}</div>
                        <div class="card-meta">${createdDate}</div>
                        <p>${note.body.substring(0, 100)}...</p>
                        ${tagsHtml}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-small-action" onclick="openDiaryEditor(${note.id})">Edit</button>
                    <button class="btn-small-action" onclick="toggleNotePin(${note.id}, ${note.is_pinned})">${note.is_pinned ? 'Unpin' : 'Pin'}</button>
                    <button class="btn-small-action" onclick="deleteNote(${note.id})">Delete</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}

function filterReminders() {
    const statusFilter = document.getElementById('reminder-status-filter').value;
    const categoryFilter = document.getElementById('reminder-category-filter').value;

    let filtered = allReminders;

    if (statusFilter) {
        filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (categoryFilter) {
        filtered = filtered.filter(r => r.category === categoryFilter);
    }

    renderReminders(filtered);
}

function filterTasks() {
    const statusFilter = document.getElementById('task-status-filter').value;
    const priorityFilter = document.getElementById('task-priority-filter').value;

    let filtered = allTasks;

    if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (priorityFilter) {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    renderTasks(filtered);
}

function searchNotes() {
    const query = document.getElementById('note-search').value.toLowerCase();

    const filtered = allNotes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
    );

    renderNotes(filtered);
}

async function loadDashboard() {
    if (!currentUser) return;

    try {
        const [remindersRes, tasksRes, notesRes] = await Promise.all([
            fetch(`${API_URL}/reminders?user_id=${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }),
            fetch(`${API_URL}/tasks?user_id=${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }),
            fetch(`${API_URL}/notes?user_id=${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
        ]);

        const reminders = await remindersRes.json();
        const tasks = await tasksRes.json();
        const notes = await notesRes.json();

        document.getElementById('total-reminders').textContent = reminders.length;
        document.getElementById('total-tasks').textContent = tasks.length;
        document.getElementById('total-notes').textContent = notes.length;

        const completedToday = tasks.filter(t => t.status === 'completed').length;
        document.getElementById('completed-today').textContent = completedToday;

        const upcomingReminders = reminders.filter(r => r.status === 'pending').slice(0, 3);
        renderUpcomingReminders(upcomingReminders);

        const recentTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);
        renderRecentTasks(recentTasks);

        const pinnedNotes = notes.filter(n => n.is_pinned).slice(0, 3);
        renderPinnedNotes(pinnedNotes);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderUpcomingReminders(reminders) {
    const container = document.getElementById('upcoming-reminders');
    container.innerHTML = '';

    reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.reminder_date).toLocaleDateString();
        const html = `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${reminder.title}</strong>
                <div style="font-size: 12px; color: #999;">${reminderDate}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderRecentTasks(tasks) {
    const container = document.getElementById('recent-tasks');
    container.innerHTML = '';

    tasks.forEach(task => {
        const html = `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${task.title}</strong>
                <div style="font-size: 12px; color: #999;">Priority: ${task.priority}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderPinnedNotes(notes) {
    const container = document.getElementById('pinned-notes');
    container.innerHTML = '';

    notes.forEach(note => {
        const html = `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${note.title}</strong>
                <div style="font-size: 12px; color: #999;">${note.body.substring(0, 50)}...</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

async function loadSettings() {
    if (!currentUser) return;

    document.getElementById('settings-name').value = currentUser.name;
    document.getElementById('settings-email').value = currentUser.email;
    document.getElementById('settings-dark-mode').checked = currentUser.dark_mode;
}

async function updateProfile() {
    if (!currentUser) return;

    const name = document.getElementById('settings-name').value;

    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('user-name').textContent = currentUser.name;
            alert('Profile updated');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating profile');
    }
}

async function updatePassword() {
    if (!currentUser) return;

    const newPassword = document.getElementById('settings-new-password').value;
    const confirmPassword = document.getElementById('settings-confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (response.ok) {
            alert('Password changed');
            document.getElementById('settings-new-password').value = '';
            document.getElementById('settings-confirm-password').value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error changing password');
    }
}

async function updateUserDarkMode(isDarkMode) {
    if (!currentUser) return;

    try {
        await fetch(`${API_URL}/users/${currentUser.id}/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ dark_mode: isDarkMode })
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Diary Editor Functions
let currentDiaryNote = null;
let diaryEdited = false;

function openDiaryEditor(noteId = null) {
    if (noteId) {
        const note = allNotes.find(n => n.id === noteId);
        if (note) {
            currentDiaryNote = note;
            document.getElementById('diary-title').value = note.title;
            document.getElementById('diary-editor').innerHTML = note.body || '';
            document.getElementById('diary-tags').value = note.tags ? note.tags.join(', ') : '';
            diaryEdited = false;
            updateDiaryStatus();
        }
    } else {
        currentDiaryNote = null;
        document.getElementById('diary-title').value = '';
        document.getElementById('diary-editor').innerHTML = '';
        document.getElementById('diary-tags').value = '';
        diaryEdited = false;
        updateDiaryStatus();
    }
    showPage('diary-editor-page');
}

function goBackToDiaryList() {
    if (diaryEdited) {
        const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmed) return;
    }
    currentDiaryNote = null;
    diaryEdited = false;
    showPage('notes-page');
}

function markDiaryEdited() {
    diaryEdited = true;
    updateDiaryStatus();
}

function updateDiaryStatus() {
    const statusEl = document.getElementById('diary-status');
    if (diaryEdited) {
        statusEl.textContent = 'Unsaved';
        statusEl.classList.remove('saved');
    } else {
        statusEl.textContent = 'Saved';
        statusEl.classList.add('saved');
    }
}

async function saveDiaryEntry() {
    const title = document.getElementById('diary-title').value.trim();
    const body = document.getElementById('diary-editor').innerHTML;
    const tagsInput = document.getElementById('diary-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    if (!title) {
        alert('Please enter a title for your diary entry');
        return;
    }

    if (!body.trim()) {
        alert('Please write something in your diary entry');
        return;
    }

    try {
        const method = currentDiaryNote ? 'PATCH' : 'POST';
        const url = currentDiaryNote
            ? `${API_URL}/notes/${currentDiaryNote.id}/`
            : `${API_URL}/notes/`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                title: title,
                body: body,
                tags: tags,
                is_pinned: currentDiaryNote?.is_pinned || false,
                is_archived: currentDiaryNote?.is_archived || false
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentDiaryNote = data;
            diaryEdited = false;
            updateDiaryStatus();

            // Show success message
            showNotification('Diary entry saved successfully!');

            // Reload notes and go back
            setTimeout(() => {
                loadNotes();
                goBackToDiaryList();
            }, 500);
        } else {
            alert('Failed to save diary entry');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving diary entry');
    }
}

function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('diary-editor').focus();
    markDiaryEdited();
}

function changeFontFamily(font) {
    if (font) {
        document.execCommand('fontName', false, font);
    }
    document.getElementById('diary-editor').focus();
    markDiaryEdited();
}

function changeFontSize(size) {
    if (size) {
        document.execCommand('fontSize', false, size);
    }
    document.getElementById('diary-editor').focus();
    markDiaryEdited();
}

function updateWordCount() {
    const editor = document.getElementById('diary-editor');
    const text = editor.innerText;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;

    document.getElementById('word-count').textContent = `Words: ${words}`;
    document.getElementById('char-count').textContent = `Characters: ${chars}`;
}

// Track changes in diary editor
document.addEventListener('DOMContentLoaded', function () {
    const diaryEditor = document.getElementById('diary-editor');
    if (diaryEditor) {
        diaryEditor.addEventListener('input', () => {
            markDiaryEdited();
            updateWordCount();
        });
        diaryEditor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    saveDiaryEntry();
                }
            }
        });
    }
});

function showNotification(message) {
    // Simple notification - you can enhance this
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #5cb85c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Detection and Initialization
    initializeMobileFeatures();

    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        accessToken = savedToken;
        currentUser = JSON.parse(savedUser);
        document.getElementById('user-name').textContent = currentUser.name;
        showPage('dashboard-page');

        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    } else {
        showPage('login-page');
    }

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });

    document.getElementById('reminder-form').addEventListener('submit', saveReminder);
    document.getElementById('task-form').addEventListener('submit', saveTask);
    document.getElementById('note-form').addEventListener('submit', saveNote);

    document.addEventListener('click', function (event) {
        if (event.target.closest('.modal') && event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
});

// Mobile Features Initialization
function initializeMobileFeatures() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Prevent double tap zoom on buttons
        document.addEventListener('touchstart', function () { }, { passive: true });

        // Add mobile class to body
        document.body.classList.add('mobile-device');

        // Handle viewport height on mobile (address bars)
        handleMobileViewportHeight();

        // Add swipe-to-close for sidebar
        initializeSidebarSwipe();

        // Optimize touch targets
        optimizeTouchTargets();
    }

    // Handle window resize for responsive behavior
    window.addEventListener('resize', handleResponsiveResize);
}

function handleMobileViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

function initializeSidebarSwipe() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 100;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0 && sidebar.classList.contains('open')) {
                // Swiped left - close sidebar
                sidebar.classList.remove('open');
            } else if (difference < 0 && !sidebar.classList.contains('open') && touchStartX < 50) {
                // Swiped right from left edge - open sidebar
                sidebar.classList.add('open');
            }
        }
    }
}

function optimizeTouchTargets() {
    // Ensure all interactive elements meet 44px minimum touch target
    const interactiveElements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
    interactiveElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const height = parseInt(style.height);
        if (height < 44) {
            el.style.minHeight = '44px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
        }
    });
}

function handleResponsiveResize() {
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');

    if (!isMobile && sidebar && sidebar.classList.contains('open')) {
        // Close sidebar when resizing to desktop
        sidebar.classList.remove('open');
    }

    // Re-optimize touch targets on resize
    if (isMobile) {
        optimizeTouchTargets();
    }
}
