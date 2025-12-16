import { test, expect } from "@playwright/test";

test.describe("Global How to Play modal", () => {
  test("opens from the floating action and lists steps", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /How to play/i }).click();

    const modalHeading = page.getByRole("heading", { name: /HOW TO PLAY/i });
    await expect(modalHeading).toBeVisible();

    await page.getByRole("button", { name: /Got it/i }).click();
    await expect(modalHeading).not.toBeVisible();
  });
});
