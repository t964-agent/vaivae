import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/products", "/login"] as const;

test.describe("accessibility", () => {
  test.skip(!process.env["PLAYWRIGHT_INSTALLED"], "Playwright browsers are not installed.");

  for (const route of routes) {
    test(`${route} has no serious or critical WCAG 2.1 AA violations`, async ({ page }) => {
      // Arrange / Act
      await page.goto(route);
      await page.getByRole("main").waitFor();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blockingViolations = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );

      // Assert
      expect(blockingViolations).toEqual([]);
    });
  }
});
