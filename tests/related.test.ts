// 상세 패널의 관련 질환 그룹핑 — 방향과 타입 순서를 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupRelated } from "../src/lib/related";
import type { AtlasData, AtlasNode } from "../src/lib/atlas-types";

function node(id: string): AtlasNode {
  return {
    id,
    slug: id,
    name: id,
    medicalTerm: null,
    description: "",
    treatment: "",
    bodyPartSlug: "chest",
    bodyPartName: "가슴",
    color: "#fff",
    layoutZone: "chest",
    categoryName: null,
    symptoms: [],
    position: { x: 0, y: 0 },
  };
}

const data: AtlasData = {
  nodes: [node("htn"), node("stroke"), node("ra"), node("gastritis")],
  bodyParts: [],
  edges: [
    {
      id: "e1", source: "htn", target: "stroke", types: ["relation"], primary: "relation",
      note: "고혈압은 뇌졸중의 위험인자",
      relationType: "risk", relationFrom: "htn", relationTo: "stroke",
    },
    {
      id: "e2", source: "gastritis", target: "htn", types: ["relation"], primary: "relation",
      note: "진행", relationType: "progression", relationFrom: "gastritis", relationTo: "htn",
    },
    {
      id: "e3", source: "htn", target: "ra", types: ["relation"], primary: "relation",
      note: "동반", relationType: "comorbidity",
    },
    {
      id: "e4", source: "htn", target: "ra", types: ["symptom"], primary: "symptom",
      note: null, sharedSymptoms: ["피로"],
    },
  ],
};

test("관계 엣지만 모으고 증상 엣지는 무시한다", () => {
  const groups = groupRelated(node("htn"), data);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  assert.equal(total, 3);
});

test("그룹은 progression → risk → comorbidity 우선순위 순서로 나온다", () => {
  const groups = groupRelated(node("htn"), data);
  assert.deepEqual(groups.map((g) => g.type), ["progression", "risk", "comorbidity"]);
});

test("내가 원인이면 out, 내가 결과면 in, 무방향이면 null", () => {
  const groups = groupRelated(node("htn"), data);
  const byType = Object.fromEntries(groups.map((g) => [g.type, g.items[0]]));
  assert.equal(byType.risk.direction, "out");        // htn → stroke
  assert.equal(byType.progression.direction, "in");  // gastritis → htn
  assert.equal(byType.comorbidity.direction, null);
});

test("관계가 없는 노드는 빈 배열을 돌려준다", () => {
  assert.deepEqual(groupRelated(node("없는질병"), data), []);
});
