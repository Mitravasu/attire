import { test, expect } from "@playwright/test";

test("outfits page renders seeded outfits", async ({ page }) => {
  await page.goto("/outfits");

  const firstOutfitCard = page.getByTestId(/^outfit-card-root-/).first();
  await expect(firstOutfitCard).toBeVisible();
  await expect(firstOutfitCard.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(firstOutfitCard.getByRole("button", { name: "Delete" })).toBeVisible();
});
