const { defineConfig, devices } = require('@playwright/test');

const emCI = Boolean(process.env.CI);

module.exports = defineConfig({
  testDir: './playwright/tests',
  outputDir: './test-results/playwright',
  // Cada teste cria e remove a própria massa, então todos podem rodar em paralelo.
  fullyParallel: true,
  forbidOnly: emCI,
  // Retentativas apenas no CI; localmente a falha aparece na hora.
  retries: emCI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://front.serverest.dev',
    // Opção própria da suíte, consumida pela fixture `api` (playwright/support/fixtures.js).
    apiURL: process.env.API_URL || 'https://serverest.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testDir: './playwright/tests/api' },
    {
      name: 'chromium',
      testDir: './playwright/tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './playwright/tests/e2e',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
