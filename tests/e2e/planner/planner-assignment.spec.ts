import { test, expect } from "@playwright/test";
import { expectToast } from "../utils/toasts";

test("planner assigns and removes an outfit using the non-drag fallback", async ({
  page,
}) => {
  await page.goto("/planner");

  const dayRow = page.getByTestId("planner-day-row-2026-03-25");
  await expect(dayRow).toBeVisible();

  await dayRow.getByLabel("Select day").check();
  await page.getByLabel("Search outfits").fill("Monday Office Uniform");
  await expect(page.getByTestId("planner-sidebar")).toContainText("Assign to selected day");
  await expect(page.getByTestId("planner-sidebar")).toContainText("Monday Office Uniform");

  const sidebarOutfit = page.getByTestId(/^planner-sidebar-outfit-/).filter({
    has: page.getByText("Monday Office Uniform"),
  });

  await sidebarOutfit.getByRole("button", { name: "Assign to selected day" }).click();
  await expectToast(page, "Outfit planned.");
  await expect(dayRow).toContainText("Monday Office Uniform");

  const newEntry = dayRow.getByTestId(/^planner-entry-/).filter({
    has: page.getByText("Monday Office Uniform"),
  });

  await newEntry.getByRole("button", { name: "Remove" }).click();
  await expectToast(page, "Planned outfit removed.");
  await expect(dayRow).not.toContainText("Monday Office Uniform");
});
