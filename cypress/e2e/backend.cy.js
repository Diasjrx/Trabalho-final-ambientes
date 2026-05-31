// cypress/e2e/backend.cy.js
// Testes unitários / de integração do Backend (API REST)

const API = Cypress.env('apiUrl') || 'http://localhost:3001';

describe('Backend API — TaskFlow', () => {

  beforeEach(() => {
    // Reseta o estado antes de cada teste
    cy.request('POST', `${API}/reset`);
  });

  // ----------------------------------------------------------------
  // HEALTH CHECK
  // ----------------------------------------------------------------
  describe('GET /health', () => {
    it('deve retornar status 200 e mensagem de sucesso', () => {
      cy.request('GET', `${API}/health`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.include('funcionando');
      });
    });
  });

  // ----------------------------------------------------------------
  // LISTAR TAREFAS
  // ----------------------------------------------------------------
  describe('GET /tasks', () => {
    it('deve retornar lista de tarefas com status 200', () => {
      cy.request('GET', `${API}/tasks`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array');
      });
    });

    it('deve retornar as tarefas iniciais após reset', () => {
      cy.request('GET', `${API}/tasks`).then((res) => {
        expect(res.body.data).to.have.length(2);
        expect(res.body.data[0]).to.have.property('title');
        expect(res.body.data[0]).to.have.property('completed', false);
        expect(res.body.data[0]).to.have.property('id');
        expect(res.body.data[0]).to.have.property('createdAt');
      });
    });
  });

  // ----------------------------------------------------------------
  // BUSCAR TAREFA POR ID
  // ----------------------------------------------------------------
  describe('GET /tasks/:id', () => {
    it('deve retornar uma tarefa específica pelo id', () => {
      cy.request('GET', `${API}/tasks/1`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.id).to.eq(1);
      });
    });

    it('deve retornar 404 para id inexistente', () => {
      cy.request({
        method: 'GET',
        url: `${API}/tasks/9999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.include('não encontrada');
      });
    });
  });

  // ----------------------------------------------------------------
  // CRIAR TAREFA
  // ----------------------------------------------------------------
  describe('POST /tasks', () => {
    it('deve criar uma nova tarefa com título válido', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Nova tarefa de teste' }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.eq('Nova tarefa de teste');
        expect(res.body.data.completed).to.be.false;
        expect(res.body.data.id).to.be.a('number');
      });
    });

    it('deve fazer trim no título ao criar', () => {
      cy.request('POST', `${API}/tasks`, { title: '  Título com espaços  ' }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data.title).to.eq('Título com espaços');
      });
    });

    it('deve retornar 400 quando o título está vazio', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: { title: '' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
        expect(res.body.message).to.include('obrigatório');
      });
    });

    it('deve retornar 400 quando o título é apenas espaços', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: { title: '   ' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve retornar 400 quando o título não é enviado', () => {
      cy.request({
        method: 'POST',
        url: `${API}/tasks`,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve incrementar o total de tarefas após criação', () => {
      cy.request('GET', `${API}/tasks`).its('body.data.length').then((before) => {
        cy.request('POST', `${API}/tasks`, { title: 'Tarefa incremental' });
        cy.request('GET', `${API}/tasks`).its('body.data.length').should('eq', before + 1);
      });
    });
  });

  // ----------------------------------------------------------------
  // ATUALIZAR TAREFA
  // ----------------------------------------------------------------
  describe('PUT /tasks/:id', () => {
    it('deve atualizar o título de uma tarefa', () => {
      cy.request('PUT', `${API}/tasks/1`, { title: 'Título atualizado' }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.eq('Título atualizado');
      });
    });

    it('deve marcar uma tarefa como concluída', () => {
      cy.request('PUT', `${API}/tasks/1`, { completed: true }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.completed).to.be.true;
      });
    });

    it('deve desmarcar uma tarefa concluída', () => {
      cy.request('PUT', `${API}/tasks/1`, { completed: true });
      cy.request('PUT', `${API}/tasks/1`, { completed: false }).then((res) => {
        expect(res.body.data.completed).to.be.false;
      });
    });

    it('deve retornar 404 ao atualizar id inexistente', () => {
      cy.request({
        method: 'PUT',
        url: `${API}/tasks/9999`,
        body: { title: 'X' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve retornar 400 ao atualizar com título vazio', () => {
      cy.request({
        method: 'PUT',
        url: `${API}/tasks/1`,
        body: { title: '' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.success).to.be.false;
      });
    });
  });

  // ----------------------------------------------------------------
  // EXCLUIR TAREFA
  // ----------------------------------------------------------------
  describe('DELETE /tasks/:id', () => {
    it('deve excluir uma tarefa existente', () => {
      cy.request('DELETE', `${API}/tasks/1`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.success).to.be.true;
        expect(res.body.message).to.include('removida');
      });
    });

    it('deve remover a tarefa da lista após exclusão', () => {
      cy.request('DELETE', `${API}/tasks/1`);
      cy.request({
        method: 'GET',
        url: `${API}/tasks/1`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it('deve retornar 404 ao excluir id inexistente', () => {
      cy.request({
        method: 'DELETE',
        url: `${API}/tasks/9999`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.success).to.be.false;
      });
    });

    it('deve decrementar o total de tarefas após exclusão', () => {
      cy.request('GET', `${API}/tasks`).its('body.data.length').then((before) => {
        cy.request('DELETE', `${API}/tasks/1`);
        cy.request('GET', `${API}/tasks`).its('body.data.length').should('eq', before - 1);
      });
    });
  });

  // ----------------------------------------------------------------
  // RESET
  // ----------------------------------------------------------------
  describe('POST /reset', () => {
    it('deve restaurar o estado inicial', () => {
      cy.request('POST', `${API}/tasks`, { title: 'Tarefa temporária' });
      cy.request('POST', `${API}/reset`);
      cy.request('GET', `${API}/tasks`).then((res) => {
        expect(res.body.data).to.have.length(2);
      });
    });
  });

});
