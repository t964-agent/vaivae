import { expect, test } from "@playwright/test";

test.describe("empty checkout", () => {
  test.skip(!process.env["PLAYWRIGHT_INSTALLED"], "Playwright browsers are not installed.");

  test("shows the empty-cart recovery path", async ({ page }) => {
    // Arrange / Act
    await page.goto("/checkout");

    // Assert
    await expect(page.getByRole("heading", { name: /your bag is quiet/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /discover the collection/i })).toHaveAttribute(
      "href",
      "/products",
    );
  });
});
