# v1.2 끊긴 별자리 잇기 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관계가 하나도 없는 질병 38개를 0으로 만들고(관계 49→≥120), 버려지던 관계 타입을 4종으로 정의해 방향 화살표와 타입별 그룹으로 화면에 드러낸다.

**Architecture:** 스키마 변경 없이 `DiseaseRelation.type`의 값 체계만 확정한다(`progression`/`complication`/`risk`/`comorbidity`). `deriveEdges`가 무순서 병합을 하며 방향을 버리던 지점을 고쳐 `relationType`·`relationFrom`·`relationTo`를 엣지에 실어 보내고, 렌더링 분기와 상세 패널 그룹핑을 각각 순수 함수(`edgeVisual`, `groupRelated`)로 분리해 DB 없이 테스트한다. 콘텐츠(관계 130개)는 `prisma/seed-data.ts`에 넣고, 그래프 건강 지표를 `tests/graph-health.test.ts`가 회귀로 감시한다.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7 + PostgreSQL(Neon) · @xyflow/react 12 · `tsx --test` (node:test)

**Spec:** `docs/superpowers/specs/2026-09-03-relation-density-design.md`

## Global Constraints

- **스키마 마이그레이션 금지.** `DiseaseRelation.type`은 이미 `String @default("comorbidity")`이다. Prisma 마이그레이션 파일을 새로 만들지 않는다.
- **관계 타입은 정확히 4종:** `progression`, `complication`, `risk`, `comorbidity`. 이 외의 값 금지.
- **방향 있는 관계:** `progression`, `complication`, `risk`. `comorbidity`는 무방향.
- **모든 관계에 `note`(한 문장) 필수.** 빈 문자열 불가.
- **허브 차수 상한 20.** 어떤 질병도 관계 차수가 20을 넘지 않는다.
- **테스트 러너:** `npm test` = `tsx --test tests/*.test.ts`. 테스트는 DB에 붙지 않고 `prisma/seed-data.ts`를 직접 임포트한다.
- **UI 문구는 한국어.** 엣지 타입 토글(합병·연관/공통증상/같은계통/같은부위)은 **늘리지 않는다** — 관계 4종은 그 하위 구분이다.
- **`.env.local`이 프로덕션 Neon을 가리킨다.** 로컬 dev도 prod DB에 붙으므로 DB 쓰기 작업은 Task 6 전까지 하지 않는다.
- **원격 푸시와 프로덕션 DB 쓰기는 사용자 승인 후에만.** (Task 6)

---

### Task 1: 관계 타입 4종 정의 + 시드 타입 강화

**Files:**
- Modify: `src/lib/atlas-types.ts` (파일 끝에 상수 추가, `AtlasEdge`에 필드 3개 추가)
- Modify: `prisma/seed-data.ts:1` 부근 (`RelationSeed` 타입)
- Test: `tests/graph-health.test.ts` (신규 생성)

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces:
  - `RELATION_TYPES: readonly ["progression","complication","risk","comorbidity"]`
  - `type RelationType = "progression"|"complication"|"risk"|"comorbidity"`
  - `RELATION_LABELS: Record<RelationType, string>`
  - `DIRECTED_RELATIONS: RelationType[]`
  - `RELATION_PRIORITY: RelationType[]`
  - `AtlasEdge.relationType?: RelationType`, `AtlasEdge.relationFrom?: string`, `AtlasEdge.relationTo?: string`
  - `RelationSeed = { from: string; to: string; type: RelationType; note: string }`

- [ ] **Step 1: 관계 타입 상수를 `src/lib/atlas-types.ts` 맨 끝에 추가**

```ts
// ── 수동 관계(DiseaseRelation.type)의 4종 — v1.2 ──

export const RELATION_TYPES = ["progression", "complication", "risk", "comorbidity"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

/** 상세 패널 그룹 소제목 */
export const RELATION_LABELS: Record<RelationType, string> = {
  progression: "진행",
  complication: "합병증",
  risk: "위험인자",
  comorbidity: "동반",
};

/** 방향(from → to)이 의미를 갖는 관계 — 화살표를 그린다 */
export const DIRECTED_RELATIONS: RelationType[] = ["progression", "complication", "risk"];

/** 같은 쌍에 여러 관계가 있을 때 대표를 고르는 우선순위 (앞이 우선) */
export const RELATION_PRIORITY: RelationType[] = [
  "progression",
  "complication",
  "risk",
  "comorbidity",
];
```

- [ ] **Step 2: `AtlasEdge`에 필드 3개 추가**

`src/lib/atlas-types.ts`의 `AtlasEdge` 타입에서 `sharedSymptoms?: string[];` 바로 아래에 추가한다.

```ts
  /** 수동 관계일 때의 대표 관계 타입 (v1.2) */
  relationType?: RelationType;
  /** 방향 있는 관계의 시작 노드 id — 무방향이면 undefined */
  relationFrom?: string;
  /** 방향 있는 관계의 끝 노드 id — 무방향이면 undefined */
  relationTo?: string;
```

- [ ] **Step 3: `prisma/seed-data.ts`의 `RelationSeed` 타입을 좁힌다**

파일 첫 줄 근처에 import를 추가하고 타입을 교체한다. 기존 49개 관계는 전부 `note`를 갖고 있고 `type`도 `comorbidity`(34) / `progression`(15) 뿐이므로 컴파일이 깨지지 않는다(확인 완료).

```ts
import type { RelationType } from "../src/lib/atlas-types";

export type RelationSeed = { from: string; to: string; type: RelationType; note: string };
```

`atlas-types.ts`는 상수와 타입만 있고 import가 하나도 없으므로, `tsx prisma/seed.ts`로 실행해도 안전하다.

- [ ] **Step 4: 실패하는 테스트를 쓴다 — `tests/graph-health.test.ts` 신규 생성**

```ts
// 그래프 건강 지표 — 별자리가 조각나지 않았는지 감시한다.
// DB에 붙지 않고 prisma/seed-data.ts를 직접 계산한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { relations } from "../prisma/seed-data";
import { RELATION_TYPES } from "../src/lib/atlas-types";

test("모든 관계 type이 정의된 4종 중 하나다", () => {
  const allowed = new Set<string>(RELATION_TYPES);
  for (const r of relations)
    assert.ok(allowed.has(r.type), `${r.from}→${r.to}: 알 수 없는 type "${r.type}"`);
});

test("모든 관계에 note가 있다", () => {
  for (const r of relations)
    assert.ok(r.note && r.note.trim().length > 0, `${r.from}→${r.to}: note 없음`);
});

test("자기참조 관계가 없다", () => {
  for (const r of relations) assert.notEqual(r.from, r.to, `자기참조: ${r.from}`);
});
```

- [ ] **Step 5: 테스트가 실제로 잡아내는지 확인한다 (인위적 red)**

이 3개 테스트는 현재 데이터로 이미 통과하므로, 감시망이 살아있는지 직접 확인해야 한다.
`prisma/seed-data.ts`의 `relations` 배열 맨 끝에 아래 한 줄을 **임시로** 넣는다.

```ts
  { from: "stroke", to: "stroke", type: "comorbidity", note: "" },
```

Run: `npm test`
Expected: FAIL — "모든 관계에 note가 있다"와 "자기참조 관계가 없다" 2개가 실패한다.

- [ ] **Step 6: 임시 줄을 지우고 테스트 통과 확인**

방금 넣은 한 줄을 삭제한다.

Run: `npm test`
Expected: PASS (기존 12개 + 신규 3개 = 15개)

- [ ] **Step 7: 커밋**

```bash
git add src/lib/atlas-types.ts prisma/seed-data.ts tests/graph-health.test.ts
git commit -m "feat: 관계 타입 4종 정의 + 시드 관계 타입/note 강제

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpWS8ja7eMUK8Eg3WKuy"
```

---

### Task 2: `deriveEdges`가 관계 타입과 방향을 보존하게 한다

**Files:**
- Modify: `src/lib/atlas-layout.ts:94` (`ManualRelation` 타입), `:112-190` (`deriveEdges`)
- Modify: `src/lib/atlas-data.ts:60-63` (관계를 넘길 때 `type`을 버리는 지점)
- Test: `tests/derive-edges.test.ts` (신규 생성)

**Interfaces:**
- Consumes: Task 1의 `RelationType`, `DIRECTED_RELATIONS`, `RELATION_PRIORITY`, `AtlasEdge.relationType/relationFrom/relationTo`
- Produces: `deriveEdges(diseases, relations)` — `relations` 원소가 `{ fromId: string; toId: string; type: RelationType; note?: string | null }`로 바뀐다. 방향 있는 관계의 엣지는 `relationFrom`/`relationTo`를 갖고, 무방향은 `undefined`다.

**왜 필요한가:** `deriveEdges`는 `pairKey()`로 무순서 병합하며 `source = min(a,b)`로 고정하므로 관계 방향이 구조적으로 소실된다. 또 `atlas-data.ts`가 `{ fromId, toId, note }`만 넘겨 DB에 저장된 `type`을 통째로 버리고 있다.

- [ ] **Step 1: 실패하는 테스트를 쓴다 — `tests/derive-edges.test.ts` 신규 생성**

```ts
// deriveEdges가 수동 관계의 타입·방향을 보존하는지 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveEdges } from "../src/lib/atlas-layout";

// 부위·계통·증상을 전부 다르게 두어 파생 엣지가 섞이지 않게 한다
const diseases = [
  { id: "a", bodyPartSlug: "chest", categoryName: null, symptoms: [] },
  { id: "b", bodyPartSlug: "brain", categoryName: null, symptoms: [] },
  { id: "c", bodyPartSlug: "abdomen", categoryName: null, symptoms: [] },
];

test("방향 있는 관계는 relationType과 from/to를 보존한다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "b", toId: "a", type: "risk", note: "b는 a의 위험인자" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "risk");
  assert.equal(e.relationFrom, "b");
  assert.equal(e.relationTo, "a");
});

test("무방향 관계(comorbidity)는 relationFrom/To를 갖지 않는다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "a", toId: "c", type: "comorbidity", note: "함께 나타남" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "comorbidity");
  assert.equal(e.relationFrom, undefined);
  assert.equal(e.relationTo, undefined);
});

test("같은 쌍에 여러 관계가 있으면 progression이 대표가 된다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "a", toId: "b", type: "comorbidity", note: "동반" },
    { fromId: "a", toId: "b", type: "progression", note: "진행" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "progression");
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `relationType`이 `undefined`라 3개 모두 실패한다 (타입 에러가 먼저 날 수도 있다).

- [ ] **Step 3: `src/lib/atlas-layout.ts` 수정**

먼저 import에 Task 1의 상수를 추가한다(파일 상단의 기존 `atlas-types` import에 합친다).

```ts
import { DIRECTED_RELATIONS, RELATION_PRIORITY } from "./atlas-types";
import type { RelationType } from "./atlas-types";
```

`ManualRelation` 타입을 교체한다(`:94`).

```ts
type ManualRelation = {
  fromId: string;
  toId: string;
  type: RelationType;
  note?: string | null;
};

/** 같은 쌍에 관계가 여러 개면 우선순위가 높은 쪽을 대표로 남긴다 */
type RelationInfo = { type: RelationType; fromId: string; toId: string };

function higherRelation(a: RelationInfo | undefined, b: RelationInfo): RelationInfo {
  if (!a) return b;
  return RELATION_PRIORITY.indexOf(a.type) <= RELATION_PRIORITY.indexOf(b.type) ? a : b;
}
```

`deriveEdges` 안의 `merged` 맵 값 타입에 `relation?: RelationInfo;`를 추가한다.

```ts
  const merged = new Map<
    string,
    {
      source: string;
      target: string;
      types: Set<EdgeType>;
      note?: string | null;
      sharedSymptoms?: string[];
      relation?: RelationInfo;
    }
  >();
```

`add`의 `extra`에 `relation`을 받고 병합한다.

```ts
  const add = (
    a: string,
    b: string,
    type: EdgeType,
    extra?: { note?: string | null; sharedSymptoms?: string[]; relation?: RelationInfo }
  ) => {
    if (a === b) return;
    const key = pairKey(a, b);
    const existing = merged.get(key);
    if (existing) {
      existing.types.add(type);
      if (extra?.note) existing.note = extra.note;
      if (extra?.sharedSymptoms) existing.sharedSymptoms = extra.sharedSymptoms;
      if (extra?.relation) existing.relation = higherRelation(existing.relation, extra.relation);
    } else {
      merged.set(key, {
        source: a < b ? a : b,
        target: a < b ? b : a,
        types: new Set([type]),
        note: extra?.note,
        sharedSymptoms: extra?.sharedSymptoms,
        relation: extra?.relation,
      });
    }
  };
```

수동 관계 루프(`:152`)를 교체한다.

```ts
  // 수동 관계
  for (const r of relations)
    add(r.fromId, r.toId, "relation", {
      note: r.note,
      relation: { type: r.type, fromId: r.fromId, toId: r.toId },
    });
```

엣지 생성부(`:167` 이하)에서 3필드를 실어 보낸다.

```ts
  for (const [key, m] of merged) {
    const types = [...m.types];
    const primary = types.reduce((acc, t) => higherPriority(acc, t));
    const directed = m.relation ? DIRECTED_RELATIONS.includes(m.relation.type) : false;
    edges.push({
      id: `e-${key}`,
      source: m.source,
      target: m.target,
      types,
      primary,
      note: m.note ?? null,
      sharedSymptoms: m.sharedSymptoms,
      relationType: m.relation?.type,
      relationFrom: directed ? m.relation!.fromId : undefined,
      relationTo: directed ? m.relation!.toId : undefined,
    });
  }
```

- [ ] **Step 4: `src/lib/atlas-data.ts`에서 `type`을 넘긴다 (`:60-63`)**

기존:
```ts
    relations.map((r) => ({ fromId: r.fromId, toId: r.toId, note: r.note }))
```

교체:
```ts
    relations.map((r) => ({
      fromId: r.fromId,
      toId: r.toId,
      type: r.type as RelationType,
      note: r.note,
    }))
```

파일 상단 import에 타입을 추가한다.
```ts
import type { AtlasData, AtlasNode, RelationType } from "./atlas-types";
```

`as RelationType` 단언을 쓰는 이유: DB 컬럼은 `String`이라 Prisma가 `string`으로 돌려준다. Task 1의 테스트와 Task 6의 정정 스크립트가 실제 값이 4종 안에 있음을 보장한다.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (15개 + 신규 3개 = 18개)

- [ ] **Step 6: 타입 체크와 린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add src/lib/atlas-layout.ts src/lib/atlas-data.ts tests/derive-edges.test.ts
git commit -m "feat: deriveEdges가 관계 타입·방향을 보존 — 버려지던 type 복원

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpWS8ja7eMUK8Eg3WKuy"
```

---

### Task 3: 엣지 시각 — 방향 화살표 + progression 강조

**Files:**
- Create: `src/lib/edge-style.ts`
- Modify: `src/components/atlas/AtlasFlow.tsx:214-235` (`renderEdges` useMemo)
- Test: `tests/edge-style.test.ts` (신규 생성)

**Interfaces:**
- Consumes: Task 2가 채운 `AtlasEdge.relationType/relationFrom/relationTo`
- Produces: `edgeVisual(e: AtlasEdge, activeId: string | null): EdgeVisual` — `{ source, target, color, strokeWidth, opacity, animated, directed }`

**왜 순수 함수로 빼는가:** 현재 `renderEdges` 안에 색·굵기·불투명도 분기가 인라인으로 들어 있다. 여기에 방향과 progression 분기가 더해지면 조건이 5개가 되는데, 컴포넌트 안에 있으면 DB·브라우저 없이 검증할 방법이 없다. 함수로 빼면 `node:test`로 바로 검증된다.

- [ ] **Step 1: 실패하는 테스트를 쓴다 — `tests/edge-style.test.ts` 신규 생성**

```ts
// 엣지 시각 분기 — 방향/강조/progression 규칙을 DOM 없이 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { edgeVisual } from "../src/lib/edge-style";
import type { AtlasEdge } from "../src/lib/atlas-types";

const base: AtlasEdge = {
  id: "e-a__b",
  source: "a",
  target: "b",
  types: ["relation"],
  primary: "relation",
  note: "테스트",
};

test("방향 관계는 source/target을 관계 방향으로 세운다", () => {
  const v = edgeVisual(
    { ...base, relationType: "risk", relationFrom: "b", relationTo: "a" },
    null
  );
  assert.equal(v.source, "b");
  assert.equal(v.target, "a");
  assert.equal(v.directed, true);
});

test("무방향 관계는 원래 source/target을 유지하고 directed=false", () => {
  const v = edgeVisual({ ...base, relationType: "comorbidity" }, null);
  assert.equal(v.source, "a");
  assert.equal(v.target, "b");
  assert.equal(v.directed, false);
});

test("progression은 평상시 다른 관계보다 진하고 굵다", () => {
  const prog = edgeVisual(
    { ...base, relationType: "progression", relationFrom: "a", relationTo: "b" },
    null
  );
  const risk = edgeVisual(
    { ...base, relationType: "risk", relationFrom: "a", relationTo: "b" },
    null
  );
  assert.ok(prog.opacity > risk.opacity, `${prog.opacity} > ${risk.opacity}`);
  assert.ok(prog.strokeWidth > risk.strokeWidth);
});

test("강조 노드에 닿지 않는 엣지는 거의 사라진다", () => {
  const v = edgeVisual({ ...base, relationType: "comorbidity" }, "zzz");
  assert.equal(v.opacity, 0.03);
  assert.equal(v.animated, false);
});

test("강조 노드에 닿는 엣지는 점등되고 애니메이션이 켜진다", () => {
  const v = edgeVisual({ ...base, relationType: "comorbidity" }, "a");
  assert.equal(v.opacity, 0.95);
  assert.equal(v.animated, true);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/edge-style'`

- [ ] **Step 3: `src/lib/edge-style.ts` 생성**

```ts
// 엣지 하나의 시각 속성을 결정한다 — AtlasFlow의 렌더 분기를 DOM 없이 검증하려고 분리했다.
import { EDGE_COLORS } from "./atlas-types";
import type { AtlasEdge } from "./atlas-types";

export type EdgeVisual = {
  /** React Flow에 넘길 시작/끝 — 방향 관계면 관계 방향으로 세운다 */
  source: string;
  target: string;
  color: string;
  strokeWidth: number;
  opacity: number;
  animated: boolean;
  /** 화살표 마커를 붙일지 */
  directed: boolean;
};

export function edgeVisual(e: AtlasEdge, activeId: string | null): EdgeVisual {
  const touchesActive = !!activeId && (e.source === activeId || e.target === activeId);
  const dimmed = !!activeId && !touchesActive;
  const directed = !!e.relationFrom && !!e.relationTo;
  const isProgression = e.relationType === "progression";

  // 평상시 굵기·불투명도 — 진행 관계는 스토리라인이므로 한 단계 진하게
  const restOpacity =
    e.primary === "relation"
      ? isProgression
        ? 0.45
        : 0.3
      : e.primary === "symptom"
        ? 0.16
        : 0.1;
  const restWidth = e.primary === "relation" && isProgression ? 1.3 : 1;

  return {
    source: directed ? e.relationFrom! : e.source,
    target: directed ? e.relationTo! : e.target,
    color: EDGE_COLORS[e.primary],
    strokeWidth: touchesActive ? 1.8 : restWidth,
    opacity: dimmed ? 0.03 : touchesActive ? 0.95 : restOpacity,
    animated: touchesActive,
    directed,
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (18개 + 신규 5개 = 23개)

- [ ] **Step 5: `AtlasFlow.tsx`가 이 함수를 쓰게 한다**

import를 추가한다.
```ts
import { MarkerType } from "@xyflow/react";
import { edgeVisual } from "@/lib/edge-style";
```
(`@xyflow/react`는 이미 import 중이므로 `MarkerType`을 기존 import 목록에 합친다. `EDGE_COLORS` import는 `renderEdges`에서만 쓰였다면 제거한다 — 다른 곳에서 쓰이면 남긴다.)

`renderEdges` useMemo 본문을 교체한다.

```ts
  // 표시용 엣지 — 별자리 선: 평소엔 아주 희미한 직선, 강조 노드에 닿는 선만 점등
  const renderEdges: Edge[] = useMemo(
    () =>
      activeEdges.map((e) => {
        const v = edgeVisual(e, activeId);
        return {
          id: e.id,
          source: v.source,
          target: v.target,
          type: "straight",
          animated: v.animated,
          markerEnd: v.directed
            ? { type: MarkerType.ArrowClosed, width: 12, height: 12, color: v.color }
            : undefined,
          style: { stroke: v.color, strokeWidth: v.strokeWidth, opacity: v.opacity },
        };
      }),
    [activeEdges, activeId]
  );
```

useMemo 의존성 배열은 원본에 있던 값을 그대로 유지한다.

- [ ] **Step 6: 타입 체크·린트·빌드 확인**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 에러 없음

- [ ] **Step 7: 눈으로 확인**

Run: `npm run dev` 후 http://localhost:3000
확인할 것: 고혈압 노드 주변 선에 **화살표가 보이는지**, 위염→위궤양 선이 다른 선보다 **살짝 진한지**.
⚠️ 이 시점의 로컬 dev는 프로덕션 Neon DB를 읽는다(읽기만 하므로 안전). DB의 기존 15개 `progression` 관계가 그대로 보인다.

- [ ] **Step 8: 커밋**

```bash
git add src/lib/edge-style.ts src/components/atlas/AtlasFlow.tsx tests/edge-style.test.ts
git commit -m "feat: 방향 화살표 + progression 강조 — 엣지 시각 분기를 순수함수로 분리

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpWS8ja7eMUK8Eg3WKuy"
```

---

### Task 4: 상세 패널 "관련 질환"을 타입별 그룹으로

**Files:**
- Create: `src/lib/related.ts`
- Modify: `src/components/atlas/DetailPanel.tsx:16-24` (related 계산), `:110-139` (관련 질환 Section)
- Test: `tests/related.test.ts` (신규 생성)

**Interfaces:**
- Consumes: Task 2가 채운 `AtlasEdge.relationType/relationFrom/relationTo`, Task 1의 `RELATION_LABELS`·`RELATION_PRIORITY`
- Produces:
  - `type RelatedItem = { node: AtlasNode; note: string | null; direction: "out" | "in" | null }`
  - `type RelatedGroup = { type: RelationType; items: RelatedItem[] }`
  - `groupRelated(node: AtlasNode, data: AtlasData): RelatedGroup[]` — `RELATION_PRIORITY` 순서로 정렬된 그룹 배열, 빈 그룹은 제외

- [ ] **Step 1: 실패하는 테스트를 쓴다 — `tests/related.test.ts` 신규 생성**

```ts
// 상세 패널의 관련 질환 그룹핑 — 방향과 타입 순서를 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupRelated } from "../src/lib/related";
import type { AtlasData, AtlasNode } from "../src/lib/atlas-types";

function node(id: string): AtlasNode {
  return {
    id,
    slug: id,
    name: id,
    medicalTerm: null,
    description: "",
    treatment: "",
    bodyPartSlug: "chest",
    bodyPartName: "가슴",
    color: "#fff",
    layoutZone: "chest",
    categoryName: null,
    symptoms: [],
    position: { x: 0, y: 0 },
  };
}

const data: AtlasData = {
  nodes: [node("htn"), node("stroke"), node("ra"), node("gastritis")],
  bodyParts: [],
  edges: [
    {
      id: "e1", source: "htn", target: "stroke", types: ["relation"], primary: "relation",
      note: "고혈압은 뇌졸중의 위험인자",
      relationType: "risk", relationFrom: "htn", relationTo: "stroke",
    },
    {
      id: "e2", source: "gastritis", target: "htn", types: ["relation"], primary: "relation",
      note: "진행", relationType: "progression", relationFrom: "gastritis", relationTo: "htn",
    },
    {
      id: "e3", source: "htn", target: "ra", types: ["relation"], primary: "relation",
      note: "동반", relationType: "comorbidity",
    },
    {
      id: "e4", source: "htn", target: "ra", types: ["symptom"], primary: "symptom",
      note: null, sharedSymptoms: ["피로"],
    },
  ],
};

test("관계 엣지만 모으고 증상 엣지는 무시한다", () => {
  const groups = groupRelated(node("htn"), data);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  assert.equal(total, 3);
});

test("그룹은 progression → risk → comorbidity 우선순위 순서로 나온다", () => {
  const groups = groupRelated(node("htn"), data);
  assert.deepEqual(groups.map((g) => g.type), ["progression", "risk", "comorbidity"]);
});

test("내가 원인이면 out, 내가 결과면 in, 무방향이면 null", () => {
  const groups = groupRelated(node("htn"), data);
  const byType = Object.fromEntries(groups.map((g) => [g.type, g.items[0]]));
  assert.equal(byType.risk.direction, "out");        // htn → stroke
  assert.equal(byType.progression.direction, "in");  // gastritis → htn
  assert.equal(byType.comorbidity.direction, null);
});

test("관계가 없는 노드는 빈 배열을 돌려준다", () => {
  assert.deepEqual(groupRelated(node("없는질병"), data), []);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/related'`

- [ ] **Step 3: `src/lib/related.ts` 생성**

```ts
// 상세 패널의 "관련 질환"을 관계 타입별로 묶는다 — DetailPanel에서 분리해 테스트 가능하게 했다.
import { RELATION_PRIORITY } from "./atlas-types";
import type { AtlasData, AtlasNode, RelationType } from "./atlas-types";

export type RelatedItem = {
  node: AtlasNode;
  note: string | null;
  /** 현재 노드 기준 방향 — out: 내가 원인, in: 내가 결과, null: 무방향 */
  direction: "out" | "in" | null;
};

export type RelatedGroup = { type: RelationType; items: RelatedItem[] };

export function groupRelated(node: AtlasNode, data: AtlasData): RelatedGroup[] {
  const byType = new Map<RelationType, RelatedItem[]>();

  for (const e of data.edges) {
    if (!e.types.includes("relation")) continue;
    if (e.source !== node.id && e.target !== node.id) continue;

    const otherId = e.source === node.id ? e.target : e.source;
    const other = data.nodes.find((n) => n.id === otherId);
    if (!other) continue;

    const type: RelationType = e.relationType ?? "comorbidity";
    const direction: RelatedItem["direction"] = e.relationFrom
      ? e.relationFrom === node.id
        ? "out"
        : "in"
      : null;

    byType.set(type, [...(byType.get(type) ?? []), { node: other, note: e.note ?? null, direction }]);
  }

  return RELATION_PRIORITY.filter((t) => byType.has(t)).map((t) => ({
    type: t,
    items: byType.get(t)!,
  }));
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (23개 + 신규 4개 = 27개)

- [ ] **Step 5: `DetailPanel.tsx`가 그룹을 쓰게 한다**

import를 추가한다.
```ts
import { groupRelated } from "@/lib/related";
import { RELATION_LABELS } from "@/lib/atlas-types";
```

기존 `const related = data.edges.filter(...)...` 블록 전체(`:16-24`)를 한 줄로 교체한다.
```ts
  const groups = groupRelated(node, data);
```

관련 질환 Section(`:110` 부근 `{related.length > 0 && (`)을 아래로 교체한다. 기존 항목 렌더(색 점 · 이름 · note)는 그대로 두고 그룹 소제목과 방향 표시만 더한다.

```tsx
        {groups.length > 0 && (
          <Section index="04" title="관련 질환 · Related">
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.type}>
                  <p
                    className="mb-1 px-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"
                    style={{ fontFamily: "var(--f-plex-mono)" }}
                  >
                    {RELATION_LABELS[g.type]}
                  </p>
                  <ul className="-mx-2 space-y-0.5">
                    {g.items.map(({ node: r, note, direction }) => (
                      <li key={`${g.type}-${r.id}`}>
                        <button
                          onClick={() => onSelectRelated(r.id)}
                          className="group flex w-full flex-col gap-1 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--ink-700)]"
                        >
                          <span className="flex w-full items-center gap-2.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ background: r.color, boxShadow: `0 0 6px ${r.color}aa` }}
                            />
                            {direction && (
                              <span
                                aria-label={direction === "out" ? "이 질병이 원인" : "이 질병이 결과"}
                                className="shrink-0 text-[11px] text-[var(--muted)]"
                              >
                                {direction === "out" ? "→" : "←"}
                              </span>
                            )}
                            <span className="text-[13.5px] font-medium text-[var(--paper)] group-hover:text-[var(--bone-bright)]">
                              {r.name}
                            </span>
                          </span>
                          {note && (
                            <span className="pl-[18px] text-[11px] leading-relaxed text-[var(--muted)]">
                              — {note}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}
```

기존에 있던 `ml-auto` 호버 화살표(`→`)는 방향 표시와 헷갈리므로 삭제한다(위 코드에 이미 빠져 있다).

- [ ] **Step 6: 타입 체크·린트·빌드 확인**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 에러 없음. `AtlasNode` import가 더 이상 쓰이지 않으면 DetailPanel의 import에서 제거한다.

- [ ] **Step 7: 눈으로 확인**

Run: `npm run dev` 후 고혈압 노드 클릭
확인할 것: "관련 질환"이 `진행` / `동반` 소제목으로 나뉘고, 각 항목 앞에 `→` 또는 `←`가 붙는지.

- [ ] **Step 8: 커밋**

```bash
git add src/lib/related.ts src/components/atlas/DetailPanel.tsx tests/related.test.ts
git commit -m "feat: 상세 패널 관련 질환을 관계 타입별 그룹 + 방향 표시로

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpWS8ja7eMUK8Eg3WKuy"
```

---

### Task 5: 관계 콘텐츠 확충 — 49개 → 120개 이상, 고립 0

**Files:**
- Modify: `prisma/seed-data.ts` (`relations` 배열)
- Modify: `tests/graph-health.test.ts` (건강 지표 4개 추가)

**Interfaces:**
- Consumes: Task 1의 `RelationSeed` 타입(`type: RelationType`, `note: string` 필수)
- Produces: 없음 (데이터 태스크). 이후 Task 6이 이 배열을 읽어 DB 타입을 정정한다.

**메울 대상 — 관계가 0개인 질병 38개 (실측):**

| 부위 | 개수 | 질병 (slug) |
|---|---|---|
| 뇌·신경 | 5 | 편두통(migraine), 뇌수막염(meningitis), 뇌전증(epilepsy), 척수성근위축증(spinal-muscular-atrophy), 다발경화증(multiple-sclerosis) |
| 가슴 | 9 | 폐렴(pneumonia), 천식(asthma), 만성폐쇄성폐질환(copd), 폐결핵(pulmonary-tuberculosis), 폐암(lung-cancer), 폐섬유화증(pulmonary-fibrosis), 기관지확장증(bronchiectasis), 심장판막질환(valvular-heart-disease), 폐색전증(pulmonary-embolism) |
| 복부 | 6 | 과민성대장증후군(ibs), 대장암(colorectal-cancer), 역류성식도염(gerd), 요로결석(kidney-stone), 게실염(diverticulitis), 궤양성대장염(ulcerative-colitis) |
| 관절 | 9 | 골관절염(osteoarthritis), 통풍(gout), 오십견(frozen-shoulder), 회전근개파열(rotator-cuff-tear), 손목터널증후군(carpal-tunnel-syndrome), 족저근막염(plantar-fasciitis), 강직성척추염(ankylosing-spondylitis), 류마티스다발근통(polymyalgia-rheumatica), 경추간판탈출증(cervical-disc-herniation) |
| 내분비 | 9 | 갑상선암(thyroid-cancer), 갑상선결절(thyroid-nodule), 쿠싱증후군(cushing-syndrome), 부신기능저하증(adrenal-insufficiency), 말단비대증(acromegaly), 부갑상선기능항진증(hyperparathyroidism), 저혈당증(hypoglycemia), 요붕증(diabetes-insipidus), 다낭성난소증후군(pcos) |

**작성 규칙 (스펙 5절):**
1. 모든 관계에 `note` 한 문장 필수 — 왜 이어지는가
2. 고립 질병당 관계 1~3개만. 양을 채우려는 억지 연결 금지
3. **부위를 넘나드는 관계를 우선한다** — 부위 내부만 이으면 5개 부위 = 5덩어리로 수렴해 "성분 ≤ 3"을 만족할 수 없다
4. 허브 차수 상한 20 (현재 고혈압 13)

- [ ] **Step 1: 건강 지표 테스트 4개를 `tests/graph-health.test.ts`에 추가한다**

파일 상단 import에 `diseases`를 더하고(`import { diseases, relations } from "../prisma/seed-data";`), 인접 리스트 헬퍼와 테스트를 파일 끝에 추가한다.

```ts
/** slug → 이웃 slug 집합 (수동 관계 기준, 무방향) */
function adjacency(): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>(diseases.map((d) => [d.slug, new Set<string>()]));
  for (const r of relations) {
    adj.get(r.from)?.add(r.to);
    adj.get(r.to)?.add(r.from);
  }
  return adj;
}

function components(adj: Map<string, Set<string>>): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const id of adj.keys()) {
    if (seen.has(id)) continue;
    const stack = [id];
    seen.add(id);
    const comp: string[] = [];
    while (stack.length) {
      const n = stack.pop()!;
      comp.push(n);
      for (const m of adj.get(n) ?? []) if (!seen.has(m)) { seen.add(m); stack.push(m); }
    }
    out.push(comp);
  }
  return out;
}

test("관계가 하나도 없는 질병(고립 노드)이 없다", () => {
  const adj = adjacency();
  const isolated = [...adj.entries()].filter(([, v]) => v.size === 0).map(([k]) => k);
  assert.deepEqual(isolated, [], `고립 ${isolated.length}개: ${isolated.join(", ")}`);
});

test("연결 성분이 3개 이하다 — 별자리가 조각나지 않았다", () => {
  const comps = components(adjacency());
  assert.ok(comps.length <= 3, `성분 ${comps.length}개 (상한 3)`);
});

test("관계 수가 120개 밑으로 줄지 않는다", () => {
  assert.ok(relations.length >= 120, `현재 ${relations.length}개`);
});

test("어떤 질병의 관계 차수도 20을 넘지 않는다 — 허브 폭발 감시", () => {
  for (const [slug, nb] of adjacency())
    assert.ok(nb.size <= 20, `${slug}: 차수 ${nb.size} (상한 20)`);
});
```

- [ ] **Step 2: 테스트 실패 확인 — 현재 상태를 눈으로 본다**

Run: `npm test`
Expected: FAIL — 고립 38개 나열, 성분 46개, 관계 49개. (차수 테스트는 통과: 최대 13)

- [ ] **Step 3: 뇌·신경 부위 관계 초안 작성**

`prisma/seed-data.ts`의 `relations` 배열에 `// ── v1.2: 뇌·신경 ──` 주석 구획을 만들고 추가한다.
대상: migraine, meningitis, epilepsy, spinal-muscular-atrophy, multiple-sclerosis (각 1~3개).
부위 교차를 최소 1개씩 포함할 것(예: 뇌전증 ↔ 뇌졸중후유증은 부위 내부이므로, 편두통 ↔ 다른 부위 질병 같은 교차 관계를 함께 넣는다).

형식 예:
```ts
  { from: "meningitis", to: "epilepsy", type: "complication", note: "뇌수막염 후 뇌 손상으로 뇌전증이 생길 수 있음" },
```

- [ ] **Step 4: 가슴 부위 관계 초안 작성**

대상: pneumonia, asthma, copd, pulmonary-tuberculosis, lung-cancer, pulmonary-fibrosis, bronchiectasis, valvular-heart-disease, pulmonary-embolism.
호흡기끼리 묶이기 쉬우므로 **심장 계열·복부·내분비로 나가는 관계를 반드시 섞는다**(예: 폐색전증 ↔ 부정맥/심부전, COPD ↔ 심부전).

- [ ] **Step 5: 복부 부위 관계 초안 작성**

대상: ibs, colorectal-cancer, gerd, kidney-stone, diverticulitis, ulcerative-colitis.
기존 위염·위궤양·간염 사슬에 붙이고, 궤양성대장염 ↔ 강직성척추염 같은 **부위 교차 자가면역 연결**을 활용한다.

- [ ] **Step 6: 관절 부위 관계 초안 작성**

대상: osteoarthritis, gout, frozen-shoulder, rotator-cuff-tear, carpal-tunnel-syndrome, plantar-fasciitis, ankylosing-spondylitis, polymyalgia-rheumatica, cervical-disc-herniation.
**대사·내분비로 나가는 관계를 반드시 넣는다**(통풍 ↔ 대사증후군/고혈압, 오십견 ↔ 당뇨, 손목터널증후군 ↔ 갑상선기능저하).

- [ ] **Step 7: 내분비 부위 관계 초안 작성**

대상: thyroid-cancer, thyroid-nodule, cushing-syndrome, adrenal-insufficiency, acromegaly, hyperparathyroidism, hypoglycemia, diabetes-insipidus, pcos.
갑상선결절 → 갑상선암(progression), 쿠싱증후군 → 골다공증/당뇨(complication), 다낭성난소증후군 ↔ 대사증후군 등 **기존 허브로 연결되는 경로**를 우선한다.

- [ ] **Step 8: 부위 교차 관계로 성분을 합친다**

아래 임시 스크립트를 프로젝트 루트에 만들어 현재 성분 구성을 확인한다(확인 후 삭제).

```ts
// comp-probe.ts — 실행: npx tsx comp-probe.ts
import { diseases, relations } from "./prisma/seed-data";
const adj = new Map<string, Set<string>>(diseases.map((d) => [d.slug, new Set<string>()]));
for (const r of relations) { adj.get(r.from)?.add(r.to); adj.get(r.to)?.add(r.from); }
const seen = new Set<string>(); const comps: string[][] = [];
for (const id of adj.keys()) {
  if (seen.has(id)) continue;
  const st = [id]; seen.add(id); const c: string[] = [];
  while (st.length) { const n = st.pop()!; c.push(n); for (const m of adj.get(n) ?? []) if (!seen.has(m)) { seen.add(m); st.push(m); } }
  comps.push(c);
}
comps.sort((a, b) => b.length - a.length);
console.log(`관계 ${relations.length} · 성분 ${comps.length}`);
comps.forEach((c, i) => console.log(`  [${i + 1}] ${c.length}개: ${c.slice(0, 8).join(", ")}${c.length > 8 ? " …" : ""}`));
```

성분이 3개를 넘으면, 남은 덩어리를 잇는 **교차 관계만** 추가한다. 억지로 잇지 말고 의학적으로 타당한 연결을 고른다.

- [ ] **Step 9: 사용자 검수 게이트 — 통째 검수**

추가한 관계 전부를 아래 형식의 표로 정리해 사용자에게 제시하고 **승인을 기다린다.**

| # | from | → | to | type | note |
|---|---|---|---|---|---|

함께 보고할 것: 최종 관계 수, 고립 수, 성분 수, 차수 상위 5개.
사용자가 수정을 지시하면 반영 후 다시 제시한다. **승인 전에는 다음 스텝으로 넘어가지 않는다.**

- [ ] **Step 10: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (27개 + 신규 4개 = 31개). 고립 0, 성분 ≤3, 관계 ≥120, 차수 ≤20.

- [ ] **Step 11: 엣지 밀도 확인은 다음 태스크로 미룬다**

⚠️ 이 시점의 DB는 아직 옛 관계(49개)라 화면에는 반영되지 않는다. 로컬 SQLite나 별도 DB가 없으므로 **밀도 확인은 Task 6 Step 5에서 한다.** 여기서는 넘어간다.

- [ ] **Step 12: 커밋**

```bash
git add prisma/seed-data.ts tests/graph-health.test.ts
git commit -m "feat: 관계 49→120+ 확충 — 고립 노드 38개 해소, 연결 성분 46→3 이하

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F6VpWS8ja7eMUK8Eg3WKuy"
```

---

### Task 6: 기존 관계 타입 정정 스크립트 + 배포

**Files:**
- Create: `scripts/fix-relation-types.ts`
- Test: 없음 (프로덕션 DB를 건드리는 일회성 스크립트 — 실행 전 dry-run으로 검증한다)

**Interfaces:**
- Consumes: Task 5가 확정한 `prisma/seed-data.ts`의 `relations`
- Produces: 없음 (운영 작업)

**왜 필요한가:** `DiseaseRelation`의 유니크 키가 `@@unique([fromId, toId, type])`이고 시드는 upsert(비파괴)다. 기존 관계의 `type`을 `comorbidity`에서 `risk`로 바꾸면 **새 행이 생기고 옛 행이 유령으로 남는다.** 전체 prune은 `/admin`에서 수동 추가한 관계까지 지우므로 하지 않는다.

- [ ] **Step 1: `scripts/fix-relation-types.ts` 생성**

`scripts/fill-medical-terms.ts`와 같은 형식을 따른다.

```ts
// 일회성 스크립트 — v1.2에서 type이 바뀐 기존 관계를 정정한다.
// upsert 키가 (fromId,toId,type)이라 시드만 돌리면 옛 type의 행이 유령으로 남기 때문.
// dry-run:  npx tsx scripts/fix-relation-types.ts
// 실제 적용: npx tsx scripts/fix-relation-types.ts --apply
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { relations } from "../prisma/seed-data";

const APPLY = process.argv.includes("--apply");

type Plan = {
  id: string;
  from: string;
  to: string;
  oldType: string;
  newType: string;
  note: string;
  action: "update" | "delete";
};

async function main() {
  const diseases = await prisma.disease.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(diseases.map((d) => [d.slug, d.id]));
  const slugById = new Map(diseases.map((d) => [d.id, d.slug]));

  // seed-data가 의도하는 (fromId,toId) → type/note
  const wanted = new Map<string, { type: string; note: string }>();
  for (const r of relations) {
    const fromId = idBySlug.get(r.from);
    const toId = idBySlug.get(r.to);
    if (!fromId || !toId) continue;
    wanted.set(`${fromId}__${toId}`, { type: r.type, note: r.note });
  }

  const existing = await prisma.diseaseRelation.findMany();
  const plan: Plan[] = [];

  for (const e of existing) {
    const want = wanted.get(`${e.fromId}__${e.toId}`);
    if (!want || want.type === e.type) continue;
    // 새 type의 행이 이미 있으면 옛 행은 지운다(유니크 충돌 회피), 없으면 갱신한다
    const conflict = existing.some(
      (x) => x.fromId === e.fromId && x.toId === e.toId && x.type === want.type
    );
    plan.push({
      id: e.id,
      from: slugById.get(e.fromId) ?? e.fromId,
      to: slugById.get(e.toId) ?? e.toId,
      oldType: e.type,
      newType: want.type,
      note: want.note,
      action: conflict ? "delete" : "update",
    });
  }

  console.log(`정정 대상 ${plan.length}건${APPLY ? " (적용)" : " (dry-run — 적용하려면 --apply)"}`);
  for (const p of plan)
    console.log(`  ${p.action.padEnd(6)} ${p.from} → ${p.to}: ${p.oldType} ⇒ ${p.newType}`);

  if (!APPLY) return;

  for (const p of plan) {
    if (p.action === "delete") {
      await prisma.diseaseRelation.delete({ where: { id: p.id } });
    } else {
      await prisma.diseaseRelation.update({
        where: { id: p.id },
        data: { type: p.newType, note: p.note },
      });
    }
  }
  console.log("✅ 정정 완료");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: dry-run으로 정정 대상을 확인한다**

`db:seed`와 마찬가지로 `DATABASE_URL`을 수동 주입한다(`prisma.config.ts`와 `dotenv/config`는 `.env`만 읽는데, 실제 Neon URL은 `.env.local`에 있다 — v1.1에서 확인된 사항).

Run:
```bash
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"') npx tsx scripts/fix-relation-types.ts
```
Expected: 정정 대상 목록이 출력된다. **아직 DB는 바뀌지 않는다.**

- [ ] **Step 3: 사용자 승인 게이트 — 프로덕션 DB 쓰기**

dry-run 결과를 사용자에게 보여주고 **승인을 받는다.** 이 스크립트와 다음 스텝의 시드는 **프로덕션 Neon DB를 직접 수정한다.** 승인 없이 실행하지 않는다.

- [ ] **Step 4: 정정 적용 + 시드 실행**

Run:
```bash
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"') npx tsx scripts/fix-relation-types.ts --apply
DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"') npm run db:seed
```
Expected: 정정 N건 → `✅ Seed 완료:` 와 함께 `relations: 120+` 출력.
⚠️ v1.1에서 첫 시도가 Neon 연결 끊김으로 실패한 적이 있다. 실패하면 그냥 재시도한다(upsert라 안전).

- [ ] **Step 5: 엣지 밀도를 눈으로 확인한다 (스펙 7절 리스크)**

Run: `npm run dev` 후 http://localhost:3000

확인할 것:
- 고립이었던 노드(폐렴·대장암·통풍·갑상선결절 등)를 클릭 → "관련 질환"이 채워졌는지
- 전체 화면이 **실타래처럼 보이지 않는지**

과밀하면 스펙 7절의 순서대로 조절한다:
1. 차수 10 이상 허브에 닿는 엣지의 평상시 불투명도를 낮춘다 (`src/lib/edge-style.ts`의 `edgeVisual`에 허브 여부 인자를 추가)
2. 그래도 과밀하면 기본 표시를 `progression`+`complication`만으로 좁히고 `risk`·`comorbidity`는 노드 강조 시에만 점등

조절했다면 `tests/edge-style.test.ts`에 해당 규칙 테스트를 추가하고 커밋한다.

- [ ] **Step 6: 사용자 승인 게이트 — 배포**

원격 푸시는 곧 Vercel 자동 배포다. **사용자 승인 후에만** `master`를 origin에 푸시한다.

- [ ] **Step 7: 배포 확인**

https://disease-atlas-eta.vercel.app 에서 확인:
- 고립이었던 노드 3개(폐렴·통풍·갑상선결절) 클릭 → 관련 질환이 채워져 있는지
- 화살표가 보이는지, 상세 패널이 타입별로 나뉘는지
- 모바일 폭(390px)에서 상세 패널 그룹 소제목이 깨지지 않는지

- [ ] **Step 8: work-brain 프로젝트 페이지 갱신**

`C:\Users\caring\work-brain\wiki\projects\disease-atlas.md`의 "현재 상태" 절에 v1.2 항목을 추가한다: 관계 수, 고립 0, 성분 수, 관계 타입 4종, 방향 화살표, 신규 테스트 수.

---

## Self-Review

**1. 스펙 커버리지**

| 스펙 절 | 담당 태스크 |
|---|---|
| 2. 목표 — 고립 0 / 성분 ≤3 / 관계 ≥120 / note 0 | Task 5 (지표), Task 1 (note) |
| 2. 목표 — 관계 타입 화면 반영 | Task 3 (화살표·강조), Task 4 (그룹) |
| 4. 관계 타입 4종 + 방향 | Task 1 (상수), Task 2 (보존) |
| 5. 콘텐츠 작성 규칙 4가지 | Task 5 Step 3~8 |
| 6. 코드 변경 지점 8개 파일 | Task 1~6에 전부 배정 |
| 7. 시각 설계 (화살표·progression·그룹핑·범례 유지) | Task 3, Task 4 |
| 7. 리스크 — 엣지 밀도 | Task 6 Step 5 (조절 순서 포함) |
| 8. 테스트 7개 | Task 1 (3개: type/note/자기참조), Task 5 (4개: 고립/성분/개수/차수) |
| 9. 배포 함정 — 유령 행 | Task 6 (정정 스크립트) |
| 10. 로드맵 v1.3/v1.4 | 범위 밖 — 태스크 없음 (의도됨) |

**2. 플레이스홀더**: Task 5의 관계 콘텐츠는 의학 판단이 필요한 생성 작업이므로 코드 블록 대신 **대상 38개 목록 + 작성 규칙 4가지 + 형식 예시 + 검증 스크립트**로 명세했다. 나머지 스텝은 모두 실제 코드를 담고 있다.

**3. 타입 일관성 확인**
- `RelationType` — Task 1 정의 → Task 2(`ManualRelation.type`), Task 4(`RelatedGroup.type`), Task 5(`RelationSeed.type`)에서 동일 사용 ✓
- `AtlasEdge.relationFrom/relationTo` — Task 2 생성 → Task 3(`edgeVisual`), Task 4(`groupRelated`)에서 동일 이름 소비 ✓
- `edgeVisual(e, activeId)` — Task 3 정의, Task 3 Step 5와 Task 6 Step 5에서만 호출 ✓
- `groupRelated(node, data)` — Task 4 정의, Task 4 Step 5에서만 호출 ✓
- `RELATION_PRIORITY` — Task 1 정의 → Task 2(`higherRelation`), Task 4(그룹 정렬)에서 동일 배열 사용 ✓
