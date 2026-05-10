import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test.skip(!process.env["PLAYWRIGHT_INSTALLED"], "Playwright browsers are not installed.");

  test("loads brand and hero without console errors", async ({ page }) => {
    // Arrange
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    // Act
    await page.goto("/");

    // Assert
    await expect(page.getByRole("link", { name: /vaïvae home/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /living runway/i })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
