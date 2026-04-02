/* ═══════════════════════════════════════════════
   TASK MANAGER — todo.js
   Features: Add/Delete/Complete tasks, Priority,
   Deadlines, Filters, LocalStorage, Stats,
   Pomodoro with SVG ring + sessions
═══════════════════════════════════════════════ */

/* ── State ──────────────────────────────────────── */
let tasks          = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter  = 'all';
let selectedPriority = 'low';
let pomodoroState  = {
  running:   false,
  mode:      'work',       // 'work' | 'short' | 'long'
  totalSecs: 25 * 60,
  remaining: 25 * 60,
  sessions:  parseInt(localStorage.getItem('pomSessions') || '0'),
  interval:  null,
};

/* ── DOM refs ────────────────────────────────────── */
const taskInput     = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const addBtn        = document.getElementById('addBtn');
const taskList      = document.getElementById('taskList');
const emptyState    = document.getElementById('emptyState');
const filterBtns    = document.querySelectorAll('.filter-btn');
const clearDoneBtn  = document.getElementById('clearDone');
const priBtns       = document.querySelectorAll('.pri-btn');

// Stats
const statTotal   = document.getElementById('statTotal');
const statDone    = document.getElementById('statDone');
const statPending = document.getElementById('statPending');
const statOverdue = document.getElementById('statOverdue');

// Pomodoro
const timerDisplay  = document.getElementById('timerDisplay');
const timerModeLabel= document.getElementById('timerModeLabel');
const startTimerBtn = document.getElementById('startTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const startLabel    = document.getElementById('startLabel');
const startIcon     = document.getElementById('startIcon');
const ringProgress  = document.getElementById('ringProgress');
const sessionDots   = document.getElementById('sessionDots');
const modeTabs      = document.querySelectorAll('.mode-tab');

const RING_CIRCUMFERENCE = 603; // 2π × 96

/* ══════════════════════════════════════════════════
   TASKS
══════════════════════════════════════════════════ */

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function generateId() {
  return '_' + Math.random().toString(36).slice(2, 9);
}

function isOverdue(deadline) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline) < today;
}

function isToday(deadline) {
  if (!deadline) return false;
  const today = new Date().toISOString().slice(0, 10);
  return deadline === today;
}

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Add task */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 400);
    return;
  }

  const task = {
    id:       generateId(),
    text,
    deadline: deadlineInput.value || null,
    priority: selectedPriority,
    done:     false,
    created:  Date.now(),
  };

  tasks.unshift(task);
  saveTasks();

  taskInput.value    = '';
  deadlineInput.value = '';

  renderTasks();
  updateStats();
}

/* Toggle done */
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.done = !t.done;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

/* Delete task */
function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
      updateStats();
    }, 280);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
  }
}

/* Clear done tasks */
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
  updateStats();
}

/* Filter tasks */
function getFilteredTasks() {
  switch (currentFilter) {
    case 'done':    return tasks.filter(t => t.done);
    case 'pending': return tasks.filter(t => !t.done && !isOverdue(t.deadline));
    case 'overdue': return tasks.filter(t => !t.done && isOverdue(t.deadline));
    default:        return tasks;
  }
}

/* ── Render ─────────────────────────────────────── */
function renderTasks() {
  const filtered = getFilteredTasks();

  // Clear existing task items (keep emptyState node)
  Array.from(taskList.children).forEach(child => {
    if (child.id !== 'emptyState') child.remove();
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  const calSVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="3" y="4" width="14" height="14" rx="2"/>
    <line x1="3" y1="8" x2="17" y2="8"/>
    <line x1="7" y1="2" x2="7" y2="6"/>
    <line x1="13" y1="2" x2="13" y2="6"/>
  </svg>`;

  const trashSVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
    <polyline points="3 6 5 6 17 6"/>
    <path d="M8 6V4h4v2"/>
    <path d="M19 6l-1 12a2 2 0 01-2 2H4a2 2 0 01-2-2L1 6"/>
  </svg>`;

  filtered.forEach(task => {
    const overdue = !task.done && isOverdue(task.deadline);
    const today   = !task.done && isToday(task.deadline);

    const li = document.createElement('li');
    li.className = [
      'task-item',
      `task-item--${task.priority}`,
      task.done    ? 'done'    : '',
      overdue      ? 'overdue' : '',
    ].filter(Boolean).join(' ');
    li.setAttribute('data-id', task.id);

    let deadlineHTML = '';
    if (task.deadline) {
      const dlClass = overdue ? 'overdue-label' : today ? 'today-label' : '';
      const label   = overdue ? '⚠ Overdue · ' : today ? '● Today · ' : '';
      deadlineHTML = `
        <span class="task-deadline ${dlClass}">
          ${calSVG}
          ${label}${formatDeadline(task.deadline)}
        </span>`;
    }

    li.innerHTML = `
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} aria-label="Mark done">
      <div class="task-body">
        <p class="task-text">${escapeHtml(task.text)}</p>
        <div class="task-meta">
          <span class="task-badge task-badge--${task.priority}">${task.priority}</span>
          ${deadlineHTML}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn" title="Delete task" aria-label="Delete task">
          ${trashSVG}
        </button>
      </div>
    `;

    // Checkbox
    li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id));
    // Delete
    li.querySelector('.task-action-btn').addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Stats ──────────────────────────────────────── */
function updateStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const overdue = tasks.filter(t => !t.done && isOverdue(t.deadline)).length;

  animateStat(statTotal,   total);
  animateStat(statDone,    done);
  animateStat(statPending, pending);
  animateStat(statOverdue, overdue);
}

function animateStat(el, value) {
  if (el.textContent !== String(value)) {
    el.textContent = value;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  }
}

/* ══════════════════════════════════════════════════
   AUDIO — Web Audio API (no external files needed)
══════════════════════════════════════════════════ */

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/* Play a sequence of tones */
function playTones(tones) {
  try {
    const ctx = getAudioCtx();
    let time = ctx.currentTime;
    tones.forEach(({ freq, dur, type = 'sine', vol = 0.4 }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type      = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.start(time);
      osc.stop(time + dur + 0.05);
      time += dur * 0.85;
    });
  } catch (e) { /* Audio blocked — silently ignore */ }
}

/* Sound presets */
function soundWorkDone() {
  // Ascending triumphant chime
  playTones([
    { freq: 523, dur: 0.18 },   // C5
    { freq: 659, dur: 0.18 },   // E5
    { freq: 784, dur: 0.18 },   // G5
    { freq: 1047, dur: 0.45, vol: 0.5 }, // C6
  ]);
}

function soundBreakDone() {
  // Two soft bell pings — "time to refocus"
  playTones([
    { freq: 880, dur: 0.25, type: 'triangle', vol: 0.35 }, // A5
    { freq: 659, dur: 0.35, type: 'triangle', vol: 0.3  }, // E5
  ]);
}

function soundTick() {
  // Very subtle click at 10-second mark
  playTones([{ freq: 1200, dur: 0.04, type: 'square', vol: 0.06 }]);
}

/* ══════════════════════════════════════════════════
   POMODORO
══════════════════════════════════════════════════ */

const MODE_CONFIG = {
  work:  { label: 'Focus Session', inputId: 'customWork',  ring: '' },
  short: { label: 'Short Break',   inputId: 'customShort', ring: 'break-mode' },
  long:  { label: 'Long Break',    inputId: 'customLong',  ring: 'break-mode' },
};

/* Read current user-set minutes for a given mode */
function getMinsForMode(mode) {
  const el  = document.getElementById(MODE_CONFIG[mode].inputId);
  const val = parseInt(el ? el.value : 0);
  return (isNaN(val) || val < 1) ? 1 : Math.min(val, 99);
}

function setTimerMode(mode) {
  if (pomodoroState.running) stopTimer();

  pomodoroState.mode      = mode;
  const mins              = getMinsForMode(mode);
  pomodoroState.totalSecs = mins * 60;
  pomodoroState.remaining = mins * 60;

  updateTimerDisplay();
  updateRing(1);

  timerModeLabel.textContent    = MODE_CONFIG[mode].label;
  ringProgress.className        = 'ring-progress ' + MODE_CONFIG[mode].ring;
}

function startTimer() {
  if (pomodoroState.running) { stopTimer(); return; }

  // Unlock audio on first user gesture
  getAudioCtx();

  pomodoroState.running = true;
  startLabel.textContent = 'Pause';
  startIcon.innerHTML = `<rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/>`;

  pomodoroState.interval = setInterval(() => {
    pomodoroState.remaining--;
    updateTimerDisplay();
    updateRing(pomodoroState.remaining / pomodoroState.totalSecs);

    // Subtle tick every 10 seconds while > 10 s remain
    if (pomodoroState.remaining > 0 && pomodoroState.remaining % 10 === 0) {
      soundTick();
    }

    if (pomodoroState.remaining <= 0) {
      clearInterval(pomodoroState.interval);
      pomodoroState.running = false;
      onTimerComplete();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(pomodoroState.interval);
  pomodoroState.running  = false;
  startLabel.textContent = 'Start';
  startIcon.innerHTML    = `<polygon points="5,3 19,10 5,17"/>`;
}

function resetTimer() {
  stopTimer();
  setTimerMode(pomodoroState.mode);
}

function onTimerComplete() {
  startLabel.textContent = 'Start';
  startIcon.innerHTML    = `<polygon points="5,3 19,10 5,17"/>`;

  const wasWork = pomodoroState.mode === 'work';

  // Play completion sound
  if (wasWork) soundWorkDone(); else soundBreakDone();

  // Session count
  if (wasWork) {
    pomodoroState.sessions++;
    localStorage.setItem('pomSessions', pomodoroState.sessions);
    renderSessionDots();
  }

  // Browser notification
  if (Notification && Notification.permission === 'granted') {
    new Notification(wasWork ? '🎉 Focus done! Take a break.' : '⏰ Break over. Back to work!');
  }

  // Pulse ring glow
  ringProgress.style.filter = 'drop-shadow(0 0 18px rgba(59,130,246,0.9))';
  setTimeout(() => { ringProgress.style.filter = ''; }, 1800);

  // Auto-switch after short delay
  setTimeout(() => {
    setTimerMode(wasWork ? 'short' : 'work');
    // Sync the active mode tab
    modeTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.mode === (wasWork ? 'short' : 'work'));
    });
  }, 1400);
}

function updateTimerDisplay() {
  const m = Math.floor(pomodoroState.remaining / 60);
  const s = pomodoroState.remaining % 60;
  timerDisplay.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function updateRing(fraction) {
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);
}

function renderSessionDots() {
  sessionDots.innerHTML = '';
  const count = pomodoroState.sessions;
  const show  = Math.max(4, count);
  for (let i = 0; i < Math.min(show, 8); i++) {
    const dot = document.createElement('div');
    dot.className = 'session-dot' + (i < count ? ' filled' : '');
    sessionDots.appendChild(dot);
  }
}

function requestNotificationPermission() {
  if (Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/* ── Custom time input handlers ────────────────────── */
function bindCustomTimeInputs() {
  // +/− buttons
  document.querySelectorAll('.time-adj-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode  = btn.dataset.mode;
      const delta = parseInt(btn.dataset.delta);
      const input = document.getElementById(MODE_CONFIG[mode].inputId);
      let val = parseInt(input.value) + delta;
      val = Math.max(1, Math.min(99, val));
      input.value = val;
      // If this mode is currently active and timer isn't running, update display
      if (mode === pomodoroState.mode && !pomodoroState.running) {
        setTimerMode(mode);
      }
    });
  });

  // Direct typing into the number input
  ['customWork','customShort','customLong'].forEach(id => {
    const input = document.getElementById(id);
    const mode  = Object.keys(MODE_CONFIG).find(m => MODE_CONFIG[m].inputId === id);
    input.addEventListener('change', () => {
      let val = parseInt(input.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      input.value = val;
      if (mode === pomodoroState.mode && !pomodoroState.running) {
        setTimerMode(mode);
      }
    });
  });
}

/* ══════════════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════════════ */

// Add task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

// Priority buttons
priBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    priBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPriority = btn.dataset.priority;
  });
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Clear done
clearDoneBtn.addEventListener('click', clearDone);

// Pomodoro controls
startTimerBtn.addEventListener('click', startTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Mode tabs
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    setTimerMode(tab.dataset.mode);
  });
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */

function init() {
  renderTasks();
  updateStats();
  updateTimerDisplay();
  updateRing(1);
  renderSessionDots();
  requestNotificationPermission();
  bindCustomTimeInputs();
}

// Shake animation for empty input
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  .shake { animation: shake 0.4s ease; border-color: #ef4444 !important; }
`;
document.head.appendChild(style);

init();