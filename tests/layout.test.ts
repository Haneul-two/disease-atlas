import { test } from "node:test";
import assert from "node:assert/strict";
import { zonePositions } from "../src/lib/atlas-layout";

// 부위당 목표 상한 (80개 / 5부위)
const COUNTS: Record<string, number> = {
  head: 16, chest: 16, abdomen: 16, limbs: 16, endocrine: 16,
};
const NODE_W = 96; // 별 + 라벨 폭
const NODE_H = 24;
const MARGIN = 8;  // 클러스터 간 최소 시각적 여유

function bbox(zone: string) {
  const pts = zonePositions(zone, COUNTS[zone]);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    minX: Math.min(...xs) - MARGIN,
    maxX: Math.max(...xs) + NODE_W + MARGIN,
    minY: Math.min(...ys) - MARGIN,
    maxY: Math.max(...ys) + NODE_H + MARGIN,
  };
}

test("부위당 16개일 때 클러스터 박스가 서로 겹치지 않는다", () => {
  const zones = Object.keys(COUNTS);
  for (let i = 0; i < zones.length; i++)
    for (let j = i + 1; j < zones.length; j++) {
      const a = bbox(zones[i]);
      const b = bbox(zones[j]);
      const overlap =
        a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
      assert.ok(!overlap, `${zones[i]} ↔ ${zones[j]} 클러스터 겹침`);
    }
});
