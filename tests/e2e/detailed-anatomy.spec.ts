import { expect, test } from "@playwright/test";

test("상세 해부도 이미지를 읽고 보기 전환에 맞춰 안내점과 클릭 영역을 이동한다", async ({ page }) => {
  await page.goto("/");
  const image = page.locator(".atlas-detailed-body");
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  const heart = page.getByRole("button", { name: "심장·혈관 관련 질병", exact: true });
  await expect(heart).toHaveAttribute("cy", "379");
  await page.getByLabel("신체 보기").selectOption("all");
  await expect(image).toHaveCount(0);
  await expect(heart).toHaveAttribute("cy", "535");
  await page.getByLabel("신체 보기").selectOption("illustration");
  await page.getByRole("button", { name: /질병 검색/ }).click();
  await page.getByRole("textbox").fill("협심증");
  await page.getByRole("list").getByRole("button", { name: /협심증/ }).click();
  await expect(page.locator(".atlas-anatomy-guide circle")).toHaveAttribute("cy", "379");
  await expect(page.locator('.atlas-node[data-selected="true"]')).toBeInViewport();
});
