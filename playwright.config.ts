import { defineConfig, devices } from '@playwright/test'

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

export default defineConfig({
  timeout: 120000,
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: externalBaseURL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: bypassSecret
      ? { 'x-vercel-protection-bypass': bypassSecret }
      : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'NEXT_TELEMETRY_DISABLED=1 npm run dev -- -H 127.0.0.1 -p 3000 --turbo',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
})
