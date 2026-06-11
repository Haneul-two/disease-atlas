# Disease Atlas v1.1 구현 계획 — 퀵 투어 + 콘텐츠 확충

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 노인성 질환 테마의 수동 스텝 투어 모드 3개를 추가하고, 질병을 46개 → 80개로 균형 확충한다.

**Architecture:** 투어는 정적 TS 파일(`src/lib/tours.ts`)로 큐레이션하고, slug→노드 매핑으로 기존 `focusNode()` 카메라 이동을 재사용한다. 시드 데이터는 `prisma/seed-data.ts`로 분리해 테스트(node:test + tsx)에서 정합성을 검증한다. 부위당 16개를 수용하도록 `ZONE_LAYOUT` 좌표를 재조정하고 실루엣은 scale로 맞춘다.

**Tech Stack:** Next.js 16 (App Router/TS), React Flow(@xyflow/react), Prisma 7 + Neon PG, tsx `--test`(node:test, 신규 의존성 없음)

**설계 문서:** `docs/superpowers/specs/2026-06-11-tour-content-expansion-design.md`

**주의사항 (전 태스크 공통):**
- `.env.local`의 DATABASE_URL은 **프로덕션 Neon DB**다. `npm run db:seed`는 prod 데이터를 바꾼다(upsert라 비파괴). 시드 실행은 Task 8(배포)에서만 한다.
- `AtlasNode`에는 `slug`가 이미 있다 (`atlas-types.ts:18`, `atlas-data.ts:37`) — 추가 작업 불필요.
- Playwright MCP 검증 시 **반드시 `browser_resize`로 뷰포트를 먼저 지정**할 것 (미지정 시 fitView 불일치로 화면 밖 좌표 유령 호버 버그 전력 있음).

---

### Task 1: 테스트 인프라 + 시드 데이터 분리

투어 검증 테스트가 시드의 질병 slug 목록을 임포트해야 하는데, `seed.ts`는 임포트 즉시 DB에 연결·시딩하므로 데이터 배열을 별도 모듈로 분리한다.

**Files:**
- Create: `prisma/seed-data.ts` (seed.ts의 `bodyParts`/`categories`/`diseases`/`relations` 배열 + `DiseaseSeed` 타입 이동)
- Modify: `prisma/seed.ts` (배열 정의 제거, `./seed-data`에서 임포트)
- Modify: `package.json` (test 스크립트)
- Test: `tests/seed-data.test.ts`

- [ ] **Step 1: seed-data.ts로 데이터 분리**

`prisma/seed.ts`의 11~376행(`Seedable` 타입부터 `relations` 배열 끝까지)을 잘라내 `prisma/seed-data.ts`로 옮기고 export를 붙인다:

```ts
// Disease Atlas — 시드 데이터 (교육용 · 비의학적)
// seed.ts와 테스트가 함께 사용하므로 부수효과 없는 순수 데이터만 둔다.

export type DiseaseSeed = {
  slug: string;
  name: string;
  description: string;
  treatment: string;
  bodyPart: string;
  category: string | null;
  symptoms: string[];
};

export type RelationSeed = { from: string; to: string; type: string; note?: string };

export const bodyParts = [ /* 기존 그대로 이동 */ ];
export const categories = [ /* 기존 그대로 이동 */ ];
export const diseases: DiseaseSeed[] = [ /* 기존 46개 그대로 이동 */ ];
export const relations: RelationSeed[] = [ /* 기존 30개 그대로 이동 */ ];
```

`seed.ts` 상단은 다음만 남긴다 (main() 이하는 그대로):

```ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { bodyParts, categories, diseases, relations } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

(`Seedable` 타입은 미사용이므로 이동하지 말고 삭제한다.)

- [ ] **Step 2: test 스크립트 추가**

`package.json` scripts에 추가:

```json
"test": "tsx --test tests/*.test.ts"
```

- [ ] **Step 3: 시드 정합성 테스트 작성**

`tests/seed-data.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { bodyParts, categories, diseases, relations } from "../prisma/seed-data";

const partSlugs = new Set(bodyParts.map((b) => b.slug));
const catSlugs = new Set(categories.map((c) => c.slug));
const diseaseSlugs = new Set(diseases.map((d) => d.slug));

test("질병 slug는 중복이 없다", () => {
  assert.equal(diseaseSlugs.size, diseases.length);
});

test("모든 질병의 bodyPart/category 참조가 유효하다", () => {
  for (const d of diseases) {
    assert.ok(partSlugs.has(d.bodyPart), `${d.slug}: 부위 ${d.bodyPart}`);
    if (d.category) assert.ok(catSlugs.has(d.category), `${d.slug}: 계통 ${d.category}`);
    assert.ok(d.symptoms.length >= 1, `${d.slug}: 증상 없음`);
  }
});

test("모든 관계의 from/to가 존재하는 질병이다", () => {
  for (const r of relations) {
    assert.ok(diseaseSlugs.has(r.from), `관계 from: ${r.from}`);
    assert.ok(diseaseSlugs.has(r.to), `관계 to: ${r.to}`);
  }
});

test("관계 (from,to,type) 조합은 중복이 없다", () => {
  const keys = relations.map((r) => `${r.from}__${r.to}__${r.type}`);
  assert.equal(new Set(keys).size, keys.length);
});
```

- [ ] **Step 4: 테스트와 임포트 검증 실행**

```bash
npm test
npx tsx -e "import('./prisma/seed-data.ts').then(m => console.log(m.diseases.length, m.relations.length))"
```

기대: 테스트 4개 모두 PASS, 두 번째 출력 `46 30`. (db:seed는 실행하지 않는다 — prod DB.)

- [ ] **Step 5: 커밋**

```bash
git add prisma/seed-data.ts prisma/seed.ts package.json tests/seed-data.test.ts
git commit -m "refactor: 시드 데이터 분리 + node:test 정합성 테스트"
```

---

### Task 2: 레이아웃 재조정 (TDD — 겹침 회귀 테스트 먼저)

부위당 16개가 되면 chest/abdomen(3열)은 6행으로 늘어나 인접 클러스터를 침범한다. 클러스터 겹침을 검출하는 테스트를 먼저 쓰고(현 설정으로 FAIL 확인), `ZONE_LAYOUT`을 재조정해 통과시킨다.

**Files:**
- Test: `tests/layout.test.ts`
- Modify: `src/lib/atlas-layout.ts:11-17` (ZONE_LAYOUT)
- Modify: `src/components/atlas/Silhouette.tsx` (실루엣 스케일)

- [ ] **Step 1: 겹침 테스트 작성**

`tests/layout.test.ts`. 노드 1개의 시각적 박스는 좌상단 기준 약 96×24px(focusNode의 +48,+12 중심 보정에서 역산):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { zonePositions } from "../src/lib/atlas-layout";

// 부위당 목표 상한 (80개 / 5부위)
const COUNTS: Record<string, number> = {
  head: 16, chest: 16, abdomen: 16, limbs: 16, endocrine: 16,
};
const NODE_W = 96; // 별 + 라벨 폭
const NODE_H = 24;
const MARGIN = 8;  // 클러스터 간 최소 시각적 여유

function bbox(zone: string) {
  const pts = zonePositions(zone, COUNTS[zone]);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs) - MARGIN,
    maxX: Math.max(...xs) + NODE_W + MARGIN,
    minY: Math.min(...ys) - MARGIN,
    maxY: Math.max(...ys) + NODE_H + MARGIN,
  };
}

test("부위당 16개일 때 클러스터 박스가 서로 겹치지 않는다", () => {
  const zones = Object.keys(COUNTS);
  for (let i = 0; i < zones.length; i++)
    for (let j = i + 1; j < zones.length; j++) {
      const a = bbox(zones[i]);
      const b = bbox(zones[j]);
      const overlap =
        a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
      assert.ok(!overlap, `${zones[i]} ↔ ${zones[j]} 클러스터 겹침`);
    }
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test
```

기대: layout 테스트 FAIL (`chest ↔ abdomen 클러스터 겹침` 등 — 현 3열 설정은 16개에서 6행이 되어 침범).

- [ ] **Step 3: ZONE_LAYOUT 재조정**

`atlas-layout.ts`의 `ZONE_LAYOUT`을 다음 시작값으로 교체 (chest/abdomen 3→4열로 행 수를 4로 고정, 중앙축 cy를 아래로 펼치고, 내분비는 머리 클러스터 폭 밖으로 우측 이동):

```ts
const ZONE_LAYOUT: Record<string, ZoneConfig> = {
  head: { cx: 470, cy: 215, cols: 4, gapX: 132, gapY: 86 }, // 머리~목덜미 = 뇌·신경 (불변)
  endocrine: { cx: 950, cy: 560, cols: 2, gapX: 120, gapY: 84 }, // 우측 세로 띠(목·샘) = 내분비
  chest: { cx: 470, cy: 560, cols: 4, gapX: 132, gapY: 86 }, // 가슴
  abdomen: { cx: 470, cy: 905, cols: 4, gapX: 132, gapY: 86 }, // 복부
  limbs: { cx: 470, cy: 1250, cols: 4, gapX: 132, gapY: 86 }, // 다리·척추 = 관절
};
```

테스트가 통과할 때까지 cx/cy만 미세 조정한다 (cols·gap은 유지).

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

기대: 전부 PASS.

- [ ] **Step 5: 실루엣 스케일 보정**

클러스터가 아래로 늘어나(limbs cy 1040→1250) 고정 SVG 인체(발끝 ≈ y 1105)보다 길어진다. `Silhouette.tsx:119-128`의 몸 컨테이너 div에 세로 스케일을 더한다:

```tsx
<div
  style={{
    position: "absolute",
    left: BODY_LEFT,
    top: BODY_TOP,
    // 클러스터 확장(limbs cy 1160)에 맞춰 인체를 늘인다 — 발끝이 관절 클러스터를 덮도록
    transform: "translate(-50%, 0) scale(1.18)",
    transformOrigin: "top center",
    pointerEvents: "none",
    animation: "silhouette-breathe 14s ease-in-out infinite",
  }}
>
```

※ `silhouette-breathe` 키프레임이 transform을 덮어쓰는지 `globals.css`에서 확인할 것 — transform을 애니메이션한다면 키프레임 쪽에 scale을 합치거나 wrapper div를 한 겹 더 둔다.

- [ ] **Step 6: 빌드 + 시각 확인**

```bash
npm run build
```

기대: 빌드 성공. `npm run dev` 후 Playwright(`browser_resize` 1440×900 먼저)로 스크린샷 — 46개 기준으로 클러스터·실루엣·내분비 리더선이 자연스러운지 확인하고 어색하면 scale·cy 미세 조정.

- [ ] **Step 7: 커밋**

```bash
git add tests/layout.test.ts src/lib/atlas-layout.ts src/components/atlas/Silhouette.tsx
git commit -m "feat: 부위당 16개 수용 레이아웃 재조정 + 겹침 회귀 테스트"
```

---

### Task 3: 시드 확충 46 → 80개

`prisma/seed-data.ts`에 질병 34개·관계 ~16개를 추가한다. Task 1의 정합성 테스트가 오타·참조 오류를 잡는다. **DB에는 아직 반영하지 않는다** (Task 8).

**Files:**
- Modify: `prisma/seed-data.ts`

- [ ] **Step 1: 질병 34개 추가**

부위당 16개가 되도록 추가한다 (뇌·신경 16 현행 유지 / 가슴 +7 / 복부 +7 / 관절 +9 / 내분비 +11). 기존 항목과 같은 형식·문체로 작성: description은 "~하는 질환." 1문장, treatment는 핵심 치료 1문장, symptoms는 기존 증상명을 우선 재사용(공통 증상 엣지가 살아나도록)하고 필요할 때만 신규.

| slug | name | bodyPart | category | symptoms |
|---|---|---|---|---|
| lung-cancer | 폐암 | chest | tumor | 기침, 혈담, 체중감소 |
| pulmonary-fibrosis | 폐섬유화증 | chest | degenerative | 호흡곤란, 기침, 피로 |
| bronchiectasis | 기관지확장증 | chest | inflammatory | 기침, 가래, 혈담 |
| atrial-fibrillation | 심방세동 | chest | vascular | 두근거림, 어지럼, 호흡곤란 |
| valvular-heart-disease | 심장판막질환 | chest | degenerative | 호흡곤란, 두근거림, 부종 |
| aortic-aneurysm | 대동맥류 | chest | vascular | 무증상, 가슴통증 |
| pulmonary-embolism | 폐색전증 | chest | vascular | 호흡곤란, 가슴통증, 의식저하 |
| liver-cancer | 간암 | abdomen | tumor | 우상복부통증, 체중감소, 황달 |
| pancreatic-cancer | 췌장암 | abdomen | tumor | 상복부통증, 체중감소, 황달 |
| gerd | 역류성식도염 | abdomen | inflammatory | 속쓰림, 가슴통증, 소화불량 |
| chronic-kidney-disease | 만성콩팥병 | abdomen | degenerative | 부종, 피로, 다뇨 |
| kidney-stone | 요로결석 | abdomen | metabolic | 옆구리통증, 혈뇨, 메스꺼움 |
| diverticulitis | 게실염 | abdomen | inflammatory | 복통, 발열, 변비 |
| ulcerative-colitis | 궤양성대장염 | abdomen | autoimmune | 혈변, 설사, 복통 |
| hip-fracture | 고관절골절 | joint | null | 골절, 보행장애, 관절통 |
| vertebral-compression-fracture | 척추압박골절 | joint | null | 허리통증, 골절 |
| rotator-cuff-tear | 회전근개파열 | joint | degenerative | 어깨통증, 운동제한, 근력저하 |
| carpal-tunnel-syndrome | 손목터널증후군 | joint | null | 손저림, 감각이상, 손떨림 |
| plantar-fasciitis | 족저근막염 | joint | inflammatory | 발뒤꿈치통증 |
| ankylosing-spondylitis | 강직성척추염 | joint | autoimmune | 허리통증, 아침강직 |
| sarcopenia | 근감소증 | joint | degenerative | 근력저하, 보행장애, 피로 |
| polymyalgia-rheumatica | 류마티스다발근통 | joint | inflammatory | 근육통, 아침강직, 발열 |
| cervical-disc-herniation | 경추간판탈출증 | joint | degenerative | 목통증, 손저림, 감각이상 |
| thyroid-cancer | 갑상선암 | endocrine | tumor | 목멍울, 목소리변화 |
| thyroid-nodule | 갑상선결절 | endocrine | null | 목멍울, 무증상 |
| hashimoto-thyroiditis | 하시모토갑상선염 | endocrine | autoimmune | 피로, 체중증가, 목멍울 |
| cushing-syndrome | 쿠싱증후군 | endocrine | metabolic | 체중증가, 부종, 피로 |
| adrenal-insufficiency | 부신기능저하증 | endocrine | metabolic | 피로, 식욕부진, 어지럼 |
| acromegaly | 말단비대증 | endocrine | metabolic | 손발비대, 두통, 관절통 |
| hyperparathyroidism | 부갑상선기능항진증 | endocrine | metabolic | 골절, 피로, 변비 |
| metabolic-syndrome | 대사증후군 | endocrine | metabolic | 체중증가, 무증상 |
| hypoglycemia | 저혈당증 | endocrine | metabolic | 식은땀, 어지럼, 의식소실 |
| diabetes-insipidus | 요붕증 | endocrine | metabolic | 다뇨, 갈증 |
| pcos | 다낭성난소증후군 | endocrine | metabolic | 생리불순, 체중증가 |

작성 예시 (이 두 개는 그대로 사용):

```ts
{
  slug: "atrial-fibrillation", name: "심방세동", bodyPart: "chest", category: "vascular",
  description: "심방이 무질서하게 떨려 맥이 불규칙해지고 혈전·뇌경색 위험을 높이는 부정맥.",
  treatment: "항응고제로 뇌경색 예방, 맥박수 조절 약물, 필요 시 전극도자절제술.",
  symptoms: ["두근거림", "어지럼", "호흡곤란"],
},
{
  slug: "sarcopenia", name: "근감소증", bodyPart: "joint", category: "degenerative",
  description: "노화로 근육량과 근력이 줄어 낙상·신체 기능 저하로 이어지는 질환.",
  treatment: "저항성 운동과 단백질 섭취가 핵심, 동반 질환 관리.",
  symptoms: ["근력저하", "보행장애", "피로"],
},
```

- [ ] **Step 2: 관계 추가 (노인성 중심 16개)**

`relations` 배열 끝에 추가:

```ts
// ── v1.1 확충 관계 ──
{ from: "atrial-fibrillation", to: "cerebral-infarction", type: "comorbidity", note: "심방세동 혈전이 뇌경색의 주요 원인" },
{ from: "hypertension", to: "atrial-fibrillation", type: "comorbidity", note: "고혈압은 심방세동 위험을 높임" },
{ from: "hyperthyroidism", to: "atrial-fibrillation", type: "comorbidity", note: "갑상선 항진은 심방세동을 유발할 수 있음" },
{ from: "hypertension", to: "chronic-kidney-disease", type: "comorbidity", note: "고혈압은 만성콩팥병의 주요 원인" },
{ from: "diabetes", to: "chronic-kidney-disease", type: "progression", note: "당뇨병성 신증으로 진행할 수 있음" },
{ from: "hypertension", to: "aortic-aneurysm", type: "comorbidity", note: "고혈압은 대동맥류 위험인자" },
{ from: "osteoporosis", to: "hip-fracture", type: "progression", note: "골다공증은 고관절골절의 주요 원인" },
{ from: "osteoporosis", to: "vertebral-compression-fracture", type: "progression", note: "약해진 척추뼈가 주저앉아 압박골절 발생" },
{ from: "sarcopenia", to: "hip-fracture", type: "comorbidity", note: "근감소로 낙상·골절 위험 증가" },
{ from: "metabolic-syndrome", to: "diabetes", type: "progression", note: "대사증후군은 2형 당뇨로 진행 위험" },
{ from: "metabolic-syndrome", to: "dyslipidemia", type: "comorbidity", note: "이상지질혈증은 대사증후군 구성 요소" },
{ from: "obesity", to: "metabolic-syndrome", type: "comorbidity", note: "복부비만은 대사증후군의 핵심 요소" },
{ from: "liver-cirrhosis", to: "liver-cancer", type: "progression", note: "간경변은 간암의 주요 위험인자" },
{ from: "hepatitis", to: "liver-cancer", type: "progression", note: "만성 B·C형 간염은 간암으로 진행 가능" },
{ from: "pancreatitis", to: "pancreatic-cancer", type: "comorbidity", note: "만성 췌장염은 췌장암 위험을 높임" },
{ from: "hashimoto-thyroiditis", to: "hypothyroidism", type: "progression", note: "하시모토갑상선염은 기능저하증의 흔한 원인" },
```

- [ ] **Step 3: 테스트 실행**

```bash
npm test
npx tsx -e "import('./prisma/seed-data.ts').then(m => console.log(m.diseases.length, m.relations.length))"
```

기대: 전부 PASS, 출력 `80 46`.

- [ ] **Step 4: 커밋**

```bash
git add prisma/seed-data.ts
git commit -m "feat: 질병 80개·관계 46개로 시드 확충 (부위당 16개 균형)"
```

---

### Task 4: 투어 데이터 (TDD)

**Files:**
- Test: `tests/tours.test.ts`
- Create: `src/lib/tours.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/tours.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { TOURS } from "../src/lib/tours";
import { diseases } from "../prisma/seed-data";

const diseaseSlugs = new Set(diseases.map((d) => d.slug));

test("투어 slug는 중복이 없다", () => {
  const slugs = TOURS.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("모든 투어는 2스텝 이상이고 해설이 비어있지 않다", () => {
  for (const t of TOURS) {
    assert.ok(t.steps.length >= 2, t.slug);
    for (const s of t.steps)
      assert.ok(s.narrative.trim().length > 0, `${t.slug}: ${s.diseaseSlug} 해설 없음`);
  }
});

test("모든 스텝의 diseaseSlug가 시드에 존재한다", () => {
  for (const t of TOURS)
    for (const s of t.steps)
      assert.ok(diseaseSlugs.has(s.diseaseSlug), `${t.slug}: ${s.diseaseSlug}`);
});
```

- [ ] **Step 2: 실패 확인**

```bash
npm test
```

기대: tours 테스트가 모듈 없음(`Cannot find module .../src/lib/tours`)으로 FAIL.

- [ ] **Step 3: tours.ts 작성**

`src/lib/tours.ts` — 전체 내용:

```ts
// Disease Atlas — 퀵 투어 정의 (정적 큐레이션)
// 질병은 DB id 대신 slug로 참조한다(시드 간 안정적). 교육용 해설이며 의학적 조언이 아니다.

export type TourStep = {
  /** prisma/seed-data.ts 질병 slug */
  diseaseSlug: string;
  /** 이 스텝에서 보여줄 해설 (2~3문장, 교육용 어조) */
  narrative: string;
};

export type Tour = {
  slug: string;
  title: string;
  description: string;
  steps: TourStep[];
};

export const TOURS: Tour[] = [
  {
    slug: "road-to-dementia",
    title: "치매로 가는 길",
    description: "혈관 위험인자에서 인지저하까지 — 치매는 어디서 시작되나",
    steps: [
      {
        diseaseSlug: "hypertension",
        narrative:
          "이야기는 증상 없는 고혈압에서 시작됩니다. 높은 압력은 수십 년에 걸쳐 뇌의 작은 혈관들을 조용히 손상시킵니다. 그래서 고혈압 관리가 곧 치매 예방의 첫걸음입니다.",
      },
      {
        diseaseSlug: "cerebral-infarction",
        narrative:
          "손상된 혈관이 막히면 뇌경색이 됩니다. 큰 발작 없이 지나가는 작은 경색도 있는데, 이런 '조용한 뇌경색'이 반복되며 뇌 손상이 누적됩니다.",
      },
      {
        diseaseSlug: "vascular-dementia",
        narrative:
          "누적된 혈관 손상이 인지 기능을 갉아먹으면 혈관성치매입니다. 계단식으로 갑자기 나빠지는 경과가 특징이고, 혈관 위험인자 관리로 진행을 늦출 수 있습니다.",
      },
      {
        diseaseSlug: "alzheimer",
        narrative:
          "가장 흔한 치매는 알츠하이머병입니다. 혈관성치매와 함께 오는 '혼합형'도 많아 두 질환은 칼로 자르듯 나뉘지 않습니다. 서서히 진행되는 기억력 저하가 신호입니다.",
      },
      {
        diseaseSlug: "nph",
        narrative:
          "마지막은 희망적인 이야기 — 정상압수두증은 보행장애·인지저하·요실금이 함께 오지만, 수술로 호전될 수 있는 '가역성 치매'입니다. 그래서 치매 진단에서 꼭 감별해야 합니다.",
      },
    ],
  },
  {
    slug: "what-is-that-tremor",
    title: "떨림의 정체",
    description: "손이 떨린다고 다 파킨슨병이 아니다 — 떨림 질환 감별 여행",
    steps: [
      {
        diseaseSlug: "essential-tremor",
        narrative:
          "가장 흔한 떨림은 본태성진전입니다. 물건을 잡거나 글씨를 쓸 때, 즉 움직일 때 떨리는 게 특징입니다. 가족력이 흔하고 경과는 대체로 양성입니다.",
      },
      {
        diseaseSlug: "parkinson",
        narrative:
          "반대로 파킨슨병은 가만히 있을 때 떨립니다(안정 시 진전). 떨림보다 중요한 건 동작이 느려지고 몸이 굳는 것 — 도파민 신경세포가 줄어드는 퇴행성 질환입니다.",
      },
      {
        diseaseSlug: "secondary-parkinsonism",
        narrative:
          "파킨슨병과 똑같아 보여도 약물이나 뇌혈관 손상 때문에 생기는 이차성파킨슨증이 있습니다. 원인 약을 끊으면 좋아질 수 있어 반드시 감별해야 합니다.",
      },
      {
        diseaseSlug: "stroke-sequelae",
        narrative:
          "뇌졸중후유증도 떨림·경직·움직임 장애로 나타날 수 있습니다. 비슷한 증상이라도 원인이 다르면 치료가 완전히 달라진다는 것 — 그게 이 여행의 결론입니다.",
      },
    ],
  },
  {
    slug: "heart-to-brain",
    title: "심장에서 뇌까지",
    description: "혈관은 하나로 이어져 있다 — 고지혈증에서 뇌졸중까지 한 줄기 이야기",
    steps: [
      {
        diseaseSlug: "dyslipidemia",
        narrative:
          "출발점은 증상 없는 고지혈증입니다. 혈관 벽에 콜레스테롤이 쌓여 동맥경화가 진행되지만, 아무 느낌이 없어 건강검진에서야 발견되곤 합니다.",
      },
      {
        diseaseSlug: "hypertension",
        narrative:
          "고혈압이 더해지면 혈관 손상은 가속됩니다. 고지혈증과 고혈압은 함께 다니며 심장과 뇌, 양쪽 혈관을 동시에 위협하는 단짝입니다.",
      },
      {
        diseaseSlug: "angina",
        narrative:
          "심장 혈관이 좁아지면 협심증 — 계단을 오를 때 가슴이 조이고, 쉬면 풀립니다. 혈관이 보내는 마지막 경고장에 가깝습니다.",
      },
      {
        diseaseSlug: "myocardial-infarction",
        narrative:
          "경고를 지나치면 혈관이 완전히 막히는 심근경색이 됩니다. 식은땀과 함께 짓누르는 가슴통증이 20분 이상 — 골든타임 안에 막힌 혈관을 뚫어야 합니다.",
      },
      {
        diseaseSlug: "heart-failure",
        narrative:
          "심근경색으로 손상된 심장은 펌프 힘이 떨어져 심부전으로 이어질 수 있습니다. 숨이 차고 다리가 붓는 만성 질환으로, 평생 관리가 필요해집니다.",
      },
      {
        diseaseSlug: "stroke",
        narrative:
          "그리고 같은 혈관 이야기가 뇌에서 일어나면 뇌졸중입니다. 심장과 뇌는 한 혈관계로 이어져 있어, 위험인자 관리는 둘을 동시에 지키는 일입니다.",
      },
    ],
  },
];
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

기대: 전부 PASS.

- [ ] **Step 5: 커밋**

```bash
git add tests/tours.test.ts src/lib/tours.ts
git commit -m "feat: 노인성 질환 퀵 투어 3종 데이터 + 검증 테스트"
```

---

### Task 5: 키보드 헬퍼 추출 + 투어 UI 컴포넌트

**Files:**
- Create: `src/lib/keyboard.ts`
- Modify: `src/components/atlas/SearchBox.tsx:12-18` (로컬 `isTypingTarget` 제거 → 임포트)
- Create: `src/components/atlas/TourMenu.tsx`
- Create: `src/components/atlas/TourCard.tsx`

- [ ] **Step 1: keyboard.ts 추출**

`src/lib/keyboard.ts`:

```ts
/** 입력 포커스 중이면 전역 단축키를 가로채지 않는다 */
export function isTypingTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
}
```

`SearchBox.tsx`에서 로컬 정의(12~18행)를 삭제하고 `import { isTypingTarget } from "@/lib/keyboard";` 추가.

- [ ] **Step 2: TourMenu.tsx 작성**

캔버스 좌상단 오버레이 — SearchBox 필 버튼과 같은 문법. (설계서의 "헤더 버튼"에서 위치만 조정: 투어 상태가 AtlasFlow 클라이언트 컴포넌트에 살아야 해서 서버 컴포넌트인 헤더 대신 캔버스 오버레이에 둔다.)

```tsx
"use client";
// 투어 메뉴 — 좌상단 "투어" 필 버튼 + 투어 목록 카드
import { useState } from "react";
import { TOURS } from "@/lib/tours";

type Props = {
  onStart: (tourSlug: string) => void;
};

export default function TourMenu({ onStart }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute left-3 top-3 z-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-800)]/85 px-4 py-1.5 text-[12.5px] text-[var(--muted)] shadow-lg backdrop-blur-md transition-colors hover:border-[var(--line-strong)] hover:text-[var(--paper-dim)]"
        style={{ fontFamily: "var(--f-plex-kr)" }}
      >
        <span className="text-[13px]">✦</span>
        투어
      </button>

      {open && (
        <div
          className="mt-2 w-[min(330px,86vw)] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--ink-800)]/97 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md"
          style={{ animation: "panel-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <p
            className="border-b border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            Guided Tours · 안내 여정
          </p>
          <ul className="py-1.5">
            {TOURS.map((t) => (
              <li key={t.slug}>
                <button
                  onClick={() => {
                    setOpen(false);
                    onStart(t.slug);
                  }}
                  className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-[var(--ink-700)]"
                >
                  <span
                    className="block text-[14px] font-medium text-[var(--paper)]"
                    style={{ fontFamily: "var(--f-gowun)" }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="mt-0.5 block text-[11.5px] leading-snug text-[var(--muted)]"
                    style={{ fontFamily: "var(--f-plex-kr)" }}
                  >
                    {t.description} · {t.steps.length}스텝
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: TourCard.tsx 작성**

좌하단(모바일: 하단 전체 폭) 해설 카드. 키보드 ←/→/Esc.

```tsx
"use client";
// 투어 해설 카드 — 좌하단(모바일: 하단 시트). 스텝 해설 + 이전/다음/종료.
import { useEffect } from "react";
import { isTypingTarget } from "@/lib/keyboard";

type Props = {
  tourTitle: string;
  stepIndex: number; // 0-base
  stepCount: number;
  diseaseName: string;
  color: string; // 부위색
  narrative: string;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
};

export default function TourCard({
  tourTitle,
  stepIndex,
  stepCount,
  diseaseName,
  color,
  narrative,
  onPrev,
  onNext,
  onExit,
}: Props) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === stepCount - 1;

  // 키보드 내비게이션 — ←/→ 스텝, Esc 종료
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowRight" && !isLast) onNext();
      else if (e.key === "ArrowLeft" && !isFirst) onPrev();
      else if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFirst, isLast, onNext, onPrev, onExit]);

  return (
    <aside
      key={stepIndex}
      className="absolute bottom-0 left-0 z-20 w-full border-t border-[var(--line)] bg-[var(--ink-800)]/95 backdrop-blur-md sm:bottom-4 sm:left-4 sm:w-[380px] sm:rounded-xl sm:border sm:border-[var(--line-strong)] sm:shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      style={{ animation: "panel-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      {/* 헤더 — 투어 제목 + 진행 + 종료 */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          Tour · {tourTitle}
        </span>
        <span
          className="ml-auto text-[11px] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          {stepIndex + 1} / {stepCount}
        </span>
        <button
          onClick={onExit}
          aria-label="투어 종료"
          className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
        >
          ✕
        </button>
      </div>

      {/* 본문 — 질병명 + 해설 */}
      <div className="px-4 pb-3 pt-3.5">
        <p className="mb-1.5 flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 7px ${color}aa` }}
          />
          <span
            className="text-[17px] leading-none text-[var(--paper)]"
            style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
          >
            {diseaseName}
          </span>
        </p>
        <p
          className="text-[13.5px] leading-relaxed text-[var(--paper-dim)]"
          style={{ fontFamily: "var(--f-plex-kr)" }}
        >
          {narrative}
        </p>
      </div>

      {/* 풋터 — 이전/다음 */}
      <div className="flex items-center gap-2 border-t border-[var(--line)] px-4 py-2.5">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[12.5px] text-[var(--paper-dim)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--paper)] disabled:cursor-default disabled:opacity-35"
        >
          ← 이전
        </button>
        <button
          onClick={isLast ? onExit : onNext}
          className="flex-1 rounded-md border border-[var(--line-strong)] bg-[var(--ink-700)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--ink-850)]"
        >
          {isLast ? "투어 마치기" : "다음 →"}
        </button>
        <span
          className="hidden text-[10px] text-[var(--muted)] sm:block"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          ←→ / esc
        </span>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: 빌드 확인 + 커밋**

```bash
npm run build
git add src/lib/keyboard.ts src/components/atlas/SearchBox.tsx src/components/atlas/TourMenu.tsx src/components/atlas/TourCard.tsx
git commit -m "feat: 투어 UI 컴포넌트(TourMenu·TourCard) + 키보드 헬퍼 추출"
```

(TourMenu/TourCard는 아직 어디서도 사용하지 않으므로 빌드만 통과하면 된다. 미사용 경고가 lint에서 나면 Task 6에서 해소된다.)

---

### Task 6: AtlasFlow 투어 통합

**Files:**
- Modify: `src/components/atlas/AtlasFlow.tsx`

- [ ] **Step 1: 투어 상태와 로직 추가**

`AtlasFlow.tsx`에 임포트 추가:

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { TOURS } from "@/lib/tours";
import TourMenu from "./TourMenu";
import TourCard from "./TourCard";
```

`AtlasInner` 안, `focusNode` 정의 **아래**에 추가:

```tsx
  // ── 투어 모드 ──
  const [tour, setTour] = useState<{ slug: string; step: number } | null>(null);

  const nodeBySlug = useMemo(() => {
    const m = new Map<string, (typeof data.nodes)[number]>();
    for (const n of data.nodes) m.set(n.slug, n);
    return m;
  }, [data.nodes]);

  // 활성 투어 — 시드에 없는 slug 스텝은 건너뛰고 경고(데이터 어긋남 안전망)
  const activeTour = useMemo(() => {
    if (!tour) return null;
    const def = TOURS.find((t) => t.slug === tour.slug);
    if (!def) return null;
    const steps = def.steps.filter((s) => {
      if (nodeBySlug.has(s.diseaseSlug)) return true;
      console.warn(`[tour] 시드에 없는 질병 slug: ${s.diseaseSlug}`);
      return false;
    });
    return steps.length >= 2 ? { def, steps } : null;
  }, [tour, nodeBySlug]);

  // 스텝 인덱스는 항상 유효 범위로 보정 (slug 필터로 줄었을 수 있음)
  const stepIndex = activeTour ? Math.min(tour!.step, activeTour.steps.length - 1) : 0;
  const stepNode = activeTour
    ? nodeBySlug.get(activeTour.steps[stepIndex].diseaseSlug) ?? null
    : null;

  // 스텝 변경 시 해당 질병으로 카메라 이동 + 선택 (검색과 같은 경로 재사용)
  useEffect(() => {
    if (stepNode) focusNode(stepNode.id);
  }, [stepNode, focusNode]);

  const startTour = useCallback((slug: string) => setTour({ slug, step: 0 }), []);
  const exitTour = useCallback(() => {
    setTour(null);
    setSelectedId(null);
  }, []);
  const stepPrev = useCallback(
    () => setTour((t) => (t ? { ...t, step: Math.max(0, t.step - 1) } : t)),
    []
  );
  const stepNext = useCallback(
    () =>
      setTour((t) =>
        t && activeTour ? { ...t, step: Math.min(activeTour.steps.length - 1, t.step + 1) } : t
      ),
    [activeTour]
  );
```

- [ ] **Step 2: 렌더 연결**

기존 `<DetailPanel ... />`을 투어 중에는 숨기고(해설은 TourCard가 담당), TourMenu·TourCard를 추가한다. `AtlasInner` return의 `<div className="relative flex-1">` 안을 다음처럼 바꾼다:

```tsx
        {!activeTour && (
          <DetailPanel
            node={selectedNode}
            data={data}
            onClose={() => setSelectedId(null)}
            onSelectRelated={focusNode}
          />
        )}
        <SearchBox nodes={data.nodes} onSelect={focusNode} />
        {!activeTour && <TourMenu onStart={startTour} />}
        {activeTour && stepNode && (
          <TourCard
            tourTitle={activeTour.def.title}
            stepIndex={stepIndex}
            stepCount={activeTour.steps.length}
            diseaseName={stepNode.name}
            color={stepNode.color}
            narrative={activeTour.steps[stepIndex].narrative}
            onPrev={stepPrev}
            onNext={stepNext}
            onExit={exitTour}
          />
        )}
```

- [ ] **Step 3: 빌드 + 테스트**

```bash
npm run build
npm test
```

기대: 전부 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/components/atlas/AtlasFlow.tsx
git commit -m "feat: AtlasFlow 투어 모드 통합 — 스텝 카메라 추적·DetailPanel 전환"
```

---

### Task 7: 로컬 Playwright 검증

투어의 모든 질병 slug는 기존 46개 안에 있으므로 **시드 없이** 현 DB로 전체 흐름을 검증할 수 있다.

- [ ] **Step 1: dev 서버 + 뷰포트**

`npm run dev` 실행 후 Playwright MCP: `browser_resize`로 1440×900 지정 → `http://localhost:3000` 접속.

- [ ] **Step 2: 투어 전체 흐름 검증**

1. 좌상단 "투어" 버튼 클릭 → 목록에 투어 3개(치매로 가는 길/떨림의 정체/심장에서 뇌까지) 표시 확인
2. "치매로 가는 길" 시작 → TourCard 표시(1/5, 고혈압), 카메라가 고혈압 노드로 이동·선택 강조 확인
3. "다음 →" 클릭 반복 → 스텝마다 카메라 이동 + 해설 갱신, DetailPanel은 안 뜨는지 확인
4. `→`/`←` 키보드, 마지막 스텝 "투어 마치기", `Esc` 종료 각각 확인
5. 종료 후 노드 클릭 → DetailPanel 정상 복귀 확인
6. `browser_resize` 390×844(모바일) → TourCard가 하단 시트로 표시되는지 확인

- [ ] **Step 3: 레이아웃 시각 확인**

데스크톱 뷰포트로 전체 그래프 스크린샷 — 46개 기준 클러스터 위치·실루엣 스케일·내분비 리더선 어색하지 않은지 확인. 문제 있으면 `ZONE_LAYOUT`/scale 조정 (layout 테스트 통과 유지).

- [ ] **Step 4: 발견 수정 커밋**

```bash
git add -A && git commit -m "fix: 투어 검증 중 발견된 이슈 수정"
```

(수정 사항 없으면 생략.)

---

### Task 8: 배포 (코드 먼저 → 시드 나중)

순서 중요: 구 코드 + 신 데이터는 구 레이아웃(3열)에 80개가 들어가 깨져 보이므로, **코드 배포 후 시드**한다.

- [ ] **Step 1: master 푸시 → 자동 배포**

```bash
git push origin master
```

Vercel 자동 배포 완료 대기 (`npx vercel ls disease-atlas` 또는 대시보드).

- [ ] **Step 2: 프로덕션 시드**

```bash
npm run db:seed
```

(`.env.local`의 DATABASE_URL이 prod Neon — upsert라 기존 데이터 비파괴.)
기대 출력: `✅ Seed 완료: { ... diseases: 80, relations: 46 ... }`

- [ ] **Step 3: 프로덕션 검증**

Playwright(`browser_resize` 1440×900)로 https://disease-atlas-eta.vercel.app 접속:
- 노드 80개 레이아웃·클러스터 겹침 없는지 스크린샷
- 투어 1개 처음~끝 실행
- 검색(`/` → "심방세동") → 신규 질병 포커스 확인

- [ ] **Step 4: 메모리 갱신**

`project_disease_atlas.md`에 v1.1 진행 내역(투어 3종, 질병 80개, 레이아웃 재조정, 테스트 인프라) 추가.
