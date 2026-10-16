# Documentacao Completa e Roteiro de Apresentacao - Task Manager API

Este documento reune a explicacao tecnica completa do sistema, as tecnologias e frameworks adotados, o funcionamento dos testes automatizados, a aplicacao das metodologias Lean e Ageis, e um roteiro estruturado para a apresentacao do projeto.

---

## 1. Visao Geral do Sistema

O **Task Manager API** e uma aplicacao web e API RESTful voltada para o gerenciamento de tarefas. Seu objetivo e permitir que o usuario realize as quatro operacoes fundamentais de persistencia (**CRUD**: Create, Read, Update e Delete) de forma direta, rapida e sem complexidade desnecessaria.

O sistema e composto por duas camadas integradas no mesmo projeto:
1. **Back-end (API REST):** Responsavel pelas regras de negocio, validacao de dados e exposicao dos endpoints HTTP em formato JSON.
2. **Front-end (Interface MVP Minimalista):** Uma pagina unica (Single Page Application) com design limpo em fundo branco que consome a API em tempo real e permite navegar entre listagem, criacao, visualizacao por ID, edicao e exclusao de tarefas.

---

## 2. Tecnologias e Frameworks Utilizados

### 2.1. Node.js (Ambiente de Execucao)
- **O que e:** Runtime JavaScript orientado a eventos e nao bloqueante, executado no lado do servidor.
- **Papel no projeto:** Executa o servidor HTTP da API e o executor nativo de testes automatizados (`node --test`).

### 2.2. Express.js (Framework Web)
- **O que e:** Framework minimalista para Node.js focado na criacao de servidores HTTP e APIs REST.
- **Papel no projeto:**
  - Gerencia o roteamento dos endpoints (`GET`, `POST`, `PUT`, `DELETE`).
  - Faz o *parse* automatico do corpo das requisicoes JSON por meio do middleware `express.json()`.
  - Serve os arquivos estaticos da interface web (`index.html`, `styles.css`, `script.js`) por meio do middleware `express.static()`.

### 2.3. HTML5, CSS3 e JavaScript Puro (Front-end)
- **O que sao:** Tecnologias padrao da web utilizadas sem frameworks pesados para manter a simplicidade do MVP.
- **Papel no projeto:**
  - `index.html`: Define a estrutura semantica e o menu de navegacao entre as secoes (Tarefas, Nova Tarefa, Visualizar por ID e Atualizar Tarefa).
  - `styles.css`: Implementa o design minimalista com foco no branco (`#ffffff`), tipografia legivel e alto contraste.
  - `script.js`: Utiliza a `Fetch API` nativa do navegador para realizar chamadas assincronas (`async/await`) aos endpoints do Express e atualizar a tela dinamicamente sem recarregar a pagina.

### 2.4. Git, GitHub Issues, GitHub Projects e GitHub Actions
- **Git / GitHub:** Controle de versao distribuido e hospedagem do codigo-fonte.
- **GitHub Issues:** Registro do backlog do produto (14 issues documentadas com criterios de aceite e etiquetas de prioridade).
- **GitHub Projects (Kanban):** Quadro visual dividido nas colunas `Backlog`, `Em progresso`, `Em revisao` e `Concluido`.
- **GitHub Actions:** Plataforma de Integracao Continua (CI) que executa os testes automatizados a cada alteracao enviada ao repositorio.

---

## 3. Arquitetura e Funcionamento do Codigo

A estrutura de pastas segue a separacao clara entre codigo de producao (`src/`) e codigo de verificacao (`test/`):

- `src/server.js`: Ponto de entrada da aplicacao. Importa o `app`, carrega tarefas iniciais de demonstracao (`seedInitialTasks()`) e inicia o servidor na porta `3000`.
- `src/app.js`: Contem a implementacao dos endpoints do MVP:
  - `POST /tasks`: Valida se o campo `title` foi enviado, atribui um `id` sequencial, define `completed: false` e retorna status `201 Created`.
  - `GET /tasks`: Retorna status `200 OK` com o array completo de tarefas.
  - `GET /tasks/:id`: Busca uma tarefa especifica pelo ID; retorna `200 OK` se encontrada ou `404 Not Found` se inexistente.
  - `PUT /tasks/:id`: Atualiza `title`, `description` e/ou `completed` de uma tarefa existente e retorna `200 OK`.
  - `DELETE /tasks/:id`: Remove a tarefa do array em memoria e retorna status `204 No Content`.

---

## 4. Como os Testes Automatizados Funcionam

Os testes estao localizados em `test/tasks.test.js` e utilizam os modulos nativos do Node.js: `node:test` (`describe`, `it`, `beforeEach`) e `node:assert/strict`.

### Ciclo de Funcionamento dos Testes
1. **Isolamento de Estado (`beforeEach`):** Antes de cada teste individual, a funcao `resetTasks()` e executada. Isso limpa a lista de tarefas em memoria e reinicia o contador de IDs para `1`, garantindo que um teste nunca interfira no resultado do proximo.
2. **Servidor Efemero (`request` helper):** Para cada requisicao de teste, o helper inicia o Express em uma porta disponivel aleatoria do sistema operacional (`app.listen(0)`), dispara uma requisicao HTTP real usando `fetch`, captura o codigo de status e o JSON de resposta, e encerra o servidor no bloco `finally`.
3. **Assercoes (`assert.equal`):** Verifica se o comportamento real corresponde exatamente ao esperado:
   - Teste 1: Criacao de tarefa (`POST /tasks`) retorna status `201`, `id: 1` e `completed: false`.
   - Teste 2: Listagem de tarefas (`GET /tasks`) retorna status `200` e a quantidade exata de itens inseridos.
   - Teste 3: Busca por ID (`GET /tasks/:id`) retorna status `200` e o titulo correto da tarefa.
   - Teste 4: Atualizacao (`PUT /tasks/:id`) altera o titulo e muda `completed` para `true`, retornando status `200`.
   - Teste 5: Exclusao (`DELETE /tasks/:id`) retorna status `204` e confirma que a lista fica vazia em seguida.

### Integracao Continua (CI)
O arquivo `.github/workflows/ci.yml` instrui o GitHub Actions a criar uma maquina virtual Ubuntu a cada `push` ou `pull_request` na branch `main`, configurar o Node.js, instalar as dependencias com `npm ci` e rodar `npm test`. Se qualquer teste falhar, o pipeline bloqueia ou sinaliza o erro imediatamente.

---

## 5. Como Aplicamos Lean e Metodologias Ageis

### 5.1. Filosofia Lean (Maximizacao de Valor e Eliminacao de Desperdicios)
- **Definicao do MVP:** Em vez de projetar um sistema complexo desde o primeiro dia, definimos um Produto Minimo Viavel focado estritamente no problema central do cliente: criar, visualizar, atualizar e excluir tarefas.
- **Eliminacao de Desperdicios:** Descartamos na fase inicial recursos que atrasariam a entrega sem validar a ideia central (como banco de dados distribuido, autenticacao complexa, upload de arquivos e decoracoes visuais excessivas). Armazenamento em memoria e interface minimalista em branco permitiram entregar software funcional imediatamente.

### 5.2. Priorizacao por Valor ao Cliente (Backlog no GitHub Issues)
Criamos 14 Issues no GitHub e ordenamos o desenvolvimento pelo valor entregue ao usuario:
1. **Prioridade 1 (Alta):** Criar tarefa (#1) e Listar tarefas (#2), pois sem entrada e leitura de dados o sistema nao possui utilidade, seguidas pelo pipeline de CI (#5), busca por ID (#6) e validacao de entrada (#7).
2. **Prioridade 2 (Media):** Atualizar tarefa (#3), Health Check (#8), filtros (#9), niveis de prioridade (#10) e conclusao rapida (#11).
3. **Prioridade 3 (Baixa / Pos-MVP):** Deletar tarefa (#4) e melhorias futuras de escala como paginacao (#12), busca textual (#13) e documentacao OpenAPI (#14).

### 5.3. Fluxo Agil com Kanban (GitHub Projects)
Organizamos o trabalho em 4 colunas que representam o ciclo de vida de cada funcionalidade:
- **Backlog:** Funcionalidades planejadas para iteracoes futuras (Issues #12, #13, #14).
- **Em progresso:** Funcionalidades sendo desenvolvidas na iteracao atual (Issues #9, #10, #11).
- **Em revisao:** Funcionalidades implementadas passando por validacao e testes (Issues #6, #7, #8).
- **Concluido:** Funcionalidades do nucleo do MVP e CI finalizadas e entregues na branch principal (Issues #1, #2, #3, #4, #5).

---

## 6. Roteiro Passo a Passo para Apresentacao do Projeto

Tempo estimado sugerido: **5 a 7 minutos**.

### Parte 1: Introducao e Proposito (1 minuto)
- **O que mostrar:** Tela inicial do repositorio no GitHub (`https://github.com/Beto-Ribeiro/task-manager-api`) exibindo o `README.md` e a estrutura de pastas `src/` e `test/`.
- **O que falar:**
  > "Nosso projeto e o Task Manager API, uma solucao enxuta para gerenciamento de tarefas. Seguindo a abordagem Lean, estruturamos o repositorio de forma limpa, separando o codigo-fonte no diretorio `src` e os testes automatizados no diretorio `test`, utilizando Node.js e Express."

### Parte 2: Planejamento Lean, Backlog e Kanban (1,5 minuto)
- **O que mostrar:** Aba **Issues** e aba **Projects (Kanban)** no GitHub.
- **O que falar:**
  > "Aplicamos o principio Lean de eliminacao de desperdicios definindo um MVP focado no CRUD essencial. Transformamos cada funcionalidade em uma Issue no GitHub (totalizando 14 issues) e priorizamos pelo valor ao cliente: primeiro criar e listar tarefas, depois atualizar e, por fim, deletar e evoluir o produto. No quadro Kanban, organizamos o fluxo nas quatro colunas: Backlog, Em progresso, Em revisao e Concluido."

### Parte 3: Demonstracao Pratica do MVP (2 minutos)
- **O que mostrar:** Navegador aberto em `http://localhost:3000`.
- **Passo a passo na tela:**
  1. Mostrar a tela inicial minimalista em branco listando as tarefas atuais (`GET /tasks`).
  2. Clicar em **Nova Tarefa** no menu superior, preencher titulo e descricao e clicar em **Salvar** (`POST /tasks`). Mostrar que a tarefa aparece imediatamente na lista.
  3. Clicar em **Visualizar** na tarefa criada (ou usar a aba **Visualizar por ID**) para demonstrar a consulta individual (`GET /tasks/:id`).
  4. Clicar em **Editar**, alterar o titulo, marcar a caixa **Marcar como concluida** e clicar em **Atualizar** (`PUT /tasks/:id`). Mostrar o status atualizado para "Concluida".
  5. Clicar em **Excluir** em uma tarefa (`DELETE /tasks/:id`) e mostrar sua remocao imediata.

### Parte 4: Testes Automatizados e Integracao Continua (1,5 minuto)
- **O que mostrar:** Terminal executando `npm test` e o arquivo `.github/workflows/ci.yml` (ou a aba **Actions** no GitHub).
- **O que falar:**
  > "Para garantir qualidade a cada entrega agil, implementamos testes automatizados de integracao no diretorio `test/`. Cada teste sobe a API de forma isolada, valida as quatro operacoes do CRUD e verifica os codigos HTTP retornados. Alem disso, configuramos Integracao Continua com GitHub Actions para rodar todos os testes automaticamente a cada push na branch principal."
