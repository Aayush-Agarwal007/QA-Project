const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/ui',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'node app/server.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
});
