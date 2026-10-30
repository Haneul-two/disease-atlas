import { test, expect } from "@playwright/test";
const key = "disease-atlas:tour-progress:v1";

test("투어 링크를 새로고침하고 나간 뒤 같은 단계부터 이어본다", async ({
  page,
}) => {
  await page.goto("/?tour=road-to-dementia&step=3");
  await expect(page.locator("aside h3")).toHaveText("혈관성치매");
  await page.reload();
  await expect(page.locator("aside h3")).toHaveText("혈관성치매");
  await page.getByRole("button", { name: "투어 종료", exact: true }).click();
  await page.getByRole("button", { name: "투어", exact: true }).click();
  await page
    .getByRole("button", { name: "치매로 가는 길 이어보기", exact: true })
    .click();
  await expect(page.locator("aside h3")).toHaveText("혈관성치매");
  await expect(page).toHaveURL(/step=3/);
});

test("질병과 투어 단계 사이 뒤로·앞으로가 화면과 URL에 반영된다", async ({
  page,
}) => {
  await page.goto("/?disease=hypertension");
  await expect(page.locator("aside h2")).toHaveText("고혈압");
  await page.getByRole("button", { name: "투어", exact: true }).click();
  await page.getByRole("button", { name: /떨림의 정체/ }).click();
  await page.getByRole("button", { name: "다음 단계", exact: true }).click();
  await expect(page).toHaveURL(/step=2/);
  await page.goBack();
  await expect(page.locator("aside h3")).toHaveText("본태성진전");
  await page.goBack();
  await expect(page.locator("aside h2")).toHaveText("고혈압");
  await page.goForward();
  await expect(page.locator("aside h3")).toHaveText("본태성진전");
});

test("완료 기록 유지·처음부터·학습 기록 지우기를 제공한다", async ({
  page,
}) => {
  await page.goto("/?tour=what-is-that-tremor&step=4");
  await page.getByRole("button", { name: "투어 마치기", exact: true }).click();
  await expect(page).toHaveURL(/done=1/);
  await page.reload();
  await expect(page.getByText("하나의 여정을 완주했어요")).toBeVisible();
  await page.getByRole("button", { name: "투어 종료", exact: true }).click();
  await page.getByRole("button", { name: "투어", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "떨림의 정체 완료 요약", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "떨림의 정체 처음부터", exact: true })
    .click();
  await expect(page.locator("aside h3")).toHaveText("본태성진전");
  await page.getByRole("button", { name: "투어 종료", exact: true }).click();
  await page.getByRole("button", { name: "투어", exact: true }).click();
  await page
    .getByRole("button", { name: "학습 기록 지우기", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate((k) => localStorage.getItem(k), key))
    .toBeNull();
  await expect(
    page.getByRole("button", { name: "떨림의 정체 이어보기", exact: true }),
  ).toHaveCount(0);
});

test("저장 실패·잘못된 기록에서도 링크와 투어가 작동한다", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });
  await page.goto("/?tour=road-to-dementia&step=2");
  await expect(page.locator("aside h3")).toHaveText("뇌경색증");
  await expect(page.getByText(/진행을 저장하지 못했어요/)).toBeVisible();
  await page.getByRole("button", { name: "다음 단계", exact: true }).click();
  await expect(page.locator("aside h3")).toHaveText("혈관성치매");
});

test("클립보드 거부 시 현재 질병 링크를 수동 복사할 수 있다", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/?disease=hypertension&campaign=private");
  await page.getByRole("button", { name: "링크 복사", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "공유 링크" })).toHaveValue(
    /\/\?disease=hypertension$/,
  );
  await expect(
    page.getByText("아래 주소를 선택해 복사해 주세요."),
  ).toBeVisible();
});

test("투어 링크 복사는 현재 단계를 담고 잘못된 주소는 정규화한다", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: (text: string) => {
          document.documentElement.dataset.copied = text;
          return Promise.resolve();
        },
      },
    }),
  );
  await page.goto("/?tour=road-to-dementia&step=999&disease=missing");
  await expect(page.locator("aside h3")).toHaveText("정상압수두증");
  await expect(page).toHaveURL(/\?tour=road-to-dementia&step=5$/);
  await page.getByRole("button", { name: "링크 복사", exact: true }).click();
  await expect(page.getByText("링크를 복사했어요.")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-copied", /step=5$/);
});
