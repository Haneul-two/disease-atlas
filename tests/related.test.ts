// 상세 패널의 관련 질환 그룹핑 — 방향과 타입 순서를 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupRelated, relatedItemLabel } from "../src/lib/related";
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

test("relatedItemLabel: direction out — 현재 질병이 원인, 대상 질병이 결과 순서로 라벨링된다", () => {
  const label = relatedItemLabel(
    "고혈압",
    { node: node("뇌졸중"), note: null, direction: "out" },
    "위험인자"
  );
  assert.ok(label.indexOf("고혈압") < label.indexOf("뇌졸중"), label);
});

test("relatedItemLabel: direction in — 대상 질병이 원인, 현재 질병이 결과 순서로 라벨링된다", () => {
  const label = relatedItemLabel(
    "뇌졸중",
    { node: node("고혈압"), note: null, direction: "in" },
    "위험인자"
  );
  assert.ok(label.indexOf("고혈압") < label.indexOf("뇌졸중"), label);
});

test("relatedItemLabel: 반대쪽에서 봐도 원인 → 결과 순서는 동일하다", () => {
  const fromHtn = relatedItemLabel(
    "고혈압",
    { node: node("뇌졸중"), note: null, direction: "out" },
    "위험인자"
  );
  const fromStroke = relatedItemLabel(
    "뇌졸중",
    { node: node("고혈압"), note: null, direction: "in" },
    "위험인자"
  );
  assert.ok(fromHtn.indexOf("고혈압") < fromHtn.indexOf("뇌졸중"));
  assert.ok(fromStroke.indexOf("고혈압") < fromStroke.indexOf("뇌졸중"));
});

test("relatedItemLabel: direction null이면 방향 표현이 들어가지 않는다", () => {
  const label = relatedItemLabel(
    "고혈압",
    { node: node("류마티스"), note: null, direction: null },
    "동반"
  );
  assert.ok(!label.includes("방향"));
  assert.ok(!label.includes("에서"));
});

test("relatedItemLabel: note가 있으면 포함되고, 없으면 문장부호가 남지 않는다", () => {
  const withNote = relatedItemLabel(
    "고혈압",
    { node: node("뇌졸중"), note: "고혈압은 뇌졸중의 위험인자", direction: "out" },
    "위험인자"
  );
  const withoutNote = relatedItemLabel(
    "고혈압",
    { node: node("뇌졸중"), note: null, direction: "out" },
    "위험인자"
  );
  assert.ok(withNote.includes("고혈압은 뇌졸중의 위험인자"));
  assert.ok(!withoutNote.endsWith("."));
  assert.ok(!withoutNote.includes(". ."));
});
