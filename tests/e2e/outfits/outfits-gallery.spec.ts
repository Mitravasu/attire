import { test, expect } from "@playwright/test";

test("outfits page renders seeded outfits", async ({ page }) => {
  await page.goto("/outfits");

  await expect(page.getByRole("heading", { name: "Monday Office Uniform" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weekend Coffee Run" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Carry-On Capsule" })).toBeVisible();
});
