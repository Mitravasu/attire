import { test, expect } from "@playwright/test";
import { uniqueName } from "../utils/names";
import { expectToast } from "../utils/toasts";

test("home draft outfit flow saves an outfit that appears in the outfits library", async ({
  page,
}) => {
  const outfitName = uniqueName("e2e-outfit");

  await page.goto("/");

  const inventoryCards = page.getByTestId(/^inventory-card-root-/);
  await expect(inventoryCards).toHaveCount(6);

  await inventoryCards.nth(0).getByRole("button", { name: "+ Outfit" }).click();
  await inventoryCards.nth(1).getByRole("button", { name: "+ Outfit" }).click();

  await expect(page.getByTestId("draft-outfit-list").locator("li")).toHaveCount(2);

  await inventoryCards.nth(0).getByRole("button", { name: "In Draft" }).click();
  await expectToast(page, "Item is already in the draft outfit.");

  await page.getByLabel("Outfit Name").fill(outfitName);
  await page.getByTestId("draft-outfit-save").click();

  await expectToast(page, "Outfit saved.");
  await expect(page.getByTestId("draft-outfit-list").locator("li")).toHaveCount(0);

  await page.getByRole("link", { name: "Outfits" }).click();
  await expect(page).toHaveURL(/\/outfits$/);
  await expect(page.getByRole("heading", { name: outfitName })).toBeVisible();
});
