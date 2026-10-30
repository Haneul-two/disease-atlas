import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveTour,
  learningPath,
  tourStepIndex,
} from "../src/lib/tour-session";
import { viewportForArea } from "../src/lib/atlas-camera";
import { TOURS } from "../src/lib/tours";
import type { AtlasNode } from "../src/lib/atlas-types";

function node(slug: string): AtlasNode {
  return {
    id: slug,
    slug,
    name: slug,
    medicalTerm: null,
    description: "",
    treatment: "",
    bodyPartSlug: "head",
    bodyPartName: "뇌",
    color: "#ffffff",
    layoutZone: "head",
    categoryName: null,
    symptoms: [],
    position: { x: 0, y: 0 },
  };
}
test("DB에서 빠진 단계를 제외한 동일 경로를 메뉴·카드에 제공한다", () => {
  const definition = TOURS[0];
  const available = definition.steps
    .filter((_, i) => i !== 1)
    .map((s) => node(s.diseaseSlug));
  const tour = resolveTour(definition, available)!;
  assert.equal(tour.steps.length, definition.steps.length - 1);
  const path = learningPath(tour, 1, false);
  assert.equal(path[0].target, tour.steps[1].node.id);
  assert.equal(path.length, tour.steps.length - 1);
  assert.equal(resolveTour(definition, available.slice(0, 1)), null);
});
test("필터링된 단계와 비정상 인덱스는 유효한 범위로 보정한다", () => {
  assert.equal(tourStepIndex(100, 3), 2);
  assert.equal(tourStepIndex(-1, 3), 0);
  assert.equal(tourStepIndex(NaN, 3), 0);
  assert.equal(tourStepIndex(1, 0), 0);
});
test("학습 경로의 완료 상태는 모든 구간을 방문 처리한다", () => {
  const definition = TOURS[1];
  const tour = resolveTour(
    definition,
    definition.steps.map((s) => node(s.diseaseSlug)),
  )!;
  assert.ok(learningPath(tour, 0, true).every((e) => e.visited && !e.current));
});
test("카메라는 오른쪽·아래 패널을 제외한 영역 안에 노드를 맞춘다", () => {
  const bounds = { x: 300, y: 400, width: 130, height: 60 };
  for (const area of [
    { x: 0, y: 0, width: 390, height: 300 },
    { x: 420, y: 0, width: 800, height: 760 },
  ]) {
    const viewport = viewportForArea(bounds, area);
    const x = bounds.x * viewport.zoom + viewport.x;
    const y = bounds.y * viewport.zoom + viewport.y;
    assert.ok(x >= area.x && y >= area.y);
    assert.ok(x + bounds.width * viewport.zoom <= area.x + area.width);
    assert.ok(y + bounds.height * viewport.zoom <= area.y + area.height);
  }
});
