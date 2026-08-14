import { defineConfig, devices } from "@playwright/test";
const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? 3000);

if (!Number.isInteger(playwrightPort) || playwrightPort < 1024 || playwrightPort > 65535) {
  throw new Error("PLAYWRIGHT_PORT must be an integer between 1024 and 65535");
}

const baseURL = `http://127.0.0.1:${playwrightPort}`;
const manageWebServer = !!process.env.CI || process.env.PLAYWRIGHT_MANAGE_SERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  // A route's first hit pays a cold Turbopack compile, which can exceed the
  // default 30s budget on its own. Every test here passed on retry at 60s.
  timeout: 120 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
      },
    },
  ],
  ...(manageWebServer
    ? {
        webServer: {
          command: `pnpm dev --port ${playwrightPort}`,
          url: `${baseURL}/login/host`,
          reuseExistingServer: false,
          timeout: 120 * 1000,
          // Keep CI E2E on mock data and explicitly bypass the real Supabase
          // auth guard, even when the repository has environment defaults.
          env: {
            NEXT_PUBLIC_SUPABASE_URL: "",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
            WELLUBER_DEV_AUTH_BYPASS: "1",
          },
        },
      }
    : {}),
});
