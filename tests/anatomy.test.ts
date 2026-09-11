import { test } from "node:test";
import assert from "node:assert/strict";
import { anatomicalPositions, diseaseLandmark } from "../src/lib/atlas-anatomy";
import { diseases, bodyParts } from "../prisma/seed-data";
const input = diseases.map(d => ({ slug: d.slug, layoutZone: bodyParts.find(b => b.slug === d.bodyPart)!.layoutZone }));

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

