import { defineConfig } from "@playwright/test";

const FPLAPI = "http://localhost:4010";
const APP = "http://localhost:3200";

// Against a production build, so redirects and prerendering behave as on Vercel.
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: APP, trace: "retain-on-failure" },
  projects: [
    {
      name: "phone",
      use: {
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    {
      command: "node e2e/fplapi.ts",
      url: `${FPLAPI}/api/events`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run build && npm run start -- -p 3200",
      url: APP,
      env: { FPLAPI_URL: FPLAPI },
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
