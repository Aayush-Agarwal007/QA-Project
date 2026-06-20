const form = document.getElementById('task-form');
const titleInput = document.getElementById('title-input');
const priorityInput = document.getElementById('priority-input');
const list = document.getElementById('task-list');

async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  render(tasks);
}

function render(tasks) {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task' + (task.completed ? ' completed' : '');
    li.setAttribute('data-testid', `task-${task.id}`);
    li.innerHTML = `
      <div class="task-left">
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        <span class="task-title">${escapeHtml(task.title)}</span>
      </div>
      <div class="task-actions">
        <button class="complete-btn" data-testid="complete-${task.id}">${task.completed ? 'Done' : 'Complete'}</button>
        <button class="delete-btn" data-testid="delete-${task.id}">Delete</button>
      </div>
    `;
    li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titleInput.value, priority: priorityInput.value })
  });
  titleInput.value = '';
  loadTasks();
});

async function completeTask(id) {
  await fetch(`/api/tasks/${id}/complete`, { method: 'PATCH' });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

loadTasks();
