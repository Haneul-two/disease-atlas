import { test, expect } from "@playwright/test";

test("장기 클릭으로 질병을 강조하고 목록에서 상세로 이동한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".atlas-organ-target").first()).toHaveCSS("fill", "rgba(0, 0, 0, 0)");
  await page.getByRole("button", {name:"폐·기도 관련 질병",exact:true}).click();
  await expect(page.getByRole("heading",{name:"폐·기도",exact:true})).toBeVisible();
  const list=page.getByRole("list",{name:"폐·기도 질병 목록"});
  await expect(list.getByRole("button")).toHaveCount(8);
  await expect(page.locator('.atlas-node[title="폐렴 · 가슴"]')).toHaveCSS("opacity","1");
  await expect(page.locator('.atlas-node[title="협심증 · 가슴"]')).toHaveCSS("opacity","0.1");
  await list.getByRole("button",{name:/폐렴/}).click();
  await expect(page).toHaveURL(/disease=pneumonia/);
  await expect(page.getByRole("heading",{name:"폐렴",exact:true})).toBeVisible();
});

test("모바일 장기 목록은 숨긴 부위도 탐색하고 Escape로 닫힌다", async ({ page }) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto("/");
  await page.getByRole("button",{name:"가슴",exact:true}).click();
  await page.getByRole("button",{name:"장기 탐색",exact:true}).click();
  await page.getByRole("button",{name:/폐·기도.*8개/}).click();
  await expect(page.locator('.atlas-node[title="폐렴 · 가슴"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.keyboard.press("Escape");
  await expect(page.locator("aside")).toHaveCount(0);
});

test("관계선은 키보드로 설명을 열고 양쪽 질병으로 이동한다", async ({ page }) => {
  await page.goto("/");
  const edge=page.getByRole("button",{name:"고혈압 ↔ 뇌졸중 연결 설명",exact:true});
  await edge.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-testid="edge-reasons"]')).toContainText("위험인자");
  await expect(page.getByRole("heading",{name:"고혈압 ↔ 뇌졸중",exact:true})).toBeVisible();
  await page.getByRole("button",{name:"뇌졸중 자세히 보기",exact:true}).click();
  await expect(page).toHaveURL(/disease=stroke/);
});

test("모바일 질병 상세에서 정확한 연결 설명을 선택할 수 있다", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/?disease=hypertension");
  await page.getByText("연결선 설명 보기",{exact:true}).click();
  await page.getByRole("button",{name:"고혈압 · 뇌졸중 연결 설명",exact:true}).click();
  await expect(page.getByRole("heading",{name:"고혈압 ↔ 뇌졸중",exact:true})).toBeVisible();
  const canvas = await page.locator('.react-flow').boundingBox();
  const sheet = await page.locator('aside').boundingBox();
  for (const title of ['고혈압 · 가슴', '뇌졸중 · 뇌·신경']) {
    const node = page.locator(`.atlas-node[title="${title}"]`);
    const box = await node.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(canvas!.y + 60);
    expect(box!.y + box!.height).toBeLessThan(sheet!.y);
  }
});

for (const tour of [
  {slug:"walking-with-age",title:"걸음이 느려지는 이유",first:"파킨슨병"},
  {slug:"bones-and-falls",title:"낙상과 골절을 이해하기",first:"골다공증"},
  {slug:"breathing-with-age",title:"나이가 들며 숨이 찰 때",first:"만성폐쇄성폐질환"},
]) test(`${tour.title} 투어를 끝내고 기록에서 이어본다`, async ({page})=>{
  await page.goto(`/?tour=${tour.slug}&step=1`);
  await expect(page.getByRole("heading",{name:tour.title,exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:tour.first,exact:true})).toBeVisible();
  await page.getByText("참고 자료",{exact:true}).click();
  expect(await page.locator('aside a[target="_blank"]').count()).toBeGreaterThan(1);
  for(let i=0;i<3;i++) await page.getByRole("button",{name:/다음 단계/}).click();
  await page.getByRole("button",{name:/투어 마치기/}).click();
  await expect(page).toHaveURL(/done=1/);
  await page.reload();
  await expect(page.getByText("여정 완료",{exact:true})).toBeVisible();
});


test("지도 관계선을 포인터로 누르면 해당 설명이 열린다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".react-flow__edge-interaction").first()).toBeVisible();
  const point = await page.locator('.react-flow__edge-interaction').evaluateAll(paths => {
    for (const element of paths) {
      const path = element as SVGPathElement;
      const owner = path.closest('[role="button"]');
      const matrix=path.getScreenCTM();
      if(!owner || !matrix) continue;
      for(const fraction of [.2,.4,.6,.8]) {
        const local=path.getPointAtLength(path.getTotalLength()*fraction);
        const screen=new DOMPoint(local.x,local.y).matrixTransform(matrix);
        if(screen.x<30 || screen.x>innerWidth-30 || screen.y<180 || screen.y>innerHeight-80) continue;
        if(document.elementFromPoint(screen.x,screen.y)?.closest('[role="button"]')===owner)
          return {x:screen.x,y:screen.y,title:owner.getAttribute('aria-label')!.replace(/ 연결 설명$/, '')};
      }
    }
    return null;
  });
  expect(point).not.toBeNull();
  await page.mouse.click(point!.x,point!.y);
  await expect(page.getByRole('heading',{name:point!.title,exact:true})).toBeVisible();
});
