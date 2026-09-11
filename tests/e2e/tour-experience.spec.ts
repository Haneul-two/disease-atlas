import { expect, test, type Page } from "@playwright/test";

async function startTour(page: Page, title: string) {
  await page.getByRole("button", { name: /투어$/ }).click();
  await page.getByRole("button", { name: new RegExp(title) }).click();
  await expect(page.locator("aside")).toBeVisible();
}

// The card and canvas must agree even when a pointer remains over a different node.
test("투어 단계는 다른 노드의 hover보다 우선한다", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL ?? "http://127.0.0.1:3100/");
  await startTour(page, "심장에서 뇌까지");
  const target = page.locator('.atlas-node[title="고지혈증 · 내분비"]');
  const other = page.locator('.atlas-node[title="갑상선기능항진증 · 내분비"]');
  await other.hover({ force: true });
  await page.waitForTimeout(700);
  await expect(target).toHaveCSS("opacity", "1");
  await context.close();
});

test("투어 중 현재 부위를 숨길 수 없다", async ({ page }) => {
  await page.goto("/");
  await startTour(page, "치매로 가는 길");
  const region = page.getByRole("button", { name: "가슴", exact: true });
  if ((await region.count()) && (await region.isEnabled()))
    await region.click();
  await expect(
    page.locator('.atlas-node[title="고혈압 · 가슴"]'),
  ).toBeVisible();
});

test("투어 종료는 기존 필터와 지도 위치를 복원한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "가슴", exact: true }).click();
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await page.waitForTimeout(500);
  const viewport = page.locator(".react-flow__viewport");
  const before = await viewport.getAttribute("style");
  await startTour(page, "치매로 가는 길");
  await expect(
    page.locator('.atlas-node[title="고혈압 · 가슴"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "다음 단계", exact: true }).click();
  await page.getByRole("button", { name: "투어 종료", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "가슴", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(viewport).toHaveAttribute("style", before!);
  await expect(page.locator("#atlas-tour-trigger")).toBeFocused();
});

test("단계 목차, 경로와 완료 요약이 같은 투어를 따른다", async ({ page }) => {
  await page.goto("/");
  await startTour(page, "떨림의 정체");
  await expect(page.locator(".atlas-learning-path")).toHaveCount(3);
  await expect(
    page.getByText("점선은 학습 순서이며, 질병의 진행 경로를 뜻하지 않습니다."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "3단계 이차성파킨슨증", exact: true })
    .click();
  await expect(page.locator("aside h3")).toHaveText("이차성파킨슨증");
  await expect(page.locator('.atlas-node[data-active="true"]')).toHaveAttribute(
    "title",
    "이차성파킨슨증 · 뇌·신경",
  );
  await page.getByRole("button", { name: "다음 단계", exact: true }).click();
  await page.getByRole("button", { name: "투어 마치기", exact: true }).click();
  await expect(page.getByText("하나의 여정을 완주했어요")).toBeVisible();
  await expect(page.locator("aside ul li")).toHaveCount(3);
  await page.getByRole("button", { name: "파킨슨병", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "2단계 파킨슨병", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await page.keyboard.press("Escape");
  await expect(page.locator("aside")).toHaveCount(0);
});

test("모바일 시트를 접고 펼쳐도 현재 단계가 지도 안에 남는다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await startTour(page, "심장에서 뇌까지");
  const panel = page.locator("aside");
  const node = page.locator('.atlas-node[title="고지혈증 · 내분비"]');
  async function expectNodeAboveSheet() {
    await expect
      .poll(async () => {
        const n = await node.boundingBox();
        const p = await panel.boundingBox();
        return (
          !!n &&
          !!p &&
          n.y >= 100 &&
          n.y + n.height < p.y &&
          n.x >= 0 &&
          n.x + n.width <= 390
        );
      })
      .toBe(true);
  }
  await expectNodeAboveSheet();
  const expanded = await panel.boundingBox();
  await page.getByRole("button", { name: "해설 접기", exact: true }).click();
  await expect(panel).toHaveAttribute("data-expanded", "false");
  await expect
    .poll(async () => (await panel.boundingBox())!.height)
    .toBeLessThan(expanded!.height);
  await expectNodeAboveSheet();
  await page.getByRole("button", { name: "해설 펼치기", exact: true }).click();
  await page.getByRole("button", { name: "6단계 뇌졸중", exact: true }).click();
  await page.getByRole("button", { name: "해설 접기", exact: true }).click();
  await page.getByRole("button", { name: "투어 마치기", exact: true }).click();
  await expect(page.getByText("하나의 여정을 완주했어요")).toBeVisible();
  await expect(panel).toHaveAttribute("data-expanded", "true");
});

test("모바일 질병 상세는 접이식 시트로 열리고 Escape로 닫힌다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: /질병 검색/ }).click();
  await page.getByRole("textbox").fill("고혈압");
  await page.getByRole("button", { name: /고혈압/ }).click();
  const panel = page.locator("aside");
  await expect(
    panel.getByRole("heading", { name: "고혈압", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await panel.boundingBox())!.y)
    .toBeGreaterThan(300);
  await page.getByRole("button", { name: "해설 접기", exact: true }).click();
  await expect(panel).toHaveAttribute("data-expanded", "false");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
});

test("가로 화면에서도 키보드 단계 이동과 완료 후 다음 투어가 동작한다", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await startTour(page, "떨림의 정체");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("aside h3")).toHaveText("파킨슨병");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("aside h3")).toHaveText("본태성진전");
  const next = page.getByRole("button", { name: "다음 단계", exact: true });
  await expect(next).toBeInViewport();
  const nextBox = await next.boundingBox();
  expect(nextBox!.height).toBeGreaterThanOrEqual(44);
  await next.click();
  await next.click();
  await next.click();
  await page.getByRole("button", { name: "투어 마치기", exact: true }).click();
  await page
    .getByRole("button", { name: /다음 여정.*심장에서 뇌까지/ })
    .click();
  await expect(page.locator("aside h2")).toHaveText("심장에서 뇌까지");
  await expect(page.locator("aside h3")).toHaveText("고지혈증");
});
