import { test, expect } from "@playwright/test";
import { uniqueName } from "../utils/names";
import { expectToast } from "../utils/toasts";

test("outfits page supports editing and deleting a newly created outfit", async ({
  page,
}) => {
  const outfitName = uniqueName("e2e-outfit");
  const updatedOutfitName = `${outfitName}-updated`;

  await page.goto("/");

  const inventoryCards = page.getByTestId(/^inventory-card-root-/);
  await expect(inventoryCards).toHaveCount(6);

  await inventoryCards.nth(0).getByRole("button", { name: "+ Outfit" }).click();
  await inventoryCards.nth(1).getByRole("button", { name: "+ Outfit" }).click();
  await page.getByLabel("Outfit Name").fill(outfitName);
  await page.getByTestId("draft-outfit-save").click();
  await expectToast(page, "Outfit saved.");

  await page.getByRole("link", { name: "Outfits" }).click();
  await expect(page.getByRole("heading", { name: outfitName })).toBeVisible();

  const createdOutfitCard = page.getByTestId(/^outfit-card-root-/).filter({
    has: page.getByRole("heading", { name: outfitName }),
  });

  await createdOutfitCard.getByRole("button", { name: "Edit" }).first().click();
  await expect(page.getByRole("heading", { name: "Edit Outfit" })).toBeVisible();

  await page.locator("#edit-outfit-name").fill(updatedOutfitName);
  await page.getByTestId("outfit-selected-items").locator('[data-testid^="outfit-selected-item-"]').first().getByRole("button", { name: "Remove" }).click();
  await page.getByTestId("outfit-available-items").locator('[data-testid^="outfit-available-item-"]').first().getByRole("button", { name: "Add" }).click();
  await page.getByTestId("edit-outfit-form").evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });

  await expectToast(page, "Outfit updated.");
  await expect(page.getByRole("heading", { name: updatedOutfitName })).toBeVisible();

  const updatedOutfitCard = page.getByTestId(/^outfit-card-root-/).filter({
    has: page.getByRole("heading", { name: updatedOutfitName }),
  });

  await updatedOutfitCard.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByRole("heading", { name: "Delete Outfit" })).toBeVisible();
  await page.getByRole("button", { name: "Delete Outfit" }).click();

  await expectToast(page, "Outfit deleted.");
  await expect(page.getByRole("heading", { name: updatedOutfitName })).toHaveCount(0);
});
