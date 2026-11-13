const state = {
  tasks: [],
  filter: 'all',
  query: '',
  selectedTask: null,
  busy: false
};

const $ = (selector) => document.querySelector(selector);
const tasksContainer = $('#tasks-container');
const taskModal = $('#task-modal');
const detailModal = $('#detail-modal');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `Não foi possível concluir a operação (HTTP ${response.status}).`);
  }
  return data;
}

function toast(message, type = 'success') {
  const item = document.createElement('div');
  item.className = `toast${type === 'error' ? ' error' : ''}`;
  item.textContent = message;
  $('#toast-region').append(item);
  window.setTimeout(() => item.remove(), 3600);
}

function setLoading(message = 'Carregando suas tarefas...') {
  tasksContainer.innerHTML = `<div class="loading-state"><span class="spinner"></span>${escapeHtml(message)}</div>`;
}

function updateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  $('#stat-total').textContent = total;
  $('#stat-pending').textContent = pending;
  $('#stat-completed').textContent = completed;
  $('#progress-label').textContent = `${percentage}%`;
  $('#progress-count').innerHTML = `${completed} <small>de ${total}</small>`;
  $('#progress-bar').style.width = `${percentage}%`;
  $('#nav-task-count').textContent = total;
}

function getVisibleTasks() {
  const query = state.query.trim().toLocaleLowerCase('pt-BR');
  return state.tasks.filter((task) => {
    const matchesFilter = state.filter === 'all'
      || (state.filter === 'completed' && task.completed === true)
      || (state.filter === 'pending' && task.completed !== true);
    const matchesQuery = !query
      || String(task.title || '').toLocaleLowerCase('pt-BR').includes(query)
      || String(task.description || '').toLocaleLowerCase('pt-BR').includes(query)
      || String(task.id).includes(query);
    return matchesFilter && matchesQuery;
  });
}

function taskRow(task) {
  const completed = task.completed === true;
  return `
    <article class="task-row" data-task-id="${Number(task.id)}">
      <div class="task-info">
        <button class="task-check ${completed ? 'is-done' : ''}" type="button"
          data-action="toggle" data-id="${Number(task.id)}"
          aria-label="${completed ? 'Reabrir tarefa' : 'Concluir tarefa'}"
          aria-pressed="${completed ? 'true' : 'false'}">
          ${completed ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19.5 6.8"/></svg>' : ''}
        </button>
        <div class="task-copy">
          <div class="task-title ${completed ? 'is-done' : ''}">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
          <span class="task-id">ID #${Number(task.id)}</span>
        </div>
      </div>
      <div><span class="status-pill ${completed ? 'status-completed' : 'status-pending'}">${completed ? 'Concluída' : 'Pendente'}</span></div>
      <div class="task-actions">
        <button class="action-button" type="button" data-action="view" data-id="${Number(task.id)}" aria-label="Visualizar tarefa ${Number(task.id)}" title="Visualizar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
        </button>
        <button class="action-button" type="button" data-action="edit" data-id="${Number(task.id)}" aria-label="Editar tarefa ${Number(task.id)}" title="Editar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"/></svg>
        </button>
        <button class="action-button danger" type="button" data-action="delete" data-id="${Number(task.id)}" aria-label="Excluir tarefa ${Number(task.id)}" title="Excluir">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m3 4v5m6-5v5"/></svg>
        </button>
      </div>
    </article>`;
}

function renderTasks() {
  const visible = getVisibleTasks();
  updateStats(state.tasks);

  if (!visible.length) {
    const hasTasks = state.tasks.length > 0;
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-illustration"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/></svg></span>
        <strong>${hasTasks ? 'Nenhuma tarefa encontrada' : 'Sua lista começa aqui'}</strong>
        <p>${hasTasks ? 'Tente mudar o filtro ou buscar por outro termo.' : 'Crie sua primeira tarefa e organize suas prioridades.'}</p>
        ${hasTasks ? '' : '<button class="button button-primary" type="button" data-action="create">Criar primeira tarefa</button>'}
      </div>`;
  } else {
    tasksContainer.innerHTML = visible.map(taskRow).join('');
  }

  $('#list-summary').textContent = `${visible.length} ${visible.length === 1 ? 'tarefa exibida' : 'tarefas exibidas'}`;
}

async function loadTasks(showFeedback = false) {
  setLoading();
  try {
    const data = await apiRequest('/tasks');
    if (!Array.isArray(data)) throw new Error('A API retornou um formato inesperado.');
    state.tasks = data;
    $('#api-status').classList.remove('offline');
    $('#api-status').lastChild.textContent = ' API disponível';
    renderTasks();
    if (showFeedback) toast('Lista atualizada com sucesso.');
  } catch (error) {
    $('#api-status').classList.add('offline');
    $('#api-status').lastChild.textContent = ' API indisponível';
    tasksContainer.innerHTML = `<div class="empty-state"><strong>Não foi possível carregar as tarefas</strong><p>${escapeHtml(error.message)}</p><button class="button button-soft" type="button" data-action="refresh">Tentar novamente</button></div>`;
    $('#list-summary').textContent = 'Falha na sincronização';
    $('#stat-total').textContent = '—';
    $('#stat-pending').textContent = '—';
    $('#stat-completed').textContent = '—';
    $('#progress-label').textContent = '—';
    if (showFeedback) toast(error.message, 'error');
  }
}

function setView(viewId) {
  document.querySelectorAll('.view-panel').forEach((panel) => panel.classList.toggle('active', panel.id === viewId));
  document.querySelectorAll('.side-link').forEach((button) => button.classList.toggle('active', button.dataset.view === viewId));
  const isSearch = viewId === 'search-view';
  $('#breadcrumb-current').textContent = isSearch ? 'Buscar por ID' : 'Minhas tarefas';
  $('#page-title').innerHTML = isSearch ? 'Encontre o que<br class="desktop-break"> você <span>procura.</span>' : 'Bom trabalho começa<br class="desktop-break"> com <span>clareza.</span>';
}

function openCreateModal() {
  $('#task-form').reset();
  $('#task-id').value = '';
  $('#modal-title').textContent = 'Criar nova tarefa';
  $('#save-task').innerHTML = 'Salvar tarefa <span aria-hidden="true">→</span>';
  $('#completion-field').hidden = true;
  taskModal.showModal();
  $('#task-title').focus();
}

async function openEditModal(id) {
  try {
    const task = await apiRequest(`/tasks/${id}`);
    $('#task-form').reset();
    $('#task-id').value = task.id;
    $('#task-title').value = task.title || '';
    $('#task-description').value = task.description || '';
    $('#task-completed').checked = task.completed === true;
    $('#modal-title').textContent = 'Editar tarefa';
    $('#save-task').innerHTML = 'Salvar alterações <span aria-hidden="true">→</span>';
    $('#completion-field').hidden = false;
    taskModal.showModal();
    $('#task-title').focus();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function openDetailModal(id) {
  try {
    const task = await apiRequest(`/tasks/${id}`);
    state.selectedTask = task;
    $('#detail-modal-content').innerHTML = `
      <div class="detail-modal-content">
        <div><span class="status-pill ${task.completed ? 'status-completed' : 'status-pending'}">${task.completed ? 'Concluída' : 'Pendente'}</span></div>
        <h3 style="margin:0;color:#34354e;font:700 16px Manrope,sans-serif;overflow-wrap:anywhere">${escapeHtml(task.title)}</h3>
        <div class="detail-description">${escapeHtml(task.description || 'Nenhuma descrição foi adicionada.')}</div>
        <div class="detail-meta">Identificador da tarefa: #${Number(task.id)}</div>
      </div>`;
    detailModal.showModal();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function deleteTask(id) {
  const task = state.tasks.find((item) => Number(item.id) === Number(id));
  const confirmed = window.confirm(`Deseja realmente excluir "${task?.title || `a tarefa #${id}`}"? Esta ação não pode ser desfeita.`);
  if (!confirmed) return;

  try {
    await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
    toast('Tarefa excluída.');
    await loadTasks();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function toggleTask(id) {
  const task = state.tasks.find((item) => Number(item.id) === Number(id));
  if (!task) return;
  try {
    await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: task.completed !== true })
    });
    toast(task.completed ? 'Tarefa reaberta.' : 'Tarefa concluída!');
    await loadTasks();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function submitTask(event) {
  event.preventDefault();
  const id = $('#task-id').value;
  const title = $('#task-title').value.trim();
  const description = $('#task-description').value.trim();
  const completed = $('#task-completed').checked;

  if (!title) {
    $('#task-title').setCustomValidity('Informe um título para a tarefa.');
    $('#task-title').reportValidity();
    return;
  }
  $('#task-title').setCustomValidity('');

  const saveButton = $('#save-task');
  saveButton.disabled = true;
  saveButton.textContent = 'Salvando...';

  try {
    if (id) {
      await apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, completed })
      });
      toast('Tarefa atualizada com sucesso.');
    } else {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
      toast('Tarefa criada com sucesso.');
    }
    taskModal.close();
    await loadTasks();
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.innerHTML = id ? 'Salvar alterações <span aria-hidden="true">→</span>' : 'Salvar tarefa <span aria-hidden="true">→</span>';
  }
}

async function searchById(event) {
  event.preventDefault();
  const id = $('#search-id-input').value.trim();
  if (!id || Number(id) < 1) return;
  const result = $('#detail-result');
  result.innerHTML = '<div class="loading-state"><span class="spinner"></span>Consultando a API...</div>';

  try {
    const task = await apiRequest(`/tasks/${encodeURIComponent(id)}`);
    result.innerHTML = `
      <div class="result-card">
        <div class="task-row" style="padding:0;border:0;min-height:0">
          <div class="task-info">
            <div class="task-copy">
              <div class="task-title">${escapeHtml(task.title)}</div>
              <div class="task-description">${escapeHtml(task.description || 'Sem descrição')}</div>
              <span class="task-id">ID #${Number(task.id)}</span>
            </div>
          </div>
          <div><span class="status-pill ${task.completed ? 'status-completed' : 'status-pending'}">${task.completed ? 'Concluída' : 'Pendente'}</span></div>
          <div class="task-actions">
            <button class="action-button" type="button" data-action="edit" data-id="${Number(task.id)}" aria-label="Editar tarefa"><svg viewBox="0 0 24 24"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"/></svg></button>
            <button class="action-button danger" type="button" data-action="delete" data-id="${Number(task.id)}" aria-label="Excluir tarefa"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7"/></svg></button>
          </div>
        </div>
      </div>`;
  } catch (error) {
    result.innerHTML = `<div class="empty-state"><strong>Tarefa não encontrada</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

document.querySelectorAll('.side-link').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

$('#open-create').addEventListener('click', openCreateModal);
$('#close-modal').addEventListener('click', () => taskModal.close());
$('#cancel-modal').addEventListener('click', () => taskModal.close());
$('#task-form').addEventListener('submit', submitTask);
$('#refresh-tasks').addEventListener('click', () => loadTasks(true));
$('#form-search-id').addEventListener('submit', searchById);
$('#task-title').addEventListener('input', (event) => event.target.setCustomValidity(''));
$('#task-search').addEventListener('input', (event) => {
  state.query = event.target.value;
  renderTasks();
});
document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderTasks();
  });
});

tasksContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'create') openCreateModal();
  if (action === 'refresh') loadTasks(true);
  if (action === 'view') openDetailModal(id);
  if (action === 'edit') openEditModal(id);
  if (action === 'delete') deleteTask(id);
  if (action === 'toggle') toggleTask(id);
});

$('#detail-result').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'edit') openEditModal(button.dataset.id);
  if (button.dataset.action === 'delete') deleteTask(button.dataset.id);
});

$('#detail-edit').addEventListener('click', () => {
  if (!state.selectedTask) return;
  const id = state.selectedTask.id;
  detailModal.close();
  openEditModal(id);
});
document.querySelectorAll('[data-close-detail]').forEach((button) => {
  button.addEventListener('click', () => detailModal.close());
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $('#task-search').focus();
  }
  if (event.key === 'Escape' && taskModal.open) taskModal.close();
});

loadTasks();
