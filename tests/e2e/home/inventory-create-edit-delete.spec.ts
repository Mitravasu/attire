import { test, expect } from "@playwright/test";
import { backImagePath, frontImagePath } from "../utils/uploads";
import { uniqueName } from "../utils/names";
import { expectToast } from "../utils/toasts";

test("home supports creating, editing, and deleting an inventory item", async ({
  page,
}) => {
  const initialName = uniqueName("e2e-shirt");
  const updatedName = `${initialName}-updated`;

  await page.goto("/");

  await page.getByRole("button", { name: "Add Item" }).click();
  await expect(page.getByRole("heading", { name: "Add Item" })).toBeVisible();

  await page.getByRole("button", { name: "Save Item" }).click();
  await expect(page.getByText("Title is required.")).toBeVisible();
  await expect(page.getByText("At least one tag is required.")).toBeVisible();
  await expect(page.getByText("Front image is required.")).toBeVisible();

  await page.locator("#add-item-title").fill(initialName);
  await page.locator("#add-item-tags").fill("e2e, shirt");
  await page.locator("#add-item-color").fill("green");
  await page.locator("#add-item-type").selectOption("top");
  await page.locator("#add-item-status").selectOption("clean");
  await page.locator("#add-item-front-image").setInputFiles(frontImagePath);
  await page.locator("#add-item-back-image").setInputFiles(backImagePath);
  await page.locator("#add-item-form").evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });

  await expectToast(page, "Inventory item created.");
  await expect(page.getByRole("heading", { name: "Add Item" })).toHaveCount(0);

  const createdCard = page.getByTestId(/^inventory-card-root-/).filter({
    has: page.getByRole("heading", { name: initialName }),
  });

  await expect(createdCard).toHaveCount(1);

  await createdCard.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Edit Item" })).toBeVisible();

  await page.locator("#edit-item-title").fill(updatedName);
  await page.locator("#edit-item-form").evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });

  await expectToast(page, "Inventory item updated.");
  await expect(page.getByRole("heading", { name: "Edit Item" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();

  const updatedCard = page.getByTestId(/^inventory-card-root-/).filter({
    has: page.getByRole("heading", { name: updatedName }),
  });

  await updatedCard.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("heading", { name: "Delete Item" })).toBeVisible();
  await page.getByRole("button", { name: "Delete Item" }).click();

  await expectToast(page, "Inventory item deleted.");
  await expect(page.getByRole("heading", { name: updatedName })).toHaveCount(0);
});
