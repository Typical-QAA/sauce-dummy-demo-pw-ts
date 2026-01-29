// @ts-check
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../../tests',
  fullyParallel: true,
  retries: 0, // NOTE: disable retries for immediate feedback on CI failures
  workers: 2, // NOTE: only two workers to avoid possible rate limiting
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../playwright-report/html/ci' }],
    ['junit', { outputFile: '../../playwright-report/junit/results.xml' }],
    ['json', { outputFile: '../../playwright-report/json/results.json' }],
    ['allure-playwright']
  ],
  use: {
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    acceptDownloads: true
  },
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'api',
      testDir: '../../tests/api',
      testMatch: '**/*.spec.ts',
      use: { baseURL: process.env.PW_BASE_API_URL || 'https://dummyjson.com' }
    },
    {
      name: 'web-chrome',
      testDir: '../../tests/web',
      testMatch: '**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'chromium', baseURL: process.env.PW_BASE_WEB_URL || 'https://www.saucedemo.com' }
    }
  ]
})
