const KANBAN_ORDER = ['Backlog', 'Em progresso', 'Em revisão', 'Concluído'];
let allTasks = [];

// Elementos de Navegação
const navButtons = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const VIEW_HEADERS = {
  'view-list': {
    title: 'Lista de Tarefas',
    subtitle: 'Visualize, filtre, atualize e exclua suas tarefas em tempo real'
  },
  'view-kanban': {
    title: 'Quadro Kanban Ágil',
    subtitle: 'Movimente as tarefas pelas colunas Backlog, Em progresso, Em revisão e Concluído'
  },
  'view-create': {
    title: 'Criar Nova Tarefa',
    subtitle: 'Adicione uma nova tarefa com título, descrição, prioridade e coluna Kanban'
  },
  'view-api': {
    title: 'Status & Endpoints da API',
    subtitle: 'Monitore o servidor e inspecione as respostas JSON diretamente pelo navegador'
  }
};

function switchView(viewId) {
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });
  viewSections.forEach((sec) => {
    sec.classList.toggle('active', sec.id === viewId);
  });
  if (VIEW_HEADERS[viewId]) {
    pageTitle.textContent = VIEW_HEADERS[viewId].title;
    pageSubtitle.textContent = VIEW_HEADERS[viewId].subtitle;
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('btn-quick-new').addEventListener('click', () => {
  switchView('view-create');
  document.getElementById('create-title').focus();
});

// Toast Notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2800);
}

// Carregar Tarefas da API
async function fetchTasks() {
  const search = document.getElementById('filter-search').value;
  const completed = document.getElementById('filter-completed').value;
  const priority = document.getElementById('filter-priority').value;
  const status = document.getElementById('filter-kanban').value;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (completed !== '') params.set('completed', completed);
  if (priority) params.set('priority', priority);
  if (status) params.set('status', status);

  const [filteredRes, allRes] = await Promise.all([
    fetch(`/tasks?${params.toString()}`),
    fetch('/tasks')
  ]);

  const filteredTasks = await filteredRes.json();
  allTasks = await allRes.json();

  updateStats(allTasks);
  renderTaskList(filteredTasks);
  renderKanban(allTasks);
}

function updateStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const high = tasks.filter((t) => t.priority === 'alta' && !t.completed).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-high').textContent = high;
  document.getElementById('stat-done').textContent = done;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Renderizar Lista de Tarefas
function renderTaskList(tasks) {
  const container = document.getElementById('tasks-list-container');
  if (tasks.length === 0) {
    container.innerHTML = `<div class="empty-state">Nenhuma tarefa encontrada para os filtros selecionados.</div>`;
    return;
  }

  container.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <div class="task-left">
        <input
          type="checkbox"
          class="task-check"
          ${task.completed ? 'checked' : ''}
          onchange="toggleTask(${task.id})"
          title="Concluir / Reabrir tarefa"
        />
        <div class="task-info">
          <div class="task-title-row">
            <span class="task-id">#${task.id}</span>
            <span class="task-title">${escapeHtml(task.title)}</span>
            <span class="badge badge-${task.priority}">Prioridade: ${task.priority}</span>
            <span class="badge badge-status">${escapeHtml(task.status || (task.completed ? 'Concluído' : 'Backlog'))}</span>
          </div>
          ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${task.id})">✏️ Editar / Ver</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">🗑️ Excluir</button>
      </div>
    </div>
  `
    )
    .join('');
}

// Renderizar Quadro Kanban
function renderKanban(tasks) {
  const cols = {
    'Backlog': document.getElementById('kanban-backlog'),
    'Em progresso': document.getElementById('kanban-progress'),
    'Em revisão': document.getElementById('kanban-review'),
    'Concluído': document.getElementById('kanban-done')
  };

  const counts = {
    'Backlog': 0,
    'Em progresso': 0,
    'Em revisão': 0,
    'Concluído': 0
  };

  Object.values(cols).forEach((el) => (el.innerHTML = ''));

  tasks.forEach((task) => {
    const colName = KANBAN_ORDER.includes(task.status)
      ? task.status
      : task.completed
      ? 'Concluído'
      : 'Backlog';
    counts[colName]++;

    const idx = KANBAN_ORDER.indexOf(colName);
    const prevCol = idx > 0 ? KANBAN_ORDER[idx - 1] : null;
    const nextCol = idx < KANBAN_ORDER.length - 1 ? KANBAN_ORDER[idx + 1] : null;

    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.innerHTML = `
      <div class="kanban-card-top">
        <span class="task-id">#${task.id}</span>
        <span class="badge badge-${task.priority}">${task.priority}</span>
      </div>
      <h4>${escapeHtml(task.title)}</h4>
      ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
      <div class="kanban-card-footer">
        <div>
          ${prevCol ? `<button class="btn btn-secondary btn-sm" onclick="moveKanban(${task.id}, '${prevCol}')" title="Mover para ${prevCol}">◀</button>` : ''}
          ${nextCol ? `<button class="btn btn-primary btn-sm" onclick="moveKanban(${task.id}, '${nextCol}')" title="Mover para ${nextCol}">▶</button>` : ''}
        </div>
        <div>
          <button class="btn btn-secondary btn-sm" onclick="openEditModal(${task.id})" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})" title="Excluir">🗑️</button>
        </div>
      </div>
    `;
    cols[colName].appendChild(card);
  });

  document.getElementById('count-backlog').textContent = counts['Backlog'];
  document.getElementById('count-progress').textContent = counts['Em progresso'];
  document.getElementById('count-review').textContent = counts['Em revisão'];
  document.getElementById('count-done').textContent = counts['Concluído'];
}

// Ações CRUD
async function toggleTask(id) {
  await fetch(`/tasks/${id}/toggle`, { method: 'PATCH' });
  showToast(`Status da tarefa #${id} atualizado!`);
  fetchTasks();
}

async function moveKanban(id, newStatus) {
  await fetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  showToast(`Tarefa #${id} movida para "${newStatus}"!`);
  fetchTasks();
}

async function deleteTask(id) {
  const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showToast(`Tarefa #${id} excluída com sucesso!`);
    fetchTasks();
  }
}

// Criar Nova Tarefa
document.getElementById('form-create-task').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('create-title').value;
  const description = document.getElementById('create-description').value;
  const priority = document.getElementById('create-priority').value;
  const status = document.getElementById('create-status').value;

  const res = await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, status })
  });

  if (res.ok) {
    e.target.reset();
    showToast('Nova tarefa criada com sucesso!');
    await fetchTasks();
    switchView('view-list');
  } else {
    const err = await res.json();
    showToast(err.error || 'Erro ao criar tarefa');
  }
});

// Modal de Visualização / Edição (GET /tasks/:id e PUT /tasks/:id)
async function openEditModal(id) {
  const res = await fetch(`/tasks/${id}`);
  if (!res.ok) return;
  const task = await res.json();

  document.getElementById('edit-id').value = task.id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-description').value = task.description || '';
  document.getElementById('edit-priority').value = task.priority || 'media';
  document.getElementById('edit-status').value = task.status || (task.completed ? 'Concluído' : 'Backlog');
  document.getElementById('edit-meta').textContent = `ID #${task.id} • Criada em: ${new Date(task.createdAt).toLocaleString('pt-BR')}`;

  document.getElementById('task-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('task-modal').classList.add('hidden');
}

document.getElementById('btn-close-modal').addEventListener('click', closeEditModal);
document.getElementById('btn-cancel-modal').addEventListener('click', closeEditModal);

document.getElementById('form-edit-task').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const priority = document.getElementById('edit-priority').value;
  const status = document.getElementById('edit-status').value;

  const res = await fetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, status })
  });

  if (res.ok) {
    closeEditModal();
    showToast(`Tarefa #${id} atualizada!`);
    fetchTasks();
  }
});

// Filtros em Tempo Real
['filter-search', 'filter-completed', 'filter-priority', 'filter-kanban'].forEach((id) => {
  document.getElementById(id).addEventListener('input', fetchTasks);
});

document.getElementById('btn-refresh').addEventListener('click', () => {
  fetchTasks();
  showToast('Dados atualizados!');
});

// Explorador de API
document.getElementById('btn-test-health').addEventListener('click', async () => {
  const data = await fetch('/health').then((r) => r.json());
  document.getElementById('api-json-output').textContent = JSON.stringify(data, null, 2);
});

document.getElementById('btn-test-tasks').addEventListener('click', async () => {
  const data = await fetch('/tasks').then((r) => r.json());
  document.getElementById('api-json-output').textContent = JSON.stringify(data, null, 2);
});

// Expor funções globais para os botões inline
window.toggleTask = toggleTask;
window.moveKanban = moveKanban;
window.deleteTask = deleteTask;
window.openEditModal = openEditModal;

// Inicialização
fetchTasks();
