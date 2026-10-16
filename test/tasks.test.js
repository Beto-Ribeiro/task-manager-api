const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, resetTasks } = require('../src/app');

// Helper para realizar requisições HTTP contra o servidor em memória durante os testes
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

describe('Task Manager API - Testes Automatizados do MVP (CRUD)', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('Issue 1: Deve criar uma nova tarefa com sucesso (POST /tasks)', async () => {
    const res = await request('POST', '/tasks', {
      title: 'Criar README do projeto',
      description: 'Documentar propósito e tecnologias da API'
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.title, 'Criar README do projeto');
    assert.equal(res.body.completed, false);
  });

  it('Issue 1: Deve retornar erro 400 ao tentar criar tarefa sem título', async () => {
    const res = await request('POST', '/tasks', { description: 'Sem título' });
    assert.equal(res.status, 400);
  });

  it('Issue 2: Deve listar todas as tarefas cadastradas (GET /tasks)', async () => {
    await request('POST', '/tasks', { title: 'Tarefa 1' });
    await request('POST', '/tasks', { title: 'Tarefa 2' });

    const res = await request('GET', '/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    assert.equal(res.body[0].title, 'Tarefa 1');
    assert.equal(res.body[1].title, 'Tarefa 2');
  });

  it('Issue 3: Deve atualizar uma tarefa existente (PUT /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa Inicial' });

    const res = await request('PUT', `/tasks/${created.body.id}`, {
      title: 'Tarefa Atualizada',
      completed: true
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarefa Atualizada');
    assert.equal(res.body.completed, true);
  });

  it('Issue 4: Deve deletar uma tarefa existente (DELETE /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa para Deletar' });

    const delRes = await request('DELETE', `/tasks/${created.body.id}`);
    assert.equal(delRes.status, 204);

    const listRes = await request('GET', '/tasks');
    assert.equal(listRes.body.length, 0);
  });
});
