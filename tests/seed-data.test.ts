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
