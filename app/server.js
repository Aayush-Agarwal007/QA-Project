/**
 * TaskFlow Mini — a tiny task-management API built specifically as a
 * QA showcase. It intentionally ships with 3 realistic bugs (documented
 * in /docs/Bug_Reports.xlsx and caught by the automated suite in /tests).
 * Do not "fix" them before your interview — finding and explaining them
 * IS the point of this project.
 */
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let nextId = 1;
let tasks = [];

function seed() {
  tasks = [];
  nextId = 1;
  ['Write test plan', 'Review API contract', 'Automate smoke suite'].forEach((title, i) => {
    tasks.push({
      id: nextId++,
      title,
      priority: ['high', 'medium', 'low'][i],
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    });
  });
}
seed();

// Reset endpoint — lets the automated test suite start from a known state every run.
app.post('/api/reset', (req, res) => {
  seed();
  res.status(200).json({ message: 'reset', tasks });
});

// GET /api/tasks  — list all tasks, optionally filtered by ?priority=
app.get('/api/tasks', (req, res) => {
  // --- BUG-003 (Medium/Medium) ---
  // The `priority` query param is read but never actually applied to the
  // result set. Whatever the caller asks for, every task comes back.
  const { priority } = req.query;
  let result = tasks;
  if (priority) {
    result = tasks; // <-- should be: tasks.filter(t => t.priority === priority)
  }
  res.status(200).json(result);
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(200).json(task);
});

// POST /api/tasks — create a task
app.post('/api/tasks', (req, res) => {
  const { title, priority } = req.body;

  // --- BUG-001 (High/High) ---
  // There is no validation on `title` at all: empty strings, whitespace-only
  // strings, and missing titles are all silently accepted.
  // A correct implementation would reject with 400 when title is missing/blank.
  const task = {
    id: nextId++,
    title: title, // should be: (title || '').trim() with a 400 if empty
    priority: priority || 'medium',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id — update a task
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { title, priority } = req.body;
  if (title !== undefined) task.title = title;
  if (priority !== undefined) task.priority = priority;
  res.status(200).json(task);
});

// PATCH /api/tasks/:id/complete — mark a task complete
app.patch('/api/tasks/:id/complete', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.completed = true;
  task.completedAt = new Date().toISOString();
  res.status(200).json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));

  // --- BUG-002 (Low/Low) ---
  // Deleting a non-existent ID still returns 200 OK instead of 404,
  // because the "not found" case isn't handled before responding.
  if (index !== -1) {
    tasks.splice(index, 1);
  }
  res.status(200).json({ message: 'Deleted' }); // should be 404 when index === -1
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`TaskFlow Mini running on http://localhost:${PORT}`));
}

module.exports = app;
