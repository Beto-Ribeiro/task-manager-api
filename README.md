# Task Manager API

API RESTful simples, rápida e escalável para gerenciamento de tarefas (To-Do / Task Management), desenvolvida aplicando práticas de **Lean**, **Desenvolvimento Ágil (Kanban)** e **Integração Contínua (CI)**.

---

## 1. Propósito do Projeto

O objetivo do **Task Manager API** é fornecer um backend enxuto e confiável para que usuários e aplicações clientes possam organizar seu fluxo de trabalho diário por meio do cadastro, consulta, atualização de status e remoção de tarefas.

---

## 2. Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/) (construção das rotas e middlewares REST)
- **Testes Automatizados:** [Jest](https://jestjs.io/) e [Supertest](https://github.com/ladjs/supertest) (testes unitários e de integração dos endpoints)
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

Seguindo a filosofia **Lean**, o MVP foi desenhado para entregar o **máximo de valor ao usuário no menor tempo possível**, validando a funcionalidade central de gestão de tarefas por meio das quatro operações essenciais (**CRUD**):

1. **Criar tarefa (`POST /tasks`):** Permite registrar uma nova tarefa com título e descrição.
2. **Listar/Visualizar tarefas (`GET /tasks` e `GET /tasks/:id`):** Permite consultar todas as tarefas cadastradas ou uma tarefa específica.
3. **Atualizar tarefa (`PUT /tasks/:id`):** Permite editar o título, descrição ou marcar a tarefa como concluída (`completed: true/false`).
4. **Deletar tarefa (`DELETE /tasks/:id`):** Permite remover tarefas que não são mais necessárias.

### 4.2. Eliminação de Desperdícios (Princípio Lean)

Para evitar *overengineering* e desperdício de tempo na fase inicial, as seguintes funcionalidades foram **intencionalmente excluídas do MVP** (ficando para iterações futuras após validação do produto):

- Autenticação complexa com OAuth2 / múltiplos perfis de permissão.
- Notificações por e-mail/push e integração com calendários externos.
- Subtarefas aninhadas, anexos de arquivos e comentários em tarefas.
- Relatórios analíticos e dashboards avançados.

### 4.3. Backlog Priorizado por Valor ao Cliente (GitHub Issues)

As funcionalidades foram transformadas em **GitHub Issues** e ordenadas da maior para a menor prioridade de negócio, considerando a dependência funcional e o valor entregue ao usuário final:

| Prioridade | Issue | Título | Valor para o Cliente / Justificativa Lean |
| :---: | :--- | :--- | :--- |
| **1 (Alta)** | **Issue #1** | Criar endpoint para adicionar uma nova tarefa | **Essencial:** Sem a criação de tarefas não há dados no sistema; é o ponto de partida de valor para o usuário capturar suas demandas. |
| **2 (Alta)** | **Issue #2** | Criar endpoint para listar tarefas | **Essencial:** Permite ao usuário visualizar imediatamente o que precisa ser feito após cadastrar suas tarefas. |
| **3 (Média)** | **Issue #3** | Criar endpoint para atualizar uma tarefa | **Importante:** Permite evoluir o estado da tarefa (ex.: marcar como concluída ou corrigir informações), completando o ciclo de uso diário. |
| **4 (Média/Baixa)** | **Issue #4** | Criar endpoint para deletar uma tarefa | **Complementar:** Permite higienizar a lista removendo itens criados por engano ou obsoletos, mas o sistema já é utilizável com os 3 itens anteriores. |

---

## 5. Gestão Ágil com Kanban (GitHub Projects)

O fluxo de desenvolvimento é acompanhado em um quadro **Kanban** no **GitHub Projects** estruturado em 4 colunas:

1. **Backlog:** Issues priorizadas aguardando início do desenvolvimento.
2. **Em progresso:** Issues que estão sendo implementadas no momento (em sua respectiva branch/feature).
3. **Em revisão:** Código implementado, com Pull Request aberto e testes automatizados rodando no pipeline de CI.
4. **Concluído:** Funcionalidade revisada, aprovada nos testes e integrada à branch principal (`main`).

---

## 6. Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- npm

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar os testes automatizados
npm test

# Iniciar o servidor (porta 3000 por padrão)
npm start
```

### Exemplos de Endpoints

- `POST /tasks` — Cria uma nova tarefa (`{ "title": "Estudar Lean", "description": "Revisar conceitos de MVP" }`)
- `GET /tasks` — Lista todas as tarefas
- `PUT /tasks/:id` — Atualiza uma tarefa existente (`{ "title": "Estudar Lean", "completed": true }`)
- `DELETE /tasks/:id` — Remove uma tarefa pelo ID
