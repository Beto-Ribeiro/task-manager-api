const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [];
let nextId = 1;

function resetTasks() {
  tasks = [];
  nextId = 1;
}

function seedInitialTasks() {
  if (tasks.length > 0) return;
  tasks = [
    {
      id: nextId++,
      title: 'Definir escopo do MVP',
      description: 'Levantar funcionalidades essenciais do CRUD de tarefas',
      completed: true
    },
    {
      id: nextId++,
      title: 'Implementar endpoints da API',
      description: 'Criar rotas POST, GET, PUT e DELETE para tarefas',
      completed: false
    }
  ];
}

// 1. Criar nova tarefa (POST /tasks).
app.post('/tasks', (req, res) => {
  const { title, description = '' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo title e obrigatorio.' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    completed: false
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// 2. Listar todas as tarefas (GET /tasks)
app.get('/tasks', (req, res) => {
  return res.status(200).json(tasks);
});

// Visualizar uma tarefa especifica por ID (GET /tasks/:id)
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Tarefa nao encontrada.' });
  }

  return res.status(200).json(task);
});

// 3. Atualizar uma tarefa existente (PUT /tasks/:id)
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa nao encontrada.' });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'O campo title nao pode ser vazio.' });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = String(description).trim();
  }

  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }

  return res.status(200).json(tasks[taskIndex]);
});

// 4. Deletar uma tarefa (DELETE /tasks/:id)
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa nao encontrada.' });
  }

  tasks.splice(taskIndex, 1);
  return res.status(204).send();
});

module.exports = { app, resetTasks, seedInitialTasks };

