const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e', fullyParallel: true,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: [3000,3001,3002].map((port, index) => ({
    command: 'npm run dev -w @lab/' + ['shell','catalog','cart'][index],
    url: 'http://localhost:' + port, reuseExistingServer: !process.env.CI, timeout: 120000
  })).concat([
    { command: "npm run dev -w @lab/mock-services", url: "http://localhost:4101/products", reuseExistingServer: !process.env.CI, timeout: 30000 },
    { command: "npm run dev -w @lab/catalog-bff", url: "http://localhost:4000/health", reuseExistingServer: !process.env.CI, timeout: 30000 }
  ])
});
