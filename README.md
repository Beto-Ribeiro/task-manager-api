# Taskflow — Task Manager API

Aplicação web responsiva para gerenciamento de tarefas, construída com Node.js, Express, HTML, CSS e JavaScript puro. O projeto mantém uma API REST e uma interface visual Taskflow.

## Funcionalidades

- Criar, listar, consultar, editar e excluir tarefas (CRUD).
- Marcar tarefas como concluídas ou reabri-las.
- Buscar por título, descrição ou ID e filtrar por status.
- Painel com total, pendentes, concluídas e percentual de progresso.
- Feedback visual para operações e indisponibilidade da API.

## Tecnologias

- Node.js 20 e Express 4
- HTML5, CSS3 e JavaScript (sem framework frontend)
- `node:test` para testes automatizados
- GitHub Actions para CI/CD
- Render para hospedagem da aplicação web/API

## Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm ci
npm test
npm start
```

Abra `http://localhost:3000`.

## Quadro Kanban (snapshot do README anterior)

- **Concluído:** Issues #1, #2, #3, #4 e #5
- **Em revisão:** Issues #6, #7 e #8
- **Em progresso:** Issues #9, #10 e #11
- **Backlog:** Issues #12, #13 e #14

Confirme o estado atual dessas Issues no GitHub Projects antes do seminário, pois o quadro pode ter sido atualizado.

## API REST

| Método | Rota | Comportamento |
|---|---|---|
| POST | `/tasks` | Cria tarefa |
| GET | `/tasks` | Lista tarefas |
| GET | `/tasks/:id` | Consulta tarefa |
| PUT | `/tasks/:id` | Atualiza tarefa |
| DELETE | `/tasks/:id` | Exclui tarefa |

Exemplo de criação:

```json
{
  "title": "Preparar apresentação",
  "description": "Revisar slides e ensaiar"
}
```

O campo `title` é obrigatório. `description` deve ser texto e `completed`, quando enviado, deve ser booleano.

## Testes automatizados

Execute `npm test`. A suíte cobre criação, listagem, consulta por ID, atualização, exclusão, validação de entrada e tratamento de ID inexistente.

## Pipeline CI/CD

O workflow `.github/workflows/ci.yml` é executado em push e pull request direcionados a `main` ou `master`.

1. Faz checkout do código.
2. Configura Node.js 20.
3. Instala dependências com `npm ci`.
4. Executa `npm test`.
5. Somente em push para `main`, após sucesso dos testes, aciona o deploy no Render.

### Configuração obrigatória do Render

1. Crie um serviço **Web Service** no Render conectado a este repositório.
2. Configure Build Command: `npm ci`.
3. Configure Start Command: `npm start`.
4. No painel do serviço, gere um **Deploy Hook**.
5. No GitHub, abra **Settings → Secrets and variables → Actions → New repository secret**.
6. Nome: `RENDER_DEPLOY_HOOK`. Valor: URL do Deploy Hook do Render.

O arquivo `render.yaml` documenta a configuração base. O deploy automático depende da criação do serviço e do secret; não inclua a URL do hook no código.

## Estrutura

```text
.github/workflows/ci.yml
src/
  app.js
  server.js
  public/
    index.html
    styles.css
    script.js
test/tasks.test.js
render.yaml
package.json
README.md
```

## Observações e limitações conhecidas

- Os dados são armazenados em memória. Reiniciar ou redeployar o serviço reinicia a lista; não é persistência de produção.
- A interface usa DM Sans e Manrope via Google Fonts, com fontes alternativas se não houver conexão.
- O serviço Render e o secret precisam ser configurados pelo responsável pelo repositório.
- A suíte automatizada deve ser executada no ambiente local e no GitHub Actions antes da apresentação.

## Preparação do seminário

- Preencher os nomes completos de todos os integrantes nos slides.
- Mostrar o CRUD na interface.
- Mostrar os testes no GitHub Actions.
- Demonstrar que pull request executa CI e que push na `main` pode disparar CD após a configuração do Render.
- Apresentar o quadro Kanban/Issues real do repositório; atualizar este documento se o estado das Issues tiver mudado.
