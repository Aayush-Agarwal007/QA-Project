/**
 * API test suite for TaskFlow Mini.
 *
 * Run with:  npm run test:api
 *
 * Tests call the Express app directly via supertest (no server process
 * needed) so the suite is fast and fully deterministic in CI.
 *
 * Three tests are EXPECTED TO FAIL on the current build — that is by
 * design. Each failing test is annotated with the bug ID it documents
 * (see /docs/Bug_Reports.xlsx for the full write-up). Shipping a suite
 * that honestly reports known defects, instead of hiding them, is the
 * point of this project.
 */
const request = require('supertest');
const app = require('../../app/server');

beforeEach(async () => {
  await request(app).post('/api/reset');
});

describe('GET /api/tasks', () => {
  test('returns the seeded list of tasks with 200', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test('each task has the expected shape', async () => {
    const res = await request(app).get('/api/tasks');
    const task = res.body[0];
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('title');
    expect(task).toHaveProperty('priority');
    expect(task).toHaveProperty('completed', false);
  });

  // --- Documents BUG-003 (Medium/Medium) ---
  // Expected: ?priority=high returns only high-priority tasks.
  // Actual: the filter is ignored and every task is returned.
  test('BUG-003: filters tasks by ?priority= query param', async () => {
    const res = await request(app).get('/api/tasks?priority=high');
    expect(res.status).toBe(200);
    expect(res.body.every(t => t.priority === 'high')).toBe(true);
  });
});

describe('GET /api/tasks/:id', () => {
  test('returns a single task by id', async () => {
    const res = await request(app).get('/api/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/tasks', () => {
  test('creates a task with a valid title and returns 201', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'New task', priority: 'low' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.completed).toBe(false);
  });

  test('defaults priority to "medium" when not provided', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'No priority given' });
    expect(res.body.priority).toBe('medium');
  });

  // --- Documents BUG-001 (High/High) ---
  // Expected: an empty/whitespace title is rejected with 400.
  // Actual: the API silently creates a task with an empty title.
  test('BUG-001: rejects an empty title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '', priority: 'high' });
    expect(res.status).toBe(400);
  });

  test('BUG-001 (related): rejects a whitespace-only title with 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ', priority: 'high' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/tasks/:id', () => {
  test('updates an existing task title', async () => {
    const res = await request(app).put('/api/tasks/1').send({ title: 'Updated title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
  });

  test('returns 404 when updating a non-existent task', async () => {
    const res = await request(app).put('/api/tasks/9999').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id/complete', () => {
  test('marks a task complete and sets completedAt', async () => {
    const res = await request(app).patch('/api/tasks/1/complete');
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.completedAt).not.toBeNull();
  });

  test('returns 404 when completing a non-existent task', async () => {
    const res = await request(app).patch('/api/tasks/9999/complete');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('deletes an existing task and returns 200', async () => {
    const res = await request(app).delete('/api/tasks/1');
    expect(res.status).toBe(200);
    const after = await request(app).get('/api/tasks/1');
    expect(after.status).toBe(404);
  });

  // --- Documents BUG-002 (Low/Low) ---
  // Expected: deleting an id that doesn't exist returns 404.
  // Actual: it returns 200 regardless of whether anything was deleted.
  test('BUG-002: returns 404 when deleting a non-existent id', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.status).toBe(404);
  });
});
