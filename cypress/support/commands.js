// cypress/support/commands.js
// Comandos customizados do Cypress

/**
 * Reseta o estado do backend antes dos testes
 */
Cypress.Commands.add('resetBackend', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/reset`);
});

/**
 * Adiciona uma tarefa via API
 */
Cypress.Commands.add('addTask', (title) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/tasks`, { title })
    .its('body.data')
    .should('have.property', 'id');
});
