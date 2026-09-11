import { test, expect } from "@playwright/test";

test("다른 탭의 진행 기록 변경도 열린 메뉴에 반영된다", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "투어", exact: true }).click();
  const second = await context.newPage();
  await second.goto("/?tour=road-to-dementia&step=4");
  await expect(second.locator("aside h3")).toHaveText("알츠하이머병");
  await expect(page.getByText("최근 살펴본 질병 · 알츠하이머병")).toBeVisible();
  await second.close();
});

test("모바일에서 이어보기와 공유 입력이 화면 너비 안에 들어온다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/?tour=road-to-dementia&step=2");
  await page.getByRole("button", { name: "링크 복사", exact: true }).click();
  const link = page.getByRole("textbox", { name: "공유 링크" });
  await expect(link).toHaveValue(/step=2$/);
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.getByRole("button", { name: "투어 종료", exact: true }).click();
  await page.getByRole("button", { name: "투어", exact: true }).click();
  await page
    .getByRole("button", { name: "치매로 가는 길 이어보기", exact: true })
    .click();
  await expect(page.locator("aside h3")).toHaveText("뇌경색증");
});

test("공유 영역까지 스크롤한 뒤 다음 단계는 해설 처음부터 보인다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?tour=road-to-dementia&step=2");
  await page
    .getByRole("button", { name: "링크 복사", exact: true })
    .scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "다음 단계", exact: true }).click();
  await expect(page.locator("aside h3")).toHaveText("혈관성치매");
  await expect
    .poll(() =>
      page.locator(".atlas-sheet-content").evaluate((e) => e.scrollTop),
    )
    .toBe(0);
});
