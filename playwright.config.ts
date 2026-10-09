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
  // Preview URL을 지정하지 않은 실행에서만 서버를 띄운다.
  // CI는 요청마다 컴파일하는 개발 서버 대신 빌드한 서버를 써서 첫 요청 지연으로 인한 시간 초과를 막는다.
  webServer: previewUrl
    ? undefined
    : {
        command: process.env.CI
          ? "npm run build && npm run start"
          : "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: process.env.CI ? 300_000 : 120_000,
      },
});
