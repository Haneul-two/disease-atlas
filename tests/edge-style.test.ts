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
