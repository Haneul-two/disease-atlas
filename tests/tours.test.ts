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
