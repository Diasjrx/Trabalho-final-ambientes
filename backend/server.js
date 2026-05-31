const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [
  { id: 1, title: 'Estudar Node.js', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'Criar testes com Cypress', completed: false, createdAt: new Date().toISOString() },
];
let nextId = 3;

// GET /tasks
app.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
  res.json({ success: true, data: task });
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'O título é obrigatório' });
  }
  const task = { id: nextId++, title: title.trim(), completed: false, createdAt: new Date().toISOString() };
  tasks.push(task);
  res.status(201).json({ success: true, data: task });
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
  const { title, completed } = req.body;
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ success: false, message: 'O título não pode ser vazio' });
  }
  tasks[index] = {
    ...tasks[index],
    title: title !== undefined ? title.trim() : tasks[index].title,
    completed: completed !== undefined ? completed : tasks[index].completed,
  };
  res.json({ success: true, data: tasks[index] });
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
  tasks.splice(index, 1);
  res.json({ success: true, message: 'Tarefa removida com sucesso' });
});

// GET /health
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API funcionando corretamente' });
});

// Reset (usado nos testes)
app.post('/reset', (req, res) => {
  tasks = [
    { id: 1, title: 'Estudar Node.js', completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Criar testes com Cypress', completed: false, createdAt: new Date().toISOString() },
  ];
  nextId = 3;
  res.json({ success: true, message: 'Estado resetado' });
});

module.exports = app;
