const express = require('express');

const app = express();
app.use(express.json());

// Armazenamento em memória para o MVP (Lean: simplicidade e entrega rápida de valor)
let tasks = [];
let nextId = 1;

// Função auxiliar para resetar o estado durante os testes automatizados
function resetTasks() {
  tasks = [];
  nextId = 1;
}

// Issue 1: Criar endpoint para adicionar uma nova tarefa (POST /tasks)
app.post('/tasks', (req, res) => {
  const { title, description = '' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// Issue 2: Criar endpoint para listar tarefas (GET /tasks)
app.get('/tasks', (req, res) => {
  return res.status(200).json(tasks);
});

// Endpoint complementar para visualizar uma tarefa específica por ID (GET /tasks/:id)
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  return res.status(200).json(task);
});

// Issue 3: Criar endpoint para atualizar uma tarefa (PUT /tasks/:id)
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'O campo "title" não pode ser vazio.' });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description;
  }

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }

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
