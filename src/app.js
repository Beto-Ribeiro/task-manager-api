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

app.post('/tasks', (req, res) => {
  const { title, description = '' } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo title é obrigatório.' });
  }
  if (typeof description !== 'string') {
    return res.status(400).json({ error: 'O campo description deve ser um texto.' });
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

app.get('/tasks', (req, res) => res.status(200).json(tasks));

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!Number.isInteger(id) || id < 1 || !task) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }
  return res.status(200).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === id);

  if (!Number.isInteger(id) || id < 1 || taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  const { title, description, completed } = req.body || {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'O campo title não pode ser vazio e deve ser um texto.' });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'O campo description deve ser um texto.' });
    }
    tasks[taskIndex].description = description.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'O campo completed deve ser booleano.' });
    }
    tasks[taskIndex].completed = completed;
  }

  return res.status(200).json(tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === id);

  if (!Number.isInteger(id) || id < 1 || taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  tasks.splice(taskIndex, 1);
  return res.status(204).send();
});

module.exports = { app, resetTasks, seedInitialTasks };
