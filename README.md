# Task Manager API

API RESTful minimalista para gerenciamento de tarefas (MVP CRUD), estruturada com foco em Lean, Metodologia Agil (Kanban) e Integracao Continua.

## 1. Propositos e Tecnologias

O projeto fornece uma API simples e uma interface web minimalista para criar, visualizar, atualizar e deletar tarefas.

- **Node.js** e **Express** para a API REST e servidor web
- **Node Test Runner** (`node:test`) para testes automatizados
- **HTML, CSS e JavaScript puro** para a interface minimalista do MVP
- **GitHub Issues, GitHub Projects e GitHub Actions** para gestao agil e CI

## 2. Estrutura do Projeto


```text
task-manager-api/
├── .github/workflows/ci.yml
├── src/
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   ├── app.js
│   └── server.js
├── test/
│   └── tasks.test.js
├── package.json
└── README.md
```

## 3. Planejamento do Produto (Lean e Agil)

### MVP (Minimum Viable Product)
Entrega enxuta contendo apenas o CRUD essencial de tarefas, eliminando desperdicios (sem sistemas complexos que nao agreguem valor imediato):

1. **Criar tarefa:** `POST /tasks`
2. **Listar e visualizar tarefas:** `GET /tasks` e `GET /tasks/:id`
3. **Atualizar tarefa:** `PUT /tasks/:id`
4. **Deletar tarefa:** `DELETE /tasks/:id`

### Quadro Kanban (GitHub Projects e Issues)

- **Concluido:** Issues #1, #2, #3, #4 e #5
- **Em revisao:** Issues #6, #7 e #8
- **Em progresso:** Issues #9, #10 e #11
- **Backlog:** Issues #12, #13 e #14

## 4. Execucao

```bash
npm install
npm test
npm start
```

Acesse em `http://localhost:3000`.
