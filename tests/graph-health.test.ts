// 그래프 건강 지표 — 별자리가 조각나지 않았는지 감시한다.
// DB에 붙지 않고 prisma/seed-data.ts를 직접 계산한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { diseases, relations } from "../prisma/seed-data";
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

// ── v1.2: 그래프 건강 지표 ──

/** slug → 이웃 slug 집합 (수동 관계 기준, 무방향) */
function adjacency(): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>(diseases.map((d) => [d.slug, new Set<string>()]));
  for (const r of relations) {
    adj.get(r.from)?.add(r.to);
    adj.get(r.to)?.add(r.from);
  }
  return adj;
}

/** 무방향 인접 리스트를 연결 성분(덩어리)으로 나눈다 */
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
      for (const m of adj.get(n) ?? [])
        if (!seen.has(m)) {
          seen.add(m);
          stack.push(m);
        }
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
