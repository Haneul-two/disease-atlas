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
  assert.equal(v.strokeWidth, 1.8);
  assert.equal(v.animated, true);
});

// edgeVisual을 순수 함수로 뺀 이유가 바로 이 표다 — 별자리의 평상시 굵기·불투명도는
// primary/progression 조합마다 고정값이어야 하고, 여기서 절대값으로 못 박아 둔다.
test("평상시(강조 없음) 불투명도·굵기는 엣지 종류별로 고정된 값이다", () => {
  const cases: Array<{ name: string; edge: AtlasEdge; opacity: number; strokeWidth: number }> = [
    { name: "공통 증상", edge: { ...base, types: ["symptom"], primary: "symptom" }, opacity: 0.16, strokeWidth: 1 },
    { name: "같은 계통", edge: { ...base, types: ["category"], primary: "category" }, opacity: 0.1, strokeWidth: 1 },
    { name: "같은 부위", edge: { ...base, types: ["bodypart"], primary: "bodypart" }, opacity: 0.1, strokeWidth: 1 },
    {
      name: "관계(무방향, comorbidity)",
      edge: { ...base, relationType: "comorbidity" },
      opacity: 0.3,
      strokeWidth: 1,
    },
    {
      name: "관계(방향 있음, risk)",
      edge: { ...base, relationType: "risk", relationFrom: "a", relationTo: "b" },
      opacity: 0.3,
      strokeWidth: 1,
    },
    {
      name: "관계(progression)",
      edge: { ...base, relationType: "progression", relationFrom: "a", relationTo: "b" },
      opacity: 0.45,
      strokeWidth: 1.3,
    },
  ];

  for (const { name, edge, opacity, strokeWidth } of cases) {
    const v = edgeVisual(edge, null);
    assert.equal(v.opacity, opacity, `${name}: opacity`);
    assert.equal(v.strokeWidth, strokeWidth, `${name}: strokeWidth`);
  }
});
