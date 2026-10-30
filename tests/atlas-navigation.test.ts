import { test } from "node:test";
import assert from "node:assert/strict";
import { atlasSearch, parseAtlasRoute } from "../src/lib/atlas-navigation";
import { readProgress, progressSession } from "../src/lib/tour-progress";
import { resolveTour } from "../src/lib/tour-session";
import { TOURS } from "../src/lib/tours";
import type { AtlasNode } from "../src/lib/atlas-types";
const nodes: AtlasNode[] = TOURS[0].steps.map((s) => ({
  id: s.diseaseSlug,
  slug: s.diseaseSlug,
  name: s.diseaseSlug,
  medicalTerm: null,
  description: "",
  treatment: "",
  bodyPartSlug: "head",
  bodyPartName: "뇌",
  color: "#fff",
  layoutZone: "head",
  categoryName: null,
  symptoms: [],
  position: { x: 0, y: 0 },
}));
const tour = resolveTour(TOURS[0], nodes)!;

test("질병·투어·완료 URL을 왕복하고 공유 링크에는 외부 쿼리를 넣지 않는다", () => {
  for (const query of [
    "?disease=hypertension",
    "?tour=road-to-dementia&step=3",
    "?tour=road-to-dementia&step=5&done=1",
  ]) {
    assert.equal(atlasSearch(parseAtlasRoute(query, nodes, [tour])), query);
  }
  assert.equal(
    atlasSearch({ kind: "browse" }, "?campaign=one&tour=bad&step=9"),
    "?campaign=one",
  );
});
test("없는 질병·잘못된 단계는 복구하고 유효한 투어 링크를 우선한다", () => {
  assert.deepEqual(parseAtlasRoute("?disease=missing", nodes, [tour]), {
    kind: "browse",
  });
  for (const raw of ["NaN", "-2", "1.5", "Infinity"])
    assert.equal(
      atlasSearch(
        parseAtlasRoute(`?tour=${tour.slug}&step=${raw}`, nodes, [tour]),
      ),
      `?tour=${tour.slug}&step=1`,
    );
  assert.equal(
    atlasSearch(parseAtlasRoute(`?tour=${tour.slug}&step=999`, nodes, [tour])),
    `?tour=${tour.slug}&step=5`,
  );
  assert.equal(
    parseAtlasRoute(`?tour=${tour.slug}&disease=hypertension`, nodes, [tour])
      .kind,
    "tour",
  );
});
test("잘못된 저장 기록과 알 수 없는 버전은 무시한다", () => {
  for (const raw of [
    "broken",
    "null",
    "[]",
    '{"version":2,"tours":{}}',
    '{"version":1,"tours":{"road-to-dementia":null}}',
  ])
    assert.deepEqual(readProgress(raw, [tour]), {});
});
test("단계 순서가 바뀌어도 slug로 이어보고 완료 표시는 다시 검토한다", () => {
  const raw = JSON.stringify({
    version: 1,
    tours: {
      [tour.slug]: {
        diseaseSlug: "vascular-dementia",
        completed: true,
        updatedAt: 1,
        steps: tour.steps.map((s) => s.diseaseSlug),
      },
    },
  });
  const old = readProgress(raw, [tour]);
  assert.equal(progressSession(tour, old[tour.slug]).step, 2);
  assert.equal(old[tour.slug].completed, true);
  const changed = { ...tour, steps: tour.steps.slice(1) };
  const migrated = readProgress(raw, [changed]);
  assert.equal(progressSession(changed, migrated[tour.slug]).step, 1);
  assert.equal(migrated[tour.slug].completed, false);
});
