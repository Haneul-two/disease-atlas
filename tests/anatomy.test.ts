import { test } from "node:test";
import assert from "node:assert/strict";
import { anatomicalPositions, alignedPositions, diseaseLandmark } from "../src/lib/atlas-anatomy";
import { diseases, bodyParts } from "../prisma/seed-data";
const input = diseases.map(d => ({ slug: d.slug, layoutZone: bodyParts.find(b => b.slug === d.bodyPart)!.layoutZone }));

test("정렬 배치는 신체 바깥에 놓이며 전신 질환을 분리하고 이름 공간을 확보한다", () => {
  const positions = alignedPositions(input);
  assert.deepEqual(positions, alignedPositions([...input].reverse()));
  for (const [slug, point] of positions) {
    assert.ok(point.x + 150 < 250 || point.x >= 750, slug);
    if (diseaseLandmark(slug)?.systemic) assert.equal(point.x, 1190);
  }
  const points = [...positions.values()];
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++)
    assert.ok(Math.abs(points[i].x - points[j].x) >= 150 || Math.abs(points[i].y - points[j].y) >= 56);
});

test("장기 배치는 모든 시드 질병을 포함하고 입력 순서에 흔들리지 않는다", () => {
  const positions = anatomicalPositions(input);
  assert.deepEqual(positions, anatomicalPositions([...input].reverse()));
  for (const d of input) assert.ok(diseaseLandmark(d.slug), d.slug);
  const points = [...positions.values()];
  for (let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
    assert.ok(Math.abs(points[i].x-points[j].x)>=112 || Math.abs(points[i].y-points[j].y)>=48, `label collision ${i}/${j}`);
  }
});

test("장기 배치는 심장과 폐, 어깨와 발을 구분하고 전신 질환을 따로 둔다", () => {
  const p=anatomicalPositions(input);
  assert.ok(p.get("angina")!.x > p.get("pneumonia")!.x);
  assert.ok(p.get("frozen-shoulder")!.y < p.get("hip-fracture")!.y);
  assert.ok(p.get("hip-fracture")!.y < p.get("plantar-fasciitis")!.y);
  assert.equal(diseaseLandmark("diabetes")!.systemic, true);
  assert.ok(anatomicalPositions([{slug:"future-disease",layoutZone:"new-zone"}]).has("future-disease"));
});

