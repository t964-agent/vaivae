import { defineConfig, devices } from "@playwright/test";

const port = process.env["PORT"] ?? "3000";
const baseURL = process.env["PLAYWRIGHT_BASE_URL"] ?? `http://localhost:${port}`;
const shouldStartWebServer =
  Boolean(process.env["PLAYWRIGHT_INSTALLED"]) && !process.env["PLAYWRIGHT_BASE_URL"];
const webServerEnv = [
  "NEXT_PUBLIC_BASE_URL=http://localhost:3000",
  "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000",
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_vaivae",
  "NEXT_PUBLIC_SANITY_DATASET=development",
  "NEXT_PUBLIC_SANITY_PROJECT_ID=playwright",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_vaivae",
  "REGION_ID=reg_playwright",
  "SANITY_REVALIDATE_SECRET=playwright",
];

export default defineConfig({
  forbidOnly: Boolean(process.env["CI"]),
  fullyParallel: true,
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env["CI"] ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  ...(shouldStartWebServer
    ? {
        webServer: {
          command: `${webServerEnv.join(" ")} pnpm --filter @vaivae/storefront dev`,
          reuseExistingServer: !process.env["CI"],
          timeout: 120_000,
          url: baseURL,
        },
      }
    : {}),
  ...(process.env["CI"] ? { workers: 1 } : {}),
});
