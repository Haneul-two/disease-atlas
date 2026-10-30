import { test, expect } from "@playwright/test";

test("화면 설정은 저장되고 큰 글씨와 도판 레이어가 적용된다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("신체 보기").selectOption("organs");
  await expect(page.locator('svg [data-body-layer="skeleton"]').first()).toBeHidden();
  await page.getByRole("button", { name: "큰 글씨", exact: true }).click();
  await page.getByRole("button", { name: "질병명 정렬", exact: true }).click();
  await expect(page.locator(".atlas-experience")).toHaveAttribute("data-aligned", "true");
  await page.reload();
  await expect(page.getByLabel("신체 보기")).toHaveValue("organs");
  await expect(page.getByRole("button", { name: "큰 글씨", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel("신체 보기").selectOption("skeleton");
  await expect(page.locator('.atlas-organ[data-organ="brain"]')).toBeHidden();
  await expect(page.locator('svg [data-body-layer="skeleton"]').first()).toBeVisible();
});

test("투어 복습은 답을 고른 후 해설을 확인하고 다시 풀 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "큰 글씨", exact: true }).click();
  await page.locator("#atlas-tour-trigger").click();
  await page.getByRole("button", { name: /떨림의 정체/ }).click();
  await page.getByRole("button", { name: "4단계 뇌졸중후유증", exact: true }).click();
  await page.getByRole("button", { name: "투어 마치기", exact: true }).click();
  const review = page.getByRole("region", { name: "투어 복습" });
  await expect(review.getByRole("button", { name: "정답과 해설 확인" })).toBeDisabled();
  await review.getByRole("radio").nth(1).check();
  await review.getByRole("radio").nth(2).check();
  await review.getByRole("button", { name: "정답과 해설 확인" }).click();
  await expect(review.getByRole("status")).toContainText("2문항 중 2문항");
  await review.getByRole("button", { name: "다시 풀기" }).click();
  await expect(review.getByRole("radio").nth(1)).not.toBeChecked();
});

test("저장 제한에서도 화면 설정을 바꾸고 정렬된 질병을 선택할 수 있다", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error("storage blocked"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "질병명 정렬", exact: true }).click();
  await page.getByRole("button", { name: "큰 글씨", exact: true }).click();
  await expect(page.locator(".atlas-experience")).toHaveAttribute("data-readable", "true");
  await page.getByRole("button", { name: /질병 검색/ }).click();
  await page.getByRole("textbox").fill("파킨슨병");
  await page.getByRole("list").getByRole("button", { name: /파킨슨병/ }).click();
  await expect(page.locator(".atlas-anatomy-guide")).toBeVisible();
  await expect(page.locator('.atlas-node[data-selected="true"]')).toBeInViewport();
});
