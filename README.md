# Taskflow — Task Manager API

Aplicação web responsiva para gerenciamento de tarefas, construída com Node.js, Express, HTML5, CSS3 e JavaScript puro. O projeto integra uma API RESTful completa, uma interface visual interativa (**Taskflow**), uma suíte de testes automatizados e um pipeline completo de **Integração e Entrega Contínua (CI/CD)** com GitHub Actions e Render.

## Funcionalidades

- Criar, listar, consultar por ID, editar e excluir tarefas (CRUD completo).
- Marcar tarefas como concluídas ou reabri-las rapidamente.
- Buscar tarefas por título, descrição ou ID e filtrar por status (*Todas*, *Pendentes*, *Concluídas*).
- Painel em tempo real com indicadores de total, pendentes, concluídas e barra de progresso percentual.
- Validação de dados de entrada na API e feedback visual (toasts e estados de sincronização) na interface.

## Tecnologias

- **Backend:** Node.js 20 e Express 4
- **Frontend:** HTML5, CSS3 e JavaScript (Vanilla JS)
- **Testes Automatizados:** `node:test` e `node:assert/strict`
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`)
- **Hospedagem / Deploy Contínuo:** Render (`render.yaml` + Deploy Hook)

## Metodologia Ágil (Lean & Kanban)

O desenvolvimento do projeto foi organizado utilizando práticas de **Lean** (foco na entrega enxuta de valor, construção incremental do MVP e eliminação de retrabalho manual por meio de automação CI/CD) e gestão visual via **Kanban** no GitHub Issues/Projects:

- **Concluído:**
  - Issue #1 — Criar endpoint para adicionar uma nova tarefa (`POST /tasks`)
  - Issue #2 — Criar endpoint para listar tarefas (`GET /tasks`)
  - Issue #3 — Criar endpoint para atualizar uma tarefa (`PUT /tasks/:id`)
  - Issue #4 — Criar endpoint para deletar uma tarefa (`DELETE /tasks/:id`)
  - Issue #5 — Configurar pipeline de Integração Contínua (CI) com GitHub Actions
  - Issue #6 — Criar endpoint para buscar uma tarefa específica por ID (`GET /tasks/:id`)
  - Issue #7 — Implementar validação de dados de entrada nos endpoints de criação e atualização
- **Em evolução / Backlog de melhorias:**
  - Issues #8 a #14 — Health check, filtro e busca via query params na API, níveis de prioridade, paginação e documentação OpenAPI/Swagger.

## Executar Localmente

Requisitos: Node.js 20+ e npm.

```bash
npm ci
npm test
npm start
```

Após iniciar, acesse `http://localhost:3000`.

## API REST

| Método | Rota | Descrição | Status de Sucesso |
|---|---|---|---|
| `POST` | `/tasks` | Cria uma nova tarefa | `201 Created` |
| `GET` | `/tasks` | Lista todas as tarefas | `200 OK` |
| `GET` | `/tasks/:id` | Consulta uma tarefa específica pelo ID | `200 OK` |
| `PUT` | `/tasks/:id` | Atualiza título, descrição e/ou status da tarefa | `200 OK` |
| `DELETE` | `/tasks/:id` | Exclui uma tarefa pelo ID | `204 No Content` |

Exemplo de corpo para criação (`POST /tasks`):

```json
{
  "title": "Preparar apresentação da Avaliação 4",
  "description": "Demonstrar pipeline de CI/CD e testes automatizados"
}
```

Regras de validação:
- `title`: obrigatório, texto não vazio (`400 Bad Request` caso ausente ou em branco).
- `description`: opcional, deve ser texto (`400 Bad Request` caso seja de outro tipo).
- `completed`: booleano (`true` ou `false`) ao atualizar (`400 Bad Request` caso não seja booleano).
- `id`: inteiro positivo existente (`404 Not Found` caso não exista).

## Testes Automatizados

A suíte em `test/tasks.test.js` é executada com `npm test` e conta com **8 testes automatizados** isolados por `beforeEach(resetTasks)`:

1. Criação de tarefa (`POST /tasks` → `201`).
2. Listagem de tarefas (`GET /tasks` → `200`).
3. Consulta de tarefa específica por ID (`GET /tasks/:id` → `200`).
4. Atualização de título e status de conclusão (`PUT /tasks/:id` → `200`).
5. Exclusão de tarefa (`DELETE /tasks/:id` → `204`).
6. Rejeição de título ausente ou vazio (`POST /tasks` → `400`).
7. Rejeição do campo `completed` quando não é booleano (`PUT /tasks/:id` → `400`).
8. Retorno `404 Not Found` para identificador inexistente (`GET /tasks/9999` → `404`).

## Pipeline de CI/CD (GitHub Actions + Render)

O workflow `.github/workflows/ci.yml` implementa o fluxo de Integração e Entrega Contínua na branch principal (`main`):

1. **Integração Contínua (`build-and-test`):**
   - Disparado automaticamente em todo `push` e `pull_request` direcionado à branch `main`.
   - Faz checkout do código, configura o Node.js 20, instala dependências com `npm ci` e executa os 8 testes automatizados com `npm test`.
2. **Entrega Contínua (`deploy`):**
   - Como o projeto é uma aplicação web **não estática** (servidor Node.js + Express servindo API e frontend), a publicação é realizada automaticamente no **Render**.
   - Depende da aprovação dos testes (`needs: build-and-test`) e executa apenas em eventos `push` na branch `main`, acionando o Deploy Hook configurado no secret `RENDER_DEPLOY_HOOK`.

## Estrutura do Projeto

```text
.github/
  workflows/
    ci.yml
src/
  app.js
  server.js
  public/
    index.html
    styles.css
    script.js
test/
  tasks.test.js
render.yaml
package.json
README.md
```

## Integrantes do Grupo

- Thierry
- Humberto
- Mauro
- Alessandra
- Luiz
- Giovanna
- Adryel
