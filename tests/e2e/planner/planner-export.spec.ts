import { test, expect } from "@playwright/test";
import { expectToast } from "../utils/toasts";

test("planner exports a pdf for selected days", async ({ page }) => {
  await page.goto("/planner");

  const mondayRow = page.getByTestId("planner-day-row-2026-03-23");
  const tuesdayRow = page.getByTestId("planner-day-row-2026-03-24");

  await mondayRow.getByLabel("Select day").check();
  await tuesdayRow.getByLabel("Select day").check();

  await expect(page.getByText("Selected days: 2")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("planner-export-pdf").click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("packing-list-2026-03-23-to-2026-03-24.pdf");
  await expectToast(page, "Packing list PDF exported.");

  await page.getByTestId("planner-clear-selection").click();
  await expect(page.getByText("Selected days: 0")).toBeVisible();
});
