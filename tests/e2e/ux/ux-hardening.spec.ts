import { test, expect } from "@playwright/test";

test("add-item modal traps focus and warns before discarding dirty changes", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Add Item" }).press("Enter");
  await expect(page.getByRole("heading", { name: "Add Item" })).toBeVisible();
  await expect(page.locator("#add-item-title")).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Save Item" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.locator("#add-item-title")).toBeFocused();

  await page.locator("#add-item-title").fill("Unsaved modal test");
  await page.keyboard.press("Escape");

  await expect(page.getByRole("heading", { name: "Discard changes?" })).toBeVisible();
  await page.getByRole("button", { name: "Keep Editing" }).click();
  await expect(page.getByRole("heading", { name: "Add Item" })).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Discard Changes" }).click();
  await expect(page.getByRole("heading", { name: "Add Item" })).toHaveCount(0);
});

test("draft outfit clear action warns before discarding unsaved work", async ({
  page,
}) => {
  await page.goto("/");

  const inventoryCards = page.getByTestId(/^inventory-card-root-/);
  await inventoryCards.nth(0).getByRole("button", { name: "+ Outfit" }).click();
  await page.getByLabel("Outfit Name").fill("Unsaved draft");

  await page
    .getByTestId("draft-outfit-panel")
    .getByRole("button", { name: "Clear" })
    .click();
  await expect(page.getByRole("heading", { name: "Discard changes?" })).toBeVisible();

  await page.getByRole("button", { name: "Keep Editing" }).click();
  await expect(page.getByTestId("draft-outfit-list").locator("li")).toHaveCount(1);
  await expect(page.getByLabel("Outfit Name")).toHaveValue("Unsaved draft");

  await page
    .getByTestId("draft-outfit-panel")
    .getByRole("button", { name: "Clear" })
    .click();
  await page.getByRole("button", { name: "Discard Changes" }).click();
  await expect(page.getByTestId("draft-outfit-list").locator("li")).toHaveCount(0);
  await expect(page.getByLabel("Outfit Name")).toHaveValue("");
});
