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

describe('Task Manager API - Testes Automatizados do MVP e Evoluções', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('Issue 1 e 10: Deve criar uma nova tarefa com sucesso e prioridade padrão "media" (POST /tasks)', async () => {
    const res = await request('POST', '/tasks', {
      title: 'Criar README do projeto',
      description: 'Documentar propósito e tecnologias da API'
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.id, 1);
    assert.equal(res.body.title, 'Criar README do projeto');
    assert.equal(res.body.priority, 'media');
    assert.equal(res.body.completed, false);
  });

  it('Issue 7: Deve retornar erro 400 ao tentar criar tarefa sem título', async () => {
    const res = await request('POST', '/tasks', { description: 'Sem título' });
    assert.equal(res.status, 400);
  });

  it('Issue 2: Deve listar todas as tarefas cadastradas (GET /tasks)', async () => {
    await request('POST', '/tasks', { title: 'Tarefa 1' });
    await request('POST', '/tasks', { title: 'Tarefa 2' });

    const res = await request('GET', '/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
  });

  it('Issue 6: Deve buscar uma tarefa específica por ID (GET /tasks/:id) e retornar 404 se não existir', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa Específica' });

    const found = await request('GET', `/tasks/${created.body.id}`);
    assert.equal(found.status, 200);
    assert.equal(found.body.title, 'Tarefa Específica');

    const notFound = await request('GET', '/tasks/999');
    assert.equal(notFound.status, 404);
  });

  it('Issue 3: Deve atualizar uma tarefa existente (PUT /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa Inicial' });

    const res = await request('PUT', `/tasks/${created.body.id}`, {
      title: 'Tarefa Atualizada',
      priority: 'alta',
      completed: true
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarefa Atualizada');
    assert.equal(res.body.priority, 'alta');
    assert.equal(res.body.completed, true);
  });

  it('Issue 8: Deve retornar status ok no endpoint de Health Check (GET /health)', async () => {
    const res = await request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  it('Issue 9 e 11: Deve alternar conclusão (PATCH /tasks/:id/toggle) e filtrar por status (GET /tasks?completed=true)', async () => {
    const t1 = await request('POST', '/tasks', { title: 'Tarefa Concluída' });
    await request('POST', '/tasks', { title: 'Tarefa Pendente' });

    const toggled = await request('PATCH', `/tasks/${t1.body.id}/toggle`);
    assert.equal(toggled.status, 200);
    assert.equal(toggled.body.completed, true);

    const completedRes = await request('GET', '/tasks?completed=true');
    assert.equal(completedRes.status, 200);
    assert.equal(completedRes.body.length, 1);
    assert.equal(completedRes.body[0].title, 'Tarefa Concluída');
  });

  it('Issue 4: Deve deletar uma tarefa existente (DELETE /tasks/:id)', async () => {
    const created = await request('POST', '/tasks', { title: 'Tarefa para Deletar' });

    const delRes = await request('DELETE', `/tasks/${created.body.id}`);
    assert.equal(delRes.status, 204);

    const listRes = await request('GET', '/tasks');
    assert.equal(listRes.body.length, 0);
  });
});
