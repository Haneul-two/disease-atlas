import { test, expect } from "@playwright/test";

test("동작 줄이기에서도 배경 별이 보이고 선택 후에도 남는다", async ({ page }) => {
  await page.goto("/");
  const field = page.locator(".atlas-starfield");
  const star = field.locator("span").first();
  const brightness = async () => star.evaluate(el => Number(getComputedStyle(el).opacity) * Number(getComputedStyle(el.parentElement!).opacity));
  expect(await brightness()).toBeGreaterThanOrEqual(0.3);
  await page.goto("/?disease=angina");
  await expect(field).toHaveAttribute("data-focused", "true");
  expect(await brightness()).toBeGreaterThanOrEqual(0.18);
  await expect(star).toHaveCSS("animation-name", "none");
});

test("일반 모션의 별은 위치를 유지하며 밝기만 반짝인다", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const star = page.locator(".atlas-background-star").first();
  await expect(star).toHaveCSS("animation-name", "twinkle");
  const samples = await star.evaluate(el => {
    const animation = el.getAnimations()[0];
    animation.pause();
    const timing = animation.effect!.getTiming();
    const delay = Number(timing.delay);
    animation.currentTime = delay + Number(timing.duration) * 2;
    const low = Number(getComputedStyle(el).opacity);
    const box = el.getBoundingClientRect();
    animation.currentTime = delay + Number(timing.duration) * 2.5;
    return { low, high: Number(getComputedStyle(el).opacity), x: box.x, afterX: el.getBoundingClientRect().x };
  });
  expect(samples.high).toBeGreaterThan(samples.low + .3);
  expect(samples.afterX).toBe(samples.x);
});

test("질병 선택은 대응 장기를 표시하고 전신 질환은 한 장기로 한정하지 않는다", async ({ page }) => {
  await page.goto("/?disease=angina");
  await expect(page.locator(".atlas-anatomy-guide text")).toHaveText("심장·혈관");
  await page.goto("/?disease=plantar-fasciitis");
  await expect(page.locator(".atlas-anatomy-guide text")).toHaveText("발");
  await page.goto("/?disease=diabetes");
  await expect(page.locator(".atlas-anatomy-guide")).toHaveCount(0);
});

test("작은 화면에서 선택 질병과 장기 기준점이 상세 시트 위에 함께 보인다", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/?disease=angina");
  const anchor = page.locator(".atlas-anatomy-guide circle");
  await expect(anchor).toBeInViewport();
  const box=await anchor.boundingBox();
  const sheet=await page.locator("aside").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y+box!.height).toBeLessThan(sheet!.y);
  await expect(page.locator('.atlas-node[data-selected="true"]')).toBeInViewport();
});
