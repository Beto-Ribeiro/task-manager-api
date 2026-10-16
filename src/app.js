const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Servir a interface web interativa (Front-end integrado)
app.use(express.static(path.join(__dirname, 'public')));

// Armazenamento em memória para o MVP (Lean: simplicidade e entrega rápida de valor)
let tasks = [];
let nextId = 1;

const VALID_PRIORITIES = ['baixa', 'media', 'alta'];
const VALID_STATUSES = ['Backlog', 'Em progresso', 'Em revisão', 'Concluído'];

// Função auxiliar para resetar o estado durante os testes automatizados
function resetTasks() {
  tasks = [];
  nextId = 1;
}

// Função para popular tarefas iniciais de demonstração ao iniciar o servidor
function seedInitialTasks() {
  if (tasks.length > 0) return;
  const initial = [
    {
      title: 'Criar endpoint para adicionar uma nova tarefa (POST /tasks)',
      description: 'Implementar rota de criação com validação de título e prioridade.',
      priority: 'alta',
      status: 'Concluído',
      completed: true
    },
    {
      title: 'Criar endpoint para listar tarefas (GET /tasks)',
      description: 'Retornar lista de tarefas com filtros por status, conclusão e busca textual.',
      priority: 'alta',
      status: 'Concluído',
      completed: true
    },
    {
      title: 'Validar dados de entrada nos endpoints de criação e atualização',
      description: 'Garantir retorno HTTP 400 quando o título for vazio ou prioridade inválida.',
      priority: 'alta',
      status: 'Em revisão',
      completed: false
    },
    {
      title: 'Implementar filtro de tarefas e níveis de prioridade',
      description: 'Permitir classificar tarefas em baixa, media e alta prioridade no quadro Kanban.',
      priority: 'media',
      status: 'Em progresso',
      completed: false
    },
    {
      title: 'Adicionar documentação interativa e busca por palavra-chave',
      description: 'Permitir pesquisar tarefas pelo título ou descrição na interface visual.',
      priority: 'baixa',
      status: 'Backlog',
      completed: false
    }
  ];

  initial.forEach((item) => {
    tasks.push({
      id: nextId++,
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: item.status,
      completed: item.completed,
      createdAt: new Date().toISOString()
    });
  });
}

// Issue 8: Criar endpoint de Health Check para monitoramento da API (GET /health)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    totalTasks: tasks.length,
    timestamp: new Date().toISOString()
  });
});

// Issue 1, 7 e 10: Criar endpoint para adicionar uma nova tarefa (POST /tasks)
app.post('/tasks', (req, res) => {
  const { title, description = '', priority = 'media', status = 'Backlog', completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Prioridade inválida. Use: baixa, media ou alta.' });
  }

  const taskStatus = VALID_STATUSES.includes(status) ? status : 'Backlog';
  const isCompleted = completed !== undefined ? Boolean(completed) : taskStatus === 'Concluído';

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description,
    priority,
    status: isCompleted ? 'Concluído' : taskStatus,
    completed: isCompleted,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// Issue 2, 9, 12 e 13: Criar endpoint para listar tarefas com suporte a filtros e busca (GET /tasks)
app.get('/tasks', (req, res) => {
  const { completed, priority, status, search } = req.query;
  let result = [...tasks];

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    result = result.filter((t) => t.completed === isCompleted);
  }

  if (priority !== undefined && priority !== '') {
    result = result.filter((t) => t.priority === priority);
  }

  if (status !== undefined && status !== '') {
    result = result.filter((t) => t.status === status);
  }

  if (search !== undefined && search.trim() !== '') {
    const term = search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
    );
  }

  return res.status(200).json(result);
});

// Issue 6: Criar endpoint para buscar uma tarefa específica por ID (GET /tasks/:id)
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  return res.status(200).json(task);
});

// Issue 3, 7 e 10: Criar endpoint para atualizar uma tarefa (PUT /tasks/:id)
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  const { title, description, completed, priority, status } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'O campo "title" não pode ser vazio.' });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description;
  }

  if (priority !== undefined) {
    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Prioridade inválida. Use: baixa, media ou alta.' });
    }
    tasks[taskIndex].priority = priority;
  }

  if (status !== undefined && VALID_STATUSES.includes(status)) {
    tasks[taskIndex].status = status;
    tasks[taskIndex].completed = status === 'Concluído';
  }

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
    if (tasks[taskIndex].completed) {
      tasks[taskIndex].status = 'Concluído';
    } else if (tasks[taskIndex].status === 'Concluído') {
      tasks[taskIndex].status = 'Em progresso';
    }
  }

  return res.status(200).json(tasks[taskIndex]);
});

// Issue 11: Criar endpoint PATCH para concluir/reabrir tarefa rapidamente (PATCH /tasks/:id/toggle)
app.patch('/tasks/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  tasks[taskIndex].completed = !tasks[taskIndex].completed;
  tasks[taskIndex].status = tasks[taskIndex].completed ? 'Concluído' : 'Em progresso';
  return res.status(200).json(tasks[taskIndex]);
});

// Issue 4: Criar endpoint para deletar uma tarefa (DELETE /tasks/:id)
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  tasks.splice(taskIndex, 1);
  return res.status(204).send();
});

module.exports = { app, resetTasks, seedInitialTasks };
