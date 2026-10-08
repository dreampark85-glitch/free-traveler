import { defineConfig, devices } from "@playwright/test";

const previewUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = previewUrl ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Preview URL을 지정하지 않은 로컬 실행에서만 개발 서버를 띄운다.
  webServer: previewUrl
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
