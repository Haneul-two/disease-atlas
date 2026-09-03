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
