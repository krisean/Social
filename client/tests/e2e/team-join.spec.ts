import { test, expect } from "@playwright/test";

test.describe("Player join view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/play");
  });

  test("validates required fields before attempting to join", async ({ page }) => {
    await page.getByRole("button", { name: /Join game/i }).click();

    await expect(page.getByTestId("code-error")).toHaveText(
      /letters and numbers only/i,
    );
    await expect(page.getByTestId("teamName-error")).toHaveText(
      /at least 2 character/i,
    );
  });

  test("formats the room code input to uppercase and caps at 6 characters", async ({ page }) => {
    const codeInput = page.getByLabel(/Room code/i);

    await codeInput.fill("abc12");
    await codeInput.type("de999");

    await expect(codeInput).toHaveValue("ABC12D");
  });

  test("keeps join form accessible and responsive", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Join Söcial/i })).toBeVisible();
    await expect(page.getByLabel(/Room code/i)).toBeVisible();
    await expect(page.getByLabel(/Team name/i)).toBeVisible();
  });
});
