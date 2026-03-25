import { Page, expect } from "@playwright/test";

export async function expectToast(page: Page, message: string) {
  await expect(page.getByTestId("toast-stack")).toContainText(message);
}
