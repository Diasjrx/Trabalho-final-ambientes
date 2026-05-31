// cypress/support/e2e.js
// Comandos globais e configurações de suporte para todos os testes

// Importa comandos customizados (se houver)
import './commands';

// Silencia erros de rede não críticos nos testes de frontend
Cypress.on('uncaught:exception', (err) => {
  // Ignora erros de CORS ou falha de fetch durante os testes
  if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
    return false;
  }
});
