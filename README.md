# TaskFlow — Aplicação Fullstack com Testes Cypress

![Frontend Tests](https://github.com/SEU_USUARIO/taskflow/actions/workflows/frontend-tests.yml/badge.svg)
![Backend Tests](https://github.com/SEU_USUARIO/taskflow/actions/workflows/backend-tests.yml/badge.svg)

Aplicação web fullstack de gerenciamento de tarefas com frontend em HTML, CSS e JavaScript, backend em Node.js com ExpressJS, e testes automatizados com Cypress.

---

## 🗂️ Estrutura do Projeto

```
taskflow/
├── frontend/
│   ├── index.html        # Interface da aplicação
│   ├── style.css         # Estilização
│   └── app.js            # Lógica do frontend
├── backend/
│   ├── server.js         # Configuração Express e rotas
│   ├── index.js          # Ponto de entrada
│   └── package.json
├── cypress/
│   ├── e2e/
│   │   ├── frontend.cy.js  # Testes E2E do frontend
│   │   └── backend.cy.js   # Testes da API backend
│   ├── fixtures/
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── .github/
│   └── workflows/
│       ├── frontend-tests.yml   # GitHub Action — Frontend
│       └── backend-tests.yml    # GitHub Action — Backend
├── cypress.config.js
└── package.json
```

---

## 🚀 Como executar localmente

### Pré-requisitos

- Node.js 18+
- npm

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install

# No backend
cd backend && npm install
```

### 2. Iniciar o Backend

```bash
cd backend
node index.js
# Servidor rodando em http://localhost:3001
```

### 3. Servir o Frontend

```bash
# Na raiz do projeto
npx http-server frontend -p 3000
# Frontend disponível em http://localhost:3000
```

### 4. Abrir a aplicação

Acesse **http://localhost:3000** no navegador.

---

## 🧪 Executar os Testes

### Todos os testes

```bash
npm run test:all
```

### Apenas testes do Frontend

```bash
npm run test:frontend
```

### Apenas testes do Backend

```bash
npm run test:backend
```

### Modo interativo (Cypress UI)

```bash
npm run cypress:open
```

---

## 🌐 API REST — Endpoints

| Método | Rota           | Descrição                    |
|--------|----------------|------------------------------|
| GET    | /health        | Verificar status da API      |
| GET    | /tasks         | Listar todas as tarefas      |
| GET    | /tasks/:id     | Buscar tarefa por ID         |
| POST   | /tasks         | Criar nova tarefa            |
| PUT    | /tasks/:id     | Atualizar tarefa             |
| DELETE | /tasks/:id     | Excluir tarefa               |
| POST   | /reset         | Resetar estado (para testes) |

### Exemplos

```bash
# Criar tarefa
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Minha tarefa"}'

# Listar tarefas
curl http://localhost:3001/tasks

# Concluir tarefa
curl -X PUT http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Excluir tarefa
curl -X DELETE http://localhost:3001/tasks/1
```

---

## ⚙️ GitHub Actions

O projeto possui dois workflows configurados que são disparados em todo **push**:

| Workflow               | Arquivo                        | O que testa              |
|------------------------|--------------------------------|--------------------------|
| Testes Frontend        | `.github/workflows/frontend-tests.yml` | Testes E2E do frontend via Cypress |
| Testes Backend         | `.github/workflows/backend-tests.yml`  | Testes da API REST via Cypress     |

---

## 📋 Cobertura dos Testes

### Backend (backend.cy.js) — 19 testes

- `GET /health` — status e resposta
- `GET /tasks` — listagem e dados
- `GET /tasks/:id` — busca e 404
- `POST /tasks` — criação, validação, trim
- `PUT /tasks/:id` — atualização, toggle, erros
- `DELETE /tasks/:id` — exclusão e 404
- `POST /reset` — restauração de estado

### Frontend (frontend.cy.js) — 22 testes

- Carregamento inicial da página
- Adição de tarefas (formulário, validação, Enter)
- Marcar/desmarcar como concluída
- Exclusão de tarefas
- Edição via modal (abrir, pré-preencher, salvar, fechar, Escape)
- Filtros (Todas, Pendentes, Concluídas)

---

## 🛠️ Tecnologias

| Camada    | Tecnologia         |
|-----------|--------------------|
| Frontend  | HTML5, CSS3, JavaScript (ES6+) |
| Backend   | Node.js, ExpressJS |
| Testes    | Cypress 13         |
| CI/CD     | GitHub Actions     |
