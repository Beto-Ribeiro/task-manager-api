const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, resetTasks } = require('../src/app');

async function request(method, path, body = null) {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== null) options.body = JSON.stringify(body);
    const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe('Task Manager API - testes automatizados', () => {
  beforeEach(resetTasks);

  it('cria uma tarefa (POST /tasks)', async () => {
    const res = await request('POST', '/tasks', { title: 'Nova tarefa', description: 'Descrição' });
    assert.equal(res.status, 201);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.title, 'Nova tarefa');
    assert.equal(res.body.completed, false);
  });

  it('lista tarefas (GET /tasks)', async () => {
    await request('POST', '/tasks', { title: 'Tarefa 1' });
    await request('POST', '/tasks', { title: 'Tarefa 2' });
    const res = await request('GET', '/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
  });

  it('consulta uma tarefa por ID (GET /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa específica' });
    const res = await request('GET', `/tasks/${created.body.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarefa específica');
  });

  it('atualiza título e conclusão (PUT /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Inicial' });
    const res = await request('PUT', `/tasks/${created.body.id}`, { title: 'Atualizada', completed: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Atualizada');
    assert.equal(res.body.completed, true);
  });

  it('exclui uma tarefa (DELETE /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Excluir' });
    const del = await request('DELETE', `/tasks/${created.body.id}`);
    assert.equal(del.status, 204);
    const list = await request('GET', '/tasks');
    assert.equal(list.body.length, 0);
  });

  it('rejeita título ausente ou vazio', async () => {
    const missing = await request('POST', '/tasks', {});
    const blank = await request('POST', '/tasks', { title: '   ' });
    assert.equal(missing.status, 400);
    assert.equal(blank.status, 400);
  });

  it('rejeita completed quando não é booleano', async () => {
    const created = await request('POST', '/tasks', { title: 'Validação' });
    const res = await request('PUT', `/tasks/${created.body.id}`, { completed: 'false' });
    assert.equal(res.status, 400);
  });

  it('retorna 404 para identificador inexistente', async () => {
    const res = await request('GET', '/tasks/9999');
    assert.equal(res.status, 404);
  });
});
