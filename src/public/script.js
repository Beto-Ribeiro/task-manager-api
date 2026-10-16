const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const feedbackEl = document.getElementById('feedback');

function navigateTo(sectionId) {
  sections.forEach((sec) => sec.classList.toggle('active', sec.id === sectionId));
  navLinks.forEach((btn) => btn.classList.toggle('active', btn.dataset.section === sectionId));
}

navLinks.forEach((btn) => {
  btn.addEventListener('click', () => {
    navigateTo(btn.dataset.section);
    if (btn.dataset.section === 'section-list') {
      loadTasks();
    }
  });
});

document.getElementById('btn-go-create').addEventListener('click', () => {
  navigateTo('section-create');
});

document.getElementById('btn-cancel-create').addEventListener('click', () => {
  navigateTo('section-list');
});

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
  navigateTo('section-list');
});

function showMessage(text) {
  feedbackEl.textContent = text;
  feedbackEl.classList.remove('hidden');
  setTimeout(() => feedbackEl.classList.add('hidden'), 2500);
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 1. Listar tarefas (GET /tasks)
async function loadTasks() {
  const res = await fetch('/tasks');
  const tasks = await res.json();
  const container = document.getElementById('tasks-container');

  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-msg">Nenhuma tarefa cadastrada.</div>';
    return;
  }

  container.innerHTML = tasks
    .map(
      (t) => `
      <div class="task-row">
        <div class="task-main">
          <span class="task-title ${t.completed ? 'done' : ''}">${escapeHtml(t.title)}</span>
          ${t.description ? `<span class="task-desc">${escapeHtml(t.description)}</span>` : ''}
          <span class="task-meta">ID: ${t.id} | Status: ${t.completed ? 'Concluida' : 'Pendente'}</span>
        </div>
        <div class="task-actions">
          <button class="btn btn-outline" onclick="viewTask(${t.id})">Visualizar</button>
          <button class="btn btn-outline" onclick="openEdit(${t.id})">Editar</button>
          <button class="btn btn-danger" onclick="deleteTask(${t.id})">Excluir</button>
        </div>
      </div>
    `
    )
    .join('');
}

// 2. Criar nova tarefa (POST /tasks)
document.getElementById('form-create').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('create-title').value;
  const description = document.getElementById('create-description').value;

  const res = await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  if (res.ok) {
    e.target.reset();
    showMessage('Tarefa criada com sucesso.');
    navigateTo('section-list');
    loadTasks();
  }
});

// 3. Visualizar tarefa por ID (GET /tasks/:id)
async function viewTask(id) {
  document.getElementById('search-id-input').value = id;
  navigateTo('section-detail');
  await fetchTaskById(id);
}

async function fetchTaskById(id) {
  const resultDiv = document.getElementById('detail-result');
  const res = await fetch(`/tasks/${id}`);

  if (!res.ok) {
    resultDiv.innerHTML = '<div class="empty-msg">Tarefa nao encontrada.</div>';
    return;
  }

  const t = await res.json();
  resultDiv.innerHTML = `
    <div class="task-row">
      <div class="task-main">
        <span class="task-title ${t.completed ? 'done' : ''}">${escapeHtml(t.title)}</span>
        <span class="task-desc">${escapeHtml(t.description || 'Sem descricao')}</span>
        <span class="task-meta">ID: ${t.id} | Status: ${t.completed ? 'Concluida' : 'Pendente'}</span>
      </div>
      <div class="task-actions">
        <button class="btn btn-outline" onclick="openEdit(${t.id})">Editar</button>
        <button class="btn btn-danger" onclick="deleteTask(${t.id})">Excluir</button>
      </div>
    </div>
  `;
}

document.getElementById('form-search-id').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('search-id-input').value;
  await fetchTaskById(id);
});

// 4. Atualizar tarefa (PUT /tasks/:id)
async function openEdit(id) {
  const res = await fetch(`/tasks/${id}`);
  if (!res.ok) return;
  const task = await res.json();

  document.getElementById('edit-id').value = task.id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-description').value = task.description || '';
  document.getElementById('edit-completed').checked = Boolean(task.completed);

  navigateTo('section-edit');
}

document.getElementById('form-edit').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const completed = document.getElementById('edit-completed').checked;

  const res = await fetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, completed })
  });

  if (res.ok) {
    showMessage('Tarefa atualizada com sucesso.');
    navigateTo('section-list');
    loadTasks();
  }
});

// 5. Deletar tarefa (DELETE /tasks/:id )
async function deleteTask(id) {
  const res = await fetch(`/tasks/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showMessage('Tarefa excluida.');
    navigateTo('section-list');
    loadTasks();
  }
}

window.viewTask = viewTask;
window.openEdit = openEdit;
window.deleteTask = deleteTask;

loadTasks();
