import { test, expect } from "@playwright/test";

test("planner supports seeded week navigation around the vertical day rows", async ({
  page,
}) => {
  await page.goto("/planner");

  await expect(page.getByTestId(/^planner-day-row-/)).toHaveCount(7);
  await expect(page.getByTestId("planner-day-row-2026-03-24")).toBeVisible();

  await page.getByRole("button", { name: "Next Week" }).click();
  await expect(page.getByTestId("planner-day-row-2026-03-31")).toBeVisible();

  await page.getByRole("button", { name: "Previous Week" }).click();
  await expect(page.getByTestId("planner-day-row-2026-03-24")).toBeVisible();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByTestId(/^planner-day-row-/)).toHaveCount(7);
});
