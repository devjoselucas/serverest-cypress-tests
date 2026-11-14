const { defineConfig } = require('cypress');
const { plugin: grepPlugin } = require('@cypress/grep/plugin');

module.exports = defineConfig({
  // Relatório HTML único por execução, com screenshots das falhas embutidos.
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'reports/cypress',
    reportPageTitle: 'ServeRest - Cypress',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    // Pode ser sobrescrita com a variável de ambiente CYPRESS_BASE_URL.
    baseUrl: 'https://front.serverest.dev',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    // Retentativas apenas no modo headless (CI); localmente a falha aparece na hora.
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      // Com grepFilterSpecs, specs sem testes da tag pedida nem chegam a ser abertos.
      grepPlugin(config);
      return config;
    },
  },
  expose: {
    // Pode ser sobrescrita com: npx cypress run --expose apiUrl=http://localhost:3000
    apiUrl: process.env.API_URL || 'https://serverest.dev',
  },
});
