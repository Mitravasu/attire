import { test, expect } from "@playwright/test";

test.describe("mobile smoke", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test("home renders stacked layout and touch-accessible inventory actions", async ({
    page,
  }) => {
    await page.goto("/");

    const firstCard = page.getByTestId(/^inventory-card-root-/).first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: "Edit Item" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(page.getByRole("heading", { name: "Edit Item" })).toHaveCount(0);
  });

  test("outfits exposes mobile edit and delete actions", async ({ page }) => {
    await page.goto("/outfits");

    const firstOutfitCard = page.getByTestId(/^outfit-card-root-/).first();
    await expect(firstOutfitCard).toBeVisible();

    await firstOutfitCard.getByRole("button", { name: "Edit" }).last().click();
    await expect(page.getByRole("heading", { name: "Edit Outfit" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(page.getByRole("heading", { name: "Edit Outfit" })).toHaveCount(0);

    await firstOutfitCard.getByRole("button", { name: "Delete" }).last().click();
    await expect(page.getByRole("heading", { name: "Delete Outfit" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(page.getByRole("heading", { name: "Delete Outfit" })).toHaveCount(0);
  });

  test("planner keeps the selected-day assignment path usable on mobile", async ({
    page,
  }) => {
    await page.goto("/planner");

    const dayRow = page.getByTestId("planner-day-row-2026-03-25");
    await expect(dayRow).toBeVisible();

    await dayRow.getByLabel("Select day").check();
    await expect(page.getByTestId("planner-sidebar")).toContainText(
      "Assign to selected day",
    );
  });
});
