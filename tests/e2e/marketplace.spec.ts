import { expect, test } from "@playwright/test";

test("guest visiting marketplace redirects to login", async ({ page }) => {
  await page.goto("/marketplace");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fmarketplace$/);
});
