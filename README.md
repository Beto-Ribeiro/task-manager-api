# Task Manager API

API RESTful simples, rápida e escalável para gerenciamento de tarefas (To-Do / Task Management), desenvolvida aplicando práticas de **Lean**, **Desenvolvimento Ágil (Kanban)** e **Integração Contínua (CI)**.

---

## 1. Propósito do Projeto

O objetivo do **Task Manager API** é fornecer um backend enxuto e confiável para que usuários e aplicações clientes possam organizar seu fluxo de trabalho diário por meio do cadastro, consulta, filtragem, atualização de status e remoção de tarefas.

---

## 2. Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/) (construção das rotas e middlewares REST)
- **Testes Automatizados:** Node.js Test Runner (`node:test` + `node:assert`) para testes de integração rápidos e sem dependências pesadas
- **Controle de Versão e Gestão Ágil:** Git, GitHub Issues e GitHub Projects (Kanban)
- **Integração Contínua (CI):** GitHub Actions

---

## 3. Estrutura do Projeto

```text
task-manager-api/
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline de Integração Contínua (GitHub Actions)
├── src/                    # Código-fonte da aplicação
│   ├── app.js              # Configuração do Express e rotas CRUD da API
│   └── server.js           # Ponto de entrada do servidor HTTP
├── test/                   # Testes automatizados
│   └── tasks.test.js       # Testes de integração para os endpoints de tarefas
├── package.json            # Dependências e scripts do projeto
└── README.md               # Documentação do projeto e planejamento Lean/Ágil
```

---

## 4. Planejamento do Produto (Lean e Ágil)

### 4.1. Definição do MVP (Minimum Viable Product)

Seguindo a filosofia **Lean**, o MVP foi desenhado para entregar o **máximo de valor ao usuário no menor tempo possível**, validando a funcionalidade central de gestão de tarefas por meio das operações essenciais (**CRUD**):

1. **Criar tarefa (`POST /tasks`):** Permite registrar uma nova tarefa com título, descrição e prioridade.
2. **Listar/Visualizar tarefas (`GET /tasks` e `GET /tasks/:id`):** Permite consultar todas as tarefas cadastradas, filtrar por status ou buscar uma tarefa específica.
3. **Atualizar tarefa (`PUT /tasks/:id` e `PATCH /tasks/:id/toggle`):** Permite editar o título, descrição, prioridade ou marcar/desmarcar a tarefa como concluída.
4. **Deletar tarefa (`DELETE /tasks/:id`):** Permite remover tarefas que não são mais necessárias.

### 4.2. Eliminação de Desperdícios (Princípio Lean)

Para evitar *overengineering* e desperdício de tempo na fase inicial, funcionalidades complexas (como autenticação OAuth2 multi-tenant, envio de e-mails transacionais, upload de anexos em nuvem e subtarefas infinitamente aninhadas) foram eliminadas do MVP inicial, priorizando a entrega contínua de valor.

---

## 5. Distribuição das 14 Issues no Quadro Kanban (GitHub Projects)

O quadro Kanban no **GitHub Projects** possui 4 colunas (**Backlog**, **Em progresso**, **Em revisão** e **Concluído**). Abaixo está a distribuição completa das **14 Issues** do projeto:

### ✅ Coluna 1: Concluído (5 Issues)
Funcionalidades essenciais do MVP e infraestrutura de CI já implementadas, testadas e integradas à branch `main`:

| Issue | Título | Prioridade | Endpoint / Artefato |
| :---: | :--- | :---: | :--- |
| **#1** | Criar endpoint para adicionar uma nova tarefa | Alta (MVP) | `POST /tasks` |
| **#2** | Criar endpoint para listar tarefas | Alta (MVP) | `GET /tasks` |
| **#3** | Criar endpoint para atualizar uma tarefa | Média (MVP) | `PUT /tasks/:id` |
| **#4** | Criar endpoint para deletar uma tarefa | Baixa (MVP) | `DELETE /tasks/:id` |
| **#5** | Configurar pipeline de Integração Contínua (CI) com GitHub Actions | Alta (MVP) | `.github/workflows/ci.yml` |

### 🔍 Coluna 2: Em revisão (3 Issues)
Funcionalidades implementadas e cobertas por testes automatizados, em etapa de validação e revisão de código (*Code Review*):

| Issue | Título | Prioridade | Endpoint / Artefato |
| :---: | :--- | :---: | :--- |
| **#6** | Criar endpoint para buscar uma tarefa específica por ID | Alta (MVP) | `GET /tasks/:id` |
| **#7** | Implementar validação de dados de entrada nos endpoints de criação e atualização | Alta (MVP) | `POST /tasks` e `PUT /tasks/:id` |
| **#8** | Criar endpoint de Health Check para monitoramento da API | Média | `GET /health` |

### 🚧 Coluna 3: Em progresso (3 Issues)
Funcionalidades de evolução rápida sendo trabalhadas na iteração atual:

| Issue | Título | Prioridade | Endpoint / Artefato |
| :---: | :--- | :---: | :--- |
| **#9** | Implementar filtro de tarefas por status de conclusão na listagem | Média | `GET /tasks?completed=true\|false` |
| **#10** | Adicionar suporte a níveis de prioridade na tarefa (`baixa`, `media`, `alta`) | Média | Campo `priority` em `POST`/`PUT` |
| **#11** | Criar endpoint PATCH para concluir/reabrir tarefa rapidamente | Média | `PATCH /tasks/:id/toggle` |

### 📋 Coluna 4: Backlog (3 Issues)
Funcionalidades planejadas e priorizadas para as próximas iterações (Pós-MVP), evitando desperdício precoce:

| Issue | Título | Prioridade | Escopo Planejado |
| :---: | :--- | :---: | :--- |
| **#12** | Implementar paginação na listagem de tarefas (`page` e `limit`) | Baixa (Pós-MVP) | `GET /tasks?page=1&limit=10` |
| **#13** | Adicionar busca de tarefas por palavra-chave no título ou descrição | Baixa (Pós-MVP) | `GET /tasks?search=termo` |
| **#14** | Adicionar documentação interativa da API com Swagger / OpenAPI | Baixa (Pós-MVP) | Rota `/api-docs` |

---

## 6. Como Executar o Projeto Localmente

```bash
# Instalar dependências
npm install

# Executar os testes automatizados
npm test

# Iniciar o servidor (porta 3000 por padrão)
npm start
```
