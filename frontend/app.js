/* =============================================
   TASKFLOW — Frontend App Logic
   ============================================= */

const API = 'http://localhost:3001'; 
let allTasks = [];
let currentFilter = 'all';
let editingId = null;

// ---- Inicialização ----
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  loadTasks();
});

// ---- Verificar API ----
async function checkHealth() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    const badge = document.getElementById('status-badge');
    const label = badge.querySelector('.status-label');
    if (data.success) {
      badge.className = 'status-badge online';
      label.textContent = 'API Online';
    }
  } catch {
    const badge = document.getElementById('status-badge');
    const label = badge.querySelector('.status-label');
    badge.className = 'status-badge offline';
    label.textContent = 'API Offline';
  }
}

// ---- Carregar tarefas ----
async function loadTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Carregando tarefas...</p></div>`;
  try {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    allTasks = data.data || [];
    renderTasks();
    updateStats();
  } catch {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⚡</div><p>Não foi possível conectar à API.<br>Verifique se o backend está rodando.</p></div>`;
  }
}

// ---- Renderizar ----
function renderTasks() {
  const list = document.getElementById('task-list');
  const filtered = filter(allTasks);
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✓</div><p>Nenhuma tarefa encontrada.</p></div>`;
    return;
  }
  list.innerHTML = filtered.map(task => taskCard(task)).join('');
}

function filter(tasks) {
  if (currentFilter === 'pending') return tasks.filter(t => !t.completed);
  if (currentFilter === 'done') return tasks.filter(t => t.completed);
  return tasks;
}

function taskCard(task) {
  const date = new Date(task.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" data-testid="task-item">
      <button class="task-check" onclick="toggleTask(${task.id})" title="Marcar como ${task.completed ? 'pendente' : 'concluída'}" data-testid="check-btn-${task.id}"></button>
      <span class="task-title" data-testid="task-title-${task.id}">${escapeHtml(task.title)}</span>
      <span class="task-date">${date}</span>
      <div class="task-actions">
        <button class="task-btn edit" onclick="openEdit(${task.id})" title="Editar" data-testid="edit-btn-${task.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Excluir" data-testid="delete-btn-${task.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- Stats ----
function updateStats() {
  document.getElementById('stat-total').textContent = allTasks.length;
  document.getElementById('stat-pending').textContent = allTasks.filter(t => !t.completed).length;
  document.getElementById('stat-done').textContent = allTasks.filter(t => t.completed).length;
}

// ---- Filtro ----
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
  renderTasks();
}

// ---- Adicionar tarefa ----
async function handleSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('task-input');
  const msg = document.getElementById('form-message');
  const btn = document.getElementById('submit-btn');
  const title = input.value.trim();

  msg.textContent = '';
  if (!title) {
    msg.textContent = 'Digite um título para a tarefa.';
    msg.className = 'form-message error';
    return;
  }

  btn.disabled = true;
  try {
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      allTasks.push(data.data);
      input.value = '';
      renderTasks();
      updateStats();
      showToast('Tarefa adicionada!', 'success');
      msg.textContent = '';
    } else {
      msg.textContent = data.message || 'Erro ao adicionar tarefa.';
      msg.className = 'form-message error';
    }
  } catch {
    msg.textContent = 'Erro de conexão com a API.';
    msg.className = 'form-message error';
  } finally {
    btn.disabled = false;
  }
}

// ---- Toggle ----
async function toggleTask(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const idx = allTasks.findIndex(t => t.id === id);
      allTasks[idx] = data.data;
      renderTasks();
      updateStats();
    }
  } catch {
    showToast('Erro ao atualizar tarefa.', 'error');
  }
}

// ---- Excluir ----
async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      allTasks = allTasks.filter(t => t.id !== id);
      renderTasks();
      updateStats();
      showToast('Tarefa removida.', 'success');
    }
  } catch {
    showToast('Erro ao excluir tarefa.', 'error');
  }
}

// ---- Editar ----
function openEdit(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('edit-input').value = task.title;
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('edit-input').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

async function saveEdit() {
  const title = document.getElementById('edit-input').value.trim();
  if (!title || !editingId) return;
  try {
    const res = await fetch(`${API}/tasks/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const idx = allTasks.findIndex(t => t.id === editingId);
      allTasks[idx] = data.data;
      renderTasks();
      closeModal();
      showToast('Tarefa atualizada!', 'success');
    }
  } catch {
    showToast('Erro ao salvar.', 'error');
  }
}

// ---- Toast ----
let toastTimeout;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ---- Keyboard ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
