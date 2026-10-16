const express = require('express');

const app = express();
app.use(express.json());

// Armazenamento em memória para o MVP (Lean: simplicidade e entrega rápida de valor)
let tasks = [];
let nextId = 1;

const VALID_PRIORITIES = ['baixa', 'media', 'alta'];

// Função auxiliar para resetar o estado durante os testes automatizados
function resetTasks() {
  tasks = [];
  nextId = 1;
}

// Issue 8: Criar endpoint de Health Check para monitoramento da API (GET /health)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Issue 1, 7 e 10: Criar endpoint para adicionar uma nova tarefa (POST /tasks)
app.post('/tasks', (req, res) => {
  const { title, description = '', priority = 'media' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Prioridade inválida. Use: baixa, media ou alta.' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// Issue 2 e 9: Criar endpoint para listar tarefas com suporte a filtro de conclusão (GET /tasks)
app.get('/tasks', (req, res) => {
  const { completed } = req.query;

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    return res.status(200).json(tasks.filter((t) => t.completed === isCompleted));
  }

  return res.status(200).json(tasks);
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

  const { title, description, completed, priority } = req.body;

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

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
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

module.exports = { app, resetTasks };
