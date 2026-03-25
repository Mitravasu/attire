import { test, expect } from "@playwright/test";

test("app shell navigation reaches the three main screens", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();

  await page.getByRole("link", { name: "Outfits" }).click();
  await expect(page).toHaveURL(/\/outfits$/);
  await expect(page.getByRole("heading", { level: 1, name: "Outfits" })).toBeVisible();

  await page.getByRole("link", { name: "Planner" }).click();
  await expect(page).toHaveURL(/\/planner$/);
  await expect(page.getByRole("heading", { level: 1, name: "Planner" })).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Inventory" })).toBeVisible();
});
