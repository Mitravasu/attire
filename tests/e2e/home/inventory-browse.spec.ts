import { test, expect } from "@playwright/test";

test("home inventory supports filtering and clearing filters", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId(/^inventory-card-root-/)).toHaveCount(6);

  await page.getByLabel("Status").selectOption("archived");

  const archivedCards = page.getByTestId(/^inventory-card-root-/);
  await expect(archivedCards).toHaveCount(1);
  await expect(page.getByText("No inventory items yet")).toHaveCount(0);

  await page.getByRole("button", { name: "Clear All Filters" }).click();
  await expect(page.getByTestId(/^inventory-card-root-/)).toHaveCount(6);
});
