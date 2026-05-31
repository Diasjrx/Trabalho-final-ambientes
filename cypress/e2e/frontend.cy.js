// cypress/e2e/frontend.cy.js
// Testes E2E do Frontend — TaskFlow

describe('Frontend — TaskFlow', () => {

  beforeEach(() => {
    // Reseta backend e visita a página
    cy.request('POST', `${Cypress.env('apiUrl')}/reset`);
    cy.visit('/');
  });

  // ----------------------------------------------------------------
  // CARREGAMENTO DA PÁGINA
  // ----------------------------------------------------------------
  describe('Carregamento inicial', () => {
    it('deve carregar a página com o título correto', () => {
      cy.title().should('include', 'TaskFlow');
    });

    it('deve exibir o logo e o cabeçalho', () => {
      cy.contains('TaskFlow').should('be.visible');
    });

    it('deve exibir o badge de status da API', () => {
      cy.get('#status-badge').should('be.visible');
    });

    it('deve exibir o formulário de adicionar tarefa', () => {
      cy.get('[data-testid="task-input"]').should('be.visible');
      cy.get('[data-testid="submit-btn"]').should('be.visible');
    });

    it('deve exibir as tarefas iniciais do backend', () => {
      cy.get('[data-testid="task-list"]').find('[data-testid="task-item"]').should('have.length.at.least', 1);
    });

    it('deve exibir os contadores de estatísticas', () => {
      cy.get('[data-testid="stat-total"]').should('be.visible');
      cy.get('[data-testid="stat-pending"]').should('be.visible');
      cy.get('[data-testid="stat-done"]').should('be.visible');
    });

    it('deve mostrar o total correto de tarefas', () => {
      cy.get('[data-testid="stat-total"]').invoke('text').then((text) => {
        const total = parseInt(text);
        expect(total).to.be.at.least(1);
      });
    });
  });

  // ----------------------------------------------------------------
  // ADICIONAR TAREFA
  // ----------------------------------------------------------------
  describe('Adicionar tarefa', () => {
    it('deve adicionar uma nova tarefa ao preencher o formulário', () => {
      cy.get('[data-testid="task-input"]').type('Tarefa criada no teste E2E');
      cy.get('[data-testid="submit-btn"]').click();
      cy.contains('Tarefa criada no teste E2E').should('be.visible');
    });

    it('deve limpar o campo após adicionar', () => {
      cy.get('[data-testid="task-input"]').type('Tarefa para limpar');
      cy.get('[data-testid="submit-btn"]').click();
      cy.get('[data-testid="task-input"]').should('have.value', '');
    });

    it('deve atualizar o contador total após adicionar', () => {
      cy.get('[data-testid="stat-total"]').invoke('text').then((before) => {
        cy.get('[data-testid="task-input"]').type('Nova tarefa contador');
        cy.get('[data-testid="submit-btn"]').click();
        cy.get('[data-testid="stat-total"]').invoke('text').should('eq', String(parseInt(before) + 1));
      });
    });

    it('deve incrementar pendentes ao adicionar tarefa', () => {
      cy.get('[data-testid="stat-pending"]').invoke('text').then((before) => {
        cy.get('[data-testid="task-input"]').type('Tarefa pendente nova');
        cy.get('[data-testid="submit-btn"]').click();
        cy.get('[data-testid="stat-pending"]').invoke('text').should('eq', String(parseInt(before) + 1));
      });
    });

    it('deve mostrar mensagem de erro ao submeter título vazio', () => {
      cy.get('[data-testid="submit-btn"]').click();
      cy.get('#form-message').should('be.visible').and('not.be.empty');
    });

    it('deve adicionar tarefa pressionando Enter', () => {
      cy.get('[data-testid="task-input"]').type('Tarefa com Enter{enter}');
      cy.contains('Tarefa com Enter').should('be.visible');
    });
  });

  // ----------------------------------------------------------------
  // MARCAR COMO CONCLUÍDA
  // ----------------------------------------------------------------
  describe('Marcar tarefa como concluída', () => {
    it('deve marcar a primeira tarefa como concluída', () => {
      cy.get('[data-testid="task-item"]').first().within(() => {
        cy.get('.task-check').click();
      });
      cy.get('[data-testid="task-item"]').first().should('have.class', 'completed');
    });

    it('deve atualizar o contador de concluídas', () => {
      cy.get('[data-testid="stat-done"]').invoke('text').then((before) => {
        cy.get('[data-testid="task-item"]').first().find('.task-check').click();
        cy.get('[data-testid="stat-done"]').invoke('text').should('eq', String(parseInt(before) + 1));
      });
    });

    it('deve desmarcar uma tarefa concluída ao clicar novamente', () => {
      cy.get('[data-testid="task-item"]').first().find('.task-check').click();
      cy.get('[data-testid="task-item"]').first().should('have.class', 'completed');
      cy.get('[data-testid="task-item"]').first().find('.task-check').click();
      cy.get('[data-testid="task-item"]').first().should('not.have.class', 'completed');
    });
  });

  // ----------------------------------------------------------------
  // EXCLUIR TAREFA
  // ----------------------------------------------------------------
  describe('Excluir tarefa', () => {
    it('deve excluir a primeira tarefa ao clicar no botão de exclusão', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="task-title"]').invoke('text').then((title) => {
        cy.get('[data-testid="task-item"]').first().find('[data-testid^="delete-btn"]').click();
        cy.contains(title).should('not.exist');
      });
    });

    it('deve decrementar o total de tarefas após excluir', () => {
      cy.get('[data-testid="stat-total"]').invoke('text').then((before) => {
        cy.get('[data-testid="task-item"]').first().find('[data-testid^="delete-btn"]').click();
        cy.get('[data-testid="stat-total"]').invoke('text').should('eq', String(parseInt(before) - 1));
      });
    });
  });

  // ----------------------------------------------------------------
  // EDITAR TAREFA
  // ----------------------------------------------------------------
  describe('Editar tarefa', () => {
    it('deve abrir o modal de edição ao clicar no botão editar', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="edit-btn"]').click();
      cy.get('#modal-overlay').should('have.class', 'open');
      cy.get('[data-testid="edit-input"]').should('be.visible');
    });

    it('deve pré-preencher o campo de edição com o título atual', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="task-title"]').invoke('text').then((title) => {
        cy.get('[data-testid="task-item"]').first().find('[data-testid^="edit-btn"]').click();
        cy.get('[data-testid="edit-input"]').should('have.value', title);
      });
    });

    it('deve salvar a edição e atualizar a lista', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="edit-btn"]').click();
      cy.get('[data-testid="edit-input"]').clear().type('Título editado pelo Cypress');
      cy.get('[data-testid="btn-save"]').click();
      cy.contains('Título editado pelo Cypress').should('be.visible');
    });

    it('deve fechar o modal ao clicar em Cancelar', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="edit-btn"]').click();
      cy.get('.btn-cancel').click();
      cy.get('#modal-overlay').should('not.have.class', 'open');
    });

    it('deve fechar o modal ao pressionar Escape', () => {
      cy.get('[data-testid="task-item"]').first().find('[data-testid^="edit-btn"]').click();
      cy.get('#modal-overlay').should('have.class', 'open');
      cy.get('body').type('{esc}');
      cy.get('#modal-overlay').should('not.have.class', 'open');
    });
  });

  // ----------------------------------------------------------------
  // FILTROS
  // ----------------------------------------------------------------
  describe('Filtros de tarefas', () => {
    beforeEach(() => {
      // Garante pelo menos uma tarefa concluída
      cy.get('[data-testid="task-item"]').first().find('.task-check').click();
    });

    it('deve mostrar apenas pendentes ao clicar no filtro Pendentes', () => {
      cy.contains('button', 'Pendentes').click();
      cy.get('[data-testid="task-item"]').each(($el) => {
        cy.wrap($el).should('not.have.class', 'completed');
      });
    });

    it('deve mostrar apenas concluídas ao clicar no filtro Concluídas', () => {
      cy.contains('button', 'Concluídas').click();
      cy.get('[data-testid="task-item"]').each(($el) => {
        cy.wrap($el).should('have.class', 'completed');
      });
    });

    it('deve mostrar todas as tarefas ao clicar no filtro Todas', () => {
      cy.contains('button', 'Pendentes').click();
      cy.contains('button', 'Todas').click();
      cy.get('[data-testid="task-item"]').should('have.length.at.least', 2);
    });

    it('deve ativar visualmente o botão de filtro selecionado', () => {
      cy.contains('button', 'Pendentes').click();
      cy.contains('button', 'Pendentes').should('have.class', 'active');
      cy.contains('button', 'Todas').should('not.have.class', 'active');
    });
  });

});
