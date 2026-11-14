const { defineConfig } = require('cypress');
const base = require('./cypress.config');

/**
 * Configuração da suíte de defeitos conhecidos (npm run test:known-issues).
 * Estes testes descrevem o comportamento ESPERADO e, por isso, falham enquanto o defeito
 * existir. Ficam fora da suíte principal para não a quebrar; sem retentativas nem
 * screenshots, porque a falha aqui é o resultado previsto.
 */
module.exports = defineConfig({
  ...base,
  e2e: {
    ...base.e2e,
    specPattern: 'cypress/known-issues/**/*.cy.js',
    retries: 0,
    screenshotOnRunFailure: false,
  },
});
