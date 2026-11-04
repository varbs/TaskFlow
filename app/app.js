/* TaskFlow demo app: vanilla JS, localStorage persistence.
 * Implements the selector contract in docs/SPECIFICATION.md section 7. */
(function () {
  'use strict';

  var USER = { email: 'user@test.com', password: 'Password123' };
  var KEYS = { session: 'tf_session', tasks: 'tf_tasks', profile: 'tf_profile' };
  // Seed due dates are relative to today so they never fall into the past.
  var SEED_TASKS = [
    { id: 1, title: 'Write test plan', priority: 'Medium', due: daysFromTodayISO(2), done: false },
    { id: 2, title: 'Review pull request', priority: 'High', due: daysFromTodayISO(1), done: false },
    { id: 3, title: 'Update README', priority: 'Low', due: daysFromTodayISO(6), done: true },
    { id: 4, title: 'Book team retro', priority: 'Medium', due: daysFromTodayISO(8), done: false },
  ];
  var SEED_PROFILE = { fullName: 'Test User', email: 'user@test.com', phone: '5551234567' };

  var root = document.getElementById('root');
  var state = { filter: 'all', search: '', editingId: null, editError: '', addError: '', profileOk: false };

  // ---------- storage ----------
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) { localStorage.setItem(key, JSON.stringify(fallback)); return clone(fallback); }
      return JSON.parse(raw);
    } catch (e) { return clone(fallback); }
  }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function loggedIn() { return localStorage.getItem(KEYS.session) === '1'; }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function todayISO() { return daysFromTodayISO(0); }
  function daysFromTodayISO(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function validateTask(title, due) {
    var t = title.trim();
    if (!t) return 'Title is required.';
    if (t.length > 50) return 'Title must be 50 characters or fewer.';
    if (due && due < todayISO()) return 'Due date must be today or later.';
    return '';
  }

  // ---------- routing ----------
  function go(path, replace) {
    if (location.pathname !== path) history[replace ? 'replaceState' : 'pushState']({}, '', path);
    render();
  }
  window.addEventListener('popstate', render);

  function render() {
    var path = location.pathname;
    if (path === '/' || (path !== '/login' && path !== '/tasks' && path !== '/profile')) {
      return go(loggedIn() ? '/tasks' : '/login', true);
    }
    if (path === '/login') {
      if (loggedIn()) return go('/tasks', true);
      return renderLogin();
    }
    if (!loggedIn()) return go('/login', true);
    if (path === '/tasks') return renderTasks();
    return renderProfile();
  }

  function header(current) {
    return '<header><div class="bar"><span class="brand">TaskFlow</span>' +
      '<nav aria-label="Main">' +
      '<a href="/tasks" data-testid="nav-tasks"' + (current === 'tasks' ? ' aria-current="page"' : '') + '>Tasks</a>' +
      '<a href="/profile" data-testid="nav-profile"' + (current === 'profile' ? ' aria-current="page"' : '') + '>Profile</a>' +
      '</nav><button type="button" class="btn" data-testid="logout-button">Log out</button></div></header>';
  }
  function bindHeader() {
    root.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        state.editingId = null; state.editError = ''; state.addError = ''; state.profileOk = false;
        go(a.getAttribute('href'));
      });
    });
    root.querySelector('[data-testid="logout-button"]').addEventListener('click', function () {
      localStorage.removeItem(KEYS.session);
      state = { filter: 'all', search: '', editingId: null, editError: '', addError: '', profileOk: false };
      go('/login');
    });
  }

  // ---------- login ----------
  function renderLogin(error, vals) {
    vals = vals || { email: '', password: '' };
    var required = error === 'Email and password are required.';
    document.title = 'Log in - TaskFlow';
    root.innerHTML =
      '<div class="login"><section class="card stack" aria-labelledby="login-title">' +
      '<h1 id="login-title">Log in to TaskFlow</h1>' +
      (error ? '<p class="banner-err" role="alert" data-testid="login-error">' + esc(error) + '</p>' : '') +
      '<form id="login-form" novalidate class="stack">' +
      '<div class="field"><label for="email">Email</label>' +
      '<input id="email" name="email" type="email" autocomplete="username" data-testid="email-input" value="' + esc(vals.email) + '"' + (required ? ' aria-invalid="true"' : '') + '></div>' +
      '<div class="field"><label for="password">Password</label>' +
      '<input id="password" name="password" type="password" autocomplete="current-password" data-testid="password-input"' + (required ? ' aria-invalid="true"' : '') + '></div>' +
      '<button type="submit" class="btn primary" data-testid="login-button">Log in</button></form>' +
      '<p class="hint" data-testid="demo-hint" style="margin:0">Demo account: user@test.com / Password123</p>' +
      '</section></div>';
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;
      if (!email.trim() || !password) return renderLogin('Email and password are required.', { email: email });
      if (email.trim().toLowerCase() === USER.email && password === USER.password) {
        localStorage.setItem(KEYS.session, '1');
        return go('/tasks');
      }
      renderLogin('Invalid email or password.', { email: email });
    });
  }

  // ---------- tasks ----------
  function visibleTasks(tasks) {
    var q = state.search.trim().toLowerCase();
    return tasks.filter(function (t) {
      if (state.filter === 'active' && t.done) return false;
      if (state.filter === 'completed' && !t.done) return false;
      return !q || t.title.toLowerCase().indexOf(q) !== -1;
    });
  }

  function rowHTML(t) {
    if (t.id === state.editingId) {
      return '<li class="row" data-testid="task-item"><div class="edit-row">' +
        '<div class="field e1"><label for="edit-title">Title</label>' +
        '<input id="edit-title" type="text" maxlength="50" data-testid="edit-title-input" value="' + esc(t.title) + '"' + (state.editError ? ' aria-invalid="true"' : '') + '></div>' +
        '<div class="field e2"><label for="edit-priority">Priority</label><select id="edit-priority" data-testid="edit-priority-select">' +
        ['Low', 'Medium', 'High'].map(function (p) { return '<option' + (p === t.priority ? ' selected' : '') + '>' + p + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field e3"><label for="edit-due">Due date</label><input id="edit-due" type="date" data-testid="edit-due-input" value="' + esc(t.due || '') + '"></div>' +
        '<div style="display:flex;gap:8px;margin-top:26px"><button type="button" class="btn primary" data-testid="save-button">Save</button>' +
        '<button type="button" class="btn" data-testid="cancel-button">Cancel</button></div>' +
        '<p class="err" role="alert" data-testid="edit-error" style="flex-basis:100%;margin:0">' + esc(state.editError) + '</p>' +
        '</div></li>';
    }
    return '<li class="row" data-testid="task-item" data-id="' + t.id + '">' +
      '<input type="checkbox" data-testid="task-checkbox" aria-label="Mark ' + esc(t.title) + ' as completed"' + (t.done ? ' checked' : '') + '>' +
      '<span class="title' + (t.done ? ' done' : '') + '" data-testid="task-title">' + esc(t.title) + '</span>' +
      '<span class="badge ' + t.priority + '" data-testid="task-priority">' + t.priority + '</span>' +
      '<span class="due" data-testid="task-due">' + esc(t.due || '') + '</span>' +
      '<button type="button" class="btn" data-testid="edit-button">Edit</button>' +
      '<button type="button" class="btn" data-testid="delete-button">Delete</button></li>';
  }

  function renderTasks() {
    var tasks = load(KEYS.tasks, SEED_TASKS);
    var shown = visibleTasks(tasks);
    var left = tasks.filter(function (t) { return !t.done; }).length;
    var anyDone = tasks.some(function (t) { return t.done; });
    document.title = 'Tasks - TaskFlow';

    var focusSearch = document.activeElement && document.activeElement.getAttribute &&
      document.activeElement.getAttribute('data-testid') === 'search-input';
    var addVals = { title: '', priority: 'Medium', due: '' };
    var prev = root.querySelector('#task-title');
    if (prev && state.addError) {
      addVals = { title: prev.value, priority: root.querySelector('#task-priority').value, due: root.querySelector('#task-due').value };
    }

    function fbtn(id, label) {
      return '<button type="button" class="btn" data-testid="filter-' + id + '" aria-pressed="' + (state.filter === id) + '">' + label + '</button>';
    }

    root.innerHTML = header('tasks') +
      '<main>' +
      '<section class="card" aria-labelledby="add-title"><h2 id="add-title">Add task</h2>' +
      '<form id="add-form" class="form-row" novalidate>' +
      '<div class="field grow2"><label for="task-title">Title</label>' +
      '<input id="task-title" type="text" maxlength="50" data-testid="task-title-input" aria-describedby="task-title-hint add-task-error" value="' + esc(addVals.title) + '"' + (state.addError ? ' aria-invalid="true"' : '') + '>' +
      '<span id="task-title-hint" class="hint">Required, max 50 characters</span></div>' +
      '<div class="field grow1"><label for="task-priority">Priority</label><select id="task-priority" data-testid="task-priority-select">' +
      ['Low', 'Medium', 'High'].map(function (p) { return '<option' + (p === addVals.priority ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
      '<div class="field grow3"><label for="task-due">Due date</label>' +
      '<input id="task-due" type="date" data-testid="task-due-input" aria-describedby="task-due-hint" value="' + esc(addVals.due) + '">' +
      '<span id="task-due-hint" class="hint">Must be today or later</span></div>' +
      '<button type="submit" class="btn primary" data-testid="add-task-button" style="margin-top:26px">Add task</button></form>' +
      '<p id="add-task-error" class="err" role="alert" data-testid="add-task-error" style="margin:12px 0 0;min-height:20px;font-size:14px">' + esc(state.addError) + '</p></section>' +
      '<div class="toolbar"><input type="search" aria-label="Search tasks" placeholder="Search tasks" data-testid="search-input" value="' + esc(state.search) + '">' +
      '<div class="group" role="group" aria-label="Filter tasks">' + fbtn('all', 'All') + fbtn('active', 'Active') + fbtn('completed', 'Completed') + '</div></div>' +
      '<section class="card" style="padding:0" aria-label="Tasks">' +
      (shown.length
        ? '<ul class="list" data-testid="task-list">' + shown.map(rowHTML).join('') + '</ul>'
        : '<p class="empty" data-testid="empty-state">No tasks to show.</p>') +
      '<div class="footer"><span data-testid="items-left">' + left + (left === 1 ? ' item left' : ' items left') + '</span>' +
      '<button type="button" class="btn" data-testid="clear-completed"' + (anyDone ? '' : ' disabled') + '>Clear completed</button></div></section>' +
      '</main>';
    bindHeader();

    var search = root.querySelector('[data-testid="search-input"]');
    if (focusSearch) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
    search.addEventListener('input', function () { state.search = search.value; renderTasks(); });

    ['all', 'active', 'completed'].forEach(function (id) {
      root.querySelector('[data-testid="filter-' + id + '"]').addEventListener('click', function () { state.filter = id; renderTasks(); });
    });

    document.getElementById('add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var title = document.getElementById('task-title').value;
      var due = document.getElementById('task-due').value;
      var priority = document.getElementById('task-priority').value;
      var err = validateTask(title, due);
      state.addError = err;
      if (err) return renderTasks();
      var all = load(KEYS.tasks, SEED_TASKS);
      var nextId = all.reduce(function (m, t) { return Math.max(m, t.id); }, 0) + 1;
      all.push({ id: nextId, title: title.trim(), priority: priority, due: due, done: false });
      save(KEYS.tasks, all);
      renderTasks();
    });

    root.querySelectorAll('[data-testid="task-item"]').forEach(function (li) {
      var id = Number(li.getAttribute('data-id'));
      var cb = li.querySelector('[data-testid="task-checkbox"]');
      if (cb) cb.addEventListener('change', function () {
        var all = load(KEYS.tasks, SEED_TASKS);
        all.forEach(function (t) { if (t.id === id) t.done = cb.checked; });
        save(KEYS.tasks, all); renderTasks();
      });
      var edit = li.querySelector('[data-testid="edit-button"]');
      if (edit) edit.addEventListener('click', function () { state.editingId = id; state.editError = ''; renderTasks(); });
      var del = li.querySelector('[data-testid="delete-button"]');
      if (del) del.addEventListener('click', function () {
        save(KEYS.tasks, load(KEYS.tasks, SEED_TASKS).filter(function (t) { return t.id !== id; }));
        renderTasks();
      });
      var cancel = li.querySelector('[data-testid="cancel-button"]');
      if (cancel) cancel.addEventListener('click', function () { state.editingId = null; state.editError = ''; renderTasks(); });
      var saveBtn = li.querySelector('[data-testid="save-button"]');
      if (saveBtn) saveBtn.addEventListener('click', function () {
        var title = li.querySelector('[data-testid="edit-title-input"]').value;
        var priority = li.querySelector('[data-testid="edit-priority-select"]').value;
        var due = li.querySelector('[data-testid="edit-due-input"]').value;
        var err = validateTask(title, due);
        if (err) {
          state.editError = err;
          li.querySelector('[data-testid="edit-error"]').textContent = err;
          li.querySelector('[data-testid="edit-title-input"]').setAttribute('aria-invalid', 'true');
          return;
        }
        var all = load(KEYS.tasks, SEED_TASKS);
        all.forEach(function (t) { if (t.id === state.editingId) { t.title = title.trim(); t.priority = priority; t.due = due; } });
        save(KEYS.tasks, all);
        state.editingId = null; state.editError = '';
        renderTasks();
      });
    });

    root.querySelector('[data-testid="clear-completed"]').addEventListener('click', function () {
      save(KEYS.tasks, load(KEYS.tasks, SEED_TASKS).filter(function (t) { return !t.done; }));
      renderTasks();
    });
  }

  // ---------- profile ----------
  function renderProfile(errors, vals) {
    errors = errors || {};
    vals = vals || load(KEYS.profile, SEED_PROFILE);
    document.title = 'Profile - TaskFlow';
    function field(id, label, type, ac, testid, value, extra) {
      var err = errors[id];
      var desc = (extra ? id + '-hint ' : '') + (err ? id + '-error' : '');
      return '<div class="field"><label for="' + id + '">' + label + '</label>' +
        '<input id="' + id + '" type="' + type + '" autocomplete="' + ac + '" data-testid="' + testid + '" value="' + esc(value) + '"' +
        (err ? ' aria-invalid="true"' : '') + (desc ? ' aria-describedby="' + desc.trim() + '"' : '') + '>' +
        (extra ? '<span id="' + id + '-hint" class="hint">' + extra + '</span>' : '') +
        (err ? '<span id="' + id + '-error" class="err" role="alert" data-testid="' + testid.replace('-input', '-error') + '">' + esc(err) + '</span>' : '') + '</div>';
    }
    root.innerHTML = header('profile') +
      '<main class="narrow"><section class="card stack" aria-labelledby="profile-title" style="padding:28px">' +
      '<h1 id="profile-title">Profile</h1>' +
      (state.profileOk ? '<p class="banner-ok" role="status" data-testid="profile-success">Profile saved.</p>' : '') +
      '<form id="profile-form" novalidate class="stack">' +
      field('full-name', 'Full name', 'text', 'name', 'full-name-input', vals.fullName) +
      field('email', 'Email', 'email', 'email', 'email-input', vals.email) +
      field('phone', 'Phone', 'tel', 'tel', 'phone-input', vals.phone, 'Digits only, at least 7') +
      '<button type="submit" class="btn primary" data-testid="save-profile-button">Save profile</button></form></section></main>';
    bindHeader();

    var form = document.getElementById('profile-form');
    form.addEventListener('input', function () {
      var ok = root.querySelector('[data-testid="profile-success"]');
      if (ok) { ok.remove(); state.profileOk = false; }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
      };
      var errs = {};
      if (!v.fullName.trim()) errs['full-name'] = 'Full name is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errs.email = 'Enter a valid email address.';
      if (v.phone.trim() && !/^\d{7,}$/.test(v.phone.trim())) errs.phone = 'Phone must be digits only, at least 7.';
      if (Object.keys(errs).length) { state.profileOk = false; return renderProfile(errs, v); }
      save(KEYS.profile, { fullName: v.fullName.trim(), email: v.email.trim(), phone: v.phone.trim() });
      state.profileOk = true;
      renderProfile();
    });
  }

  render();
})();
