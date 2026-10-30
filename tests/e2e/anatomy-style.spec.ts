import { test, expect } from "@playwright/test";

test("전체 도판의 부위 확대와 세부 질병명이 연결된다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".atlas-organ")).toHaveCount(4);
  await expect(page.locator('.atlas-node[data-overview="true"]')).toHaveCount(
    80,
  );
  const ordinary = page
    .locator('.atlas-node[data-representative="false"] .atlas-disease-label')
    .first();
  await expect(ordinary).toHaveCSS("opacity", "0");
  await page
    .getByRole("button", { name: "가슴 부위 확대", exact: true })
    .click();
  await expect(page.locator('.atlas-node[data-overview="true"]')).toHaveCount(
    0,
  );
  await expect(ordinary).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "전체 지도", exact: true }).click();
  await expect(page.locator('.atlas-node[data-overview="true"]')).toHaveCount(
    80,
  );
});

test("모바일 부위 버튼이 화면에 들어오고 선택 부위의 장기가 강조된다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const name of ["뇌·신경", "가슴", "복부", "관절", "내분비"]) {
    const button = page.getByRole("button", {
      name: `${name} 부위 확대`,
      exact: true,
    });
    await expect(button).toBeInViewport();
    const box = await button.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
  await page.goto("/?tour=heart-to-brain&step=2");
  await expect(page.locator(".atlas-anatomy")).toHaveAttribute(
    "data-active-zone",
    "chest",
  );
  await expect(page.locator('[data-organ="lungs-heart"]')).toHaveCSS(
    "opacity",
    "0.9",
  );
  await expect(page.locator(".atlas-starfield")).toHaveAttribute(
    "data-focused",
    "true",
  );
  await expect(
    page.locator('.atlas-node[data-active="true"] .atlas-disease-label'),
  ).toHaveCSS("opacity", "1");
});
