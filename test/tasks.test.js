const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, resetTasks } = require('../src/app');

async function request(method, path, body = null) {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body !== null) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { status: response.status, body: data };
  } finally {
    server.close();
  }
}

describe('Task Manager API - Testes do MVP (CRUD)', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('Deve criar uma nova tarefa (POST /tasks)', async () => {
    const res = await request('POST', '/tasks', {
      title: 'Nova tarefa',
      description: 'Descricao da tarefa'
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.title, 'Nova tarefa');
    assert.equal(res.body.completed, false);
  });

  it('Deve listar todas as tarefas (GET /tasks)', async () => {
    await request('POST', '/tasks', { title: 'Tarefa 1' });
    await request('POST', '/tasks', { title: 'Tarefa 2' });

    const res = await request('GET', '/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
  });

  it('Deve visualizar uma tarefa por ID (GET /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa especifica' });

    const res = await request('GET', `/tasks/${created.body.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarefa especifica');
  });

  it('Deve atualizar uma tarefa existente (PUT /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa inicial' });

    const res = await request('PUT', `/tasks/${created.body.id}`, {
      title: 'Tarefa atualizada',
      completed: true
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarefa atualizada');
    assert.equal(res.body.completed, true);
  });

  it('Deve deletar uma tarefa existente (DELETE /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa para deletar' });

    const delRes = await request('DELETE', `/tasks/${created.body.id}`);
    assert.equal(delRes.status, 204);

    const listRes = await request('GET', '/tasks');
    assert.equal(listRes.body.length, 0);
  });
});
