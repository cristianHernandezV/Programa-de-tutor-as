const STORAGE_KEYS = {
  users: 'todo_users',
  currentUser: 'todo_current_user',
  theme: 'todo_theme'
};

const state = {
  currentUser: null,
  activeFilter: 'all',
  searchTerm: '',
  sortBy: 'created',
  editingTaskId: null
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  bindEvents();
  initializeTheme();
  updateTodayLabel();
  restoreSession();
});

function cacheElements() {
  const ids = [
    'auth-view', 'dashboard-view', 'login-form', 'register-form', 'login-message', 'register-message',
    'today-label', 'user-menu', 'user-dropdown', 'user-avatar', 'user-name', 'logout-button', 'welcome-name',
    'all-count', 'pending-count', 'completed-count', 'task-period', 'task-title', 'add-task-button',
    'stat-total', 'stat-pending', 'stat-progress', 'search-input', 'sort-select', 'task-list', 'empty-state',
    'empty-title', 'empty-copy', 'empty-action', 'task-modal', 'task-form', 'modal-title', 'modal-submit',
    'modal-close', 'modal-cancel', 'task-title-input', 'task-notes-input', 'task-priority-input', 'task-due-input'
  ];
  ids.forEach((id) => { elements[id] = document.getElementById(id); });
  elements.authTabs = document.querySelectorAll('[data-auth-tab]');
  elements.filterButtons = document.querySelectorAll('[data-filter]');
  elements.themeToggles = document.querySelectorAll('[data-theme-toggle]');
}

function bindEvents() {
  elements.authTabs.forEach((tab) => tab.addEventListener('click', () => switchAuthMode(tab.dataset.authTab)));
  elements['login-form'].addEventListener('submit', handleLogin);
  elements['register-form'].addEventListener('submit', handleRegister);
  elements['logout-button'].addEventListener('click', logout);
  elements.themeToggles.forEach((toggle) => toggle.addEventListener('click', toggleTheme));
  elements['user-menu'].addEventListener('click', toggleUserMenu);
  elements['add-task-button'].addEventListener('click', () => openTaskModal());
  elements['empty-action'].addEventListener('click', () => openTaskModal());
  elements['modal-close'].addEventListener('click', closeTaskModal);
  elements['modal-cancel'].addEventListener('click', closeTaskModal);
  elements['task-modal'].addEventListener('click', (event) => { if (event.target === elements['task-modal']) closeTaskModal(); });
  elements['task-form'].addEventListener('submit', saveTask);
  elements['search-input'].addEventListener('input', (event) => { state.searchTerm = event.target.value.trim().toLowerCase(); renderTasks(); });
  elements['sort-select'].addEventListener('change', (event) => { state.sortBy = event.target.value; renderTasks(); });
  elements.filterButtons.forEach((button) => button.addEventListener('click', () => { state.activeFilter = button.dataset.filter; updateFilterButtons(); renderTasks(); }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeTaskModal(); elements['user-dropdown'].classList.add('is-hidden'); } });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  applyTheme(nextTheme);
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  elements.themeToggles.forEach((toggle) => {
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
    toggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
    toggle.querySelector('.theme-label').textContent = isDark ? 'Tema claro' : 'Tema oscuro';
  });
}

function getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); }
function saveUsers(users) { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }
function getTasks() { return state.currentUser ? state.currentUser.tasks || [] : []; }

function restoreSession() {
  const email = localStorage.getItem(STORAGE_KEYS.currentUser);
  const user = getUsers().find((candidate) => candidate.email === email);
  if (user) startSession(user);
}

function switchAuthMode(mode) {
  const isLogin = mode === 'login';
  elements.authTabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.authTab === mode));
  elements['login-form'].classList.toggle('is-hidden', !isLogin);
  elements['register-form'].classList.toggle('is-hidden', isLogin);
  clearMessages();
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get('name').trim();
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');
  const users = getUsers();
  if (users.some((user) => user.email === email)) { showMessage('register-message', 'Ya existe una cuenta con ese correo.'); return; }
  const newUser = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, email, password, tasks: [] };
  users.push(newUser);
  saveUsers(users);
  event.currentTarget.reset();
  startSession(newUser);
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');
  const user = getUsers().find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) { showMessage('login-message', 'Correo o contraseña incorrectos.'); return; }
  event.currentTarget.reset();
  startSession(user);
}

function startSession(user) {
  state.currentUser = user;
  localStorage.setItem(STORAGE_KEYS.currentUser, user.email);
  elements['auth-view'].classList.add('is-hidden');
  elements['dashboard-view'].classList.remove('is-hidden');
  elements['user-name'].textContent = user.name;
  elements['welcome-name'].textContent = user.name.split(' ')[0];
  elements['user-avatar'].textContent = user.name.charAt(0).toUpperCase();
  state.activeFilter = 'all';
  updateFilterButtons();
  renderTasks();
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  state.currentUser = null;
  elements['dashboard-view'].classList.add('is-hidden');
  elements['auth-view'].classList.remove('is-hidden');
  elements['user-dropdown'].classList.add('is-hidden');
  switchAuthMode('login');
}

function toggleUserMenu() {
  const dropdown = elements['user-dropdown'];
  dropdown.classList.toggle('is-hidden');
  elements['user-menu'].setAttribute('aria-expanded', String(!dropdown.classList.contains('is-hidden')));
}

function renderTasks() {
  if (!state.currentUser) return;
  const allTasks = getTasks();
  const visibleTasks = getVisibleTasks(allTasks);
  elements['task-list'].innerHTML = visibleTasks.map((task, index) => createTaskMarkup(task, index)).join('');
  elements['task-list'].classList.toggle('is-hidden', visibleTasks.length === 0);
  elements['empty-state'].classList.toggle('is-hidden', visibleTasks.length !== 0);
  updateSummary(allTasks);
  updateEmptyState(allTasks);
  document.querySelectorAll('[data-task-action]').forEach((button) => button.addEventListener('click', handleTaskAction));
}

function getVisibleTasks(tasks) {
  return tasks.filter((task) => {
    const matchesFilter = state.activeFilter === 'all' || (state.activeFilter === 'completed' ? task.completed : !task.completed);
    const searchable = `${task.title} ${task.notes}`.toLowerCase();
    return matchesFilter && searchable.includes(state.searchTerm);
  }).sort((first, second) => {
    if (state.sortBy === 'priority') return priorityValue(second.priority) - priorityValue(first.priority);
    if (state.sortBy === 'dueDate') return (first.dueDate || '9999') .localeCompare(second.dueDate || '9999');
    return second.createdAt - first.createdAt;
  });
}

function createTaskMarkup(task, index) {
  const dueLabel = task.dueDate ? formatDate(task.dueDate) : '';
  const overdue = task.dueDate && !task.completed && new Date(`${task.dueDate}T23:59:59`) < new Date();
  const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' }[task.priority];
  return `<article class="task-item ${task.completed ? 'is-complete' : ''}" style="animation-delay: ${index * 40}ms">
    <button class="task-check" type="button" aria-label="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}" data-task-action="toggle" data-task-id="${task.id}"></button>
    <div class="task-copy"><h3>${escapeHtml(task.title)}</h3>${task.notes ? `<p>${escapeHtml(task.notes)}</p>` : ''}</div>
    <div class="task-meta"><span class="priority priority-${task.priority}">${priorityLabel}</span>${dueLabel ? `<span class="due-date ${overdue ? 'overdue' : ''}">${overdue ? 'Vencida · ' : ''}${dueLabel}</span>` : ''}<span class="task-actions"><button class="icon-button" type="button" title="Editar tarea" aria-label="Editar tarea" data-task-action="edit" data-task-id="${task.id}">✎</button><button class="icon-button" type="button" title="Eliminar tarea" aria-label="Eliminar tarea" data-task-action="delete" data-task-id="${task.id}">×</button></span></div>
  </article>`;
}

function handleTaskAction(event) {
  const { taskAction, taskId } = event.currentTarget.dataset;
  if (taskAction === 'toggle') updateTask(taskId, { completed: !getTasks().find((task) => task.id === taskId).completed });
  if (taskAction === 'edit') openTaskModal(taskId);
  if (taskAction === 'delete') deleteTask(taskId);
}

function openTaskModal(taskId = null) {
  state.editingTaskId = taskId;
  const task = taskId ? getTasks().find((item) => item.id === taskId) : null;
  elements['task-form'].reset();
  elements['modal-title'].textContent = task ? 'Editar tarea' : 'Nueva tarea';
  elements['modal-submit'].textContent = task ? 'Guardar cambios' : 'Guardar tarea';
  if (task) {
    elements['task-title-input'].value = task.title;
    elements['task-notes-input'].value = task.notes;
    elements['task-priority-input'].value = task.priority;
    elements['task-due-input'].value = task.dueDate;
  }
  elements['task-modal'].classList.remove('is-hidden');
  elements['task-title-input'].focus();
}

function closeTaskModal() { elements['task-modal'].classList.add('is-hidden'); state.editingTaskId = null; }

function saveTask(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const taskData = { title: formData.get('title').trim(), notes: formData.get('notes').trim(), priority: formData.get('priority'), dueDate: formData.get('dueDate') };
  if (state.editingTaskId) updateTask(state.editingTaskId, taskData); else state.currentUser.tasks.push({ ...taskData, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), completed: false, createdAt: Date.now() });
  persistCurrentUser();
  closeTaskModal();
  renderTasks();
}

function updateTask(taskId, changes) { const task = getTasks().find((item) => item.id === taskId); if (task) Object.assign(task, changes); persistCurrentUser(); renderTasks(); }
function deleteTask(taskId) { state.currentUser.tasks = getTasks().filter((task) => task.id !== taskId); persistCurrentUser(); renderTasks(); }
function persistCurrentUser() { const users = getUsers().map((user) => user.email === state.currentUser.email ? state.currentUser : user); saveUsers(users); }
function priorityValue(priority) { return { high: 3, medium: 2, low: 1 }[priority] || 0; }
function formatDate(date) { return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`)); }
function updateTodayLabel() { elements['today-label'].textContent = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); }
function updateFilterButtons() { elements.filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === state.activeFilter)); }
function updateSummary(tasks) { const completed = tasks.filter((task) => task.completed).length; elements['all-count'].textContent = tasks.length; elements['pending-count'].textContent = tasks.length - completed; elements['completed-count'].textContent = completed; elements['stat-total'].textContent = tasks.length; elements['stat-pending'].textContent = tasks.length - completed; elements['stat-progress'].textContent = tasks.length ? `${Math.round((completed / tasks.length) * 100)}%` : '0%'; }
function updateEmptyState(tasks) { const filteredByView = state.activeFilter === 'all' ? tasks : tasks.filter((task) => state.activeFilter === 'completed' ? task.completed : !task.completed); const hasSearch = state.searchTerm.length > 0; elements['empty-title'].textContent = hasSearch ? 'Sin coincidencias' : state.activeFilter === 'completed' && filteredByView.length === 0 ? 'Aún no hay logros' : 'Todo despejado'; elements['empty-copy'].textContent = hasSearch ? 'Prueba con otra palabra de búsqueda.' : state.activeFilter === 'completed' && filteredByView.length === 0 ? 'Completa una tarea y aparecerá aquí.' : 'Añade una tarea y empieza a avanzar.'; elements['empty-action'].classList.toggle('is-hidden', hasSearch || state.activeFilter === 'completed'); }
function showMessage(id, message) { elements[id].textContent = message; }
function clearMessages() { elements['login-message'].textContent = ''; elements['register-message'].textContent = ''; }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character])); }
