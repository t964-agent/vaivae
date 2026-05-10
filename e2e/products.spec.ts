import { expect, test } from "@playwright/test";

test.describe("products", () => {
  test.skip(!process.env["PLAYWRIGHT_INSTALLED"], "Playwright browsers are not installed.");

  test("renders the grid or empty collection state", async ({ page }) => {
    // Arrange / Act
    await page.goto("/products");

    // Assert
    await expect(page.getByRole("heading", { name: /the collection/i })).toBeVisible();
    await expect(
      page
        .getByRole("list")
        .or(page.getByRole("heading", { name: /collection is being prepared/i }))
        .first(),
    ).toBeVisible();
  });
});
