import { expect, test } from "@playwright/test";

test("PC 안내 문구는 한 줄이고 헤더가 화면을 넘지 않는다", async ({ page }) => {
  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const note = page.locator(".atlas-header-disclaimer");
    await expect(note).toBeVisible();
    expect(await note.evaluate(el => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return box.height <= parseFloat(style.lineHeight) + 1 &&
        box.left >= 0 && box.right <= innerWidth &&
        document.documentElement.scrollWidth <= innerWidth;
    })).toBe(true);
  }
});

test("모바일 설명은 한글 단어 단위로 줄바꿈하고 본문 글꼴을 사용한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?disease=angina");
  await expect(page.locator(".atlas-header-disclaimer")).toBeHidden();
  await expect(page.locator(".atlas-body-copy").first()).toHaveCSS("font-size", "15px");
  await expect(page.locator(".atlas-sheet-content")).toHaveCSS("word-break", "keep-all");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
