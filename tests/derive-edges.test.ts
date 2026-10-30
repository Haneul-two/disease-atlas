// deriveEdges가 수동 관계의 타입·방향을 보존하는지 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveEdges } from "../src/lib/atlas-layout";
import { RELATION_TYPES, toRelationType, type RelationType } from "../src/lib/atlas-types";

// 부위·계통·증상을 전부 다르게 두어 파생 엣지가 섞이지 않게 한다
const diseases = [
  { id: "a", bodyPartSlug: "chest", categoryName: null, symptoms: [] },
  { id: "b", bodyPartSlug: "brain", categoryName: null, symptoms: [] },
  { id: "c", bodyPartSlug: "abdomen", categoryName: null, symptoms: [] },
];

test("방향 있는 관계는 relationType과 from/to를 보존한다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "b", toId: "a", type: "risk", note: "b는 a의 위험인자" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "risk");
  assert.equal(e.relationFrom, "b");
  assert.equal(e.relationTo, "a");
});

test("무방향 관계(comorbidity)는 relationFrom/To를 갖지 않는다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "a", toId: "c", type: "comorbidity", note: "함께 나타남" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "comorbidity");
  assert.equal(e.relationFrom, undefined);
  assert.equal(e.relationTo, undefined);
});

test("같은 쌍에 여러 관계가 있으면 progression이 대표가 된다", () => {
  const edges = deriveEdges(diseases, [
    { fromId: "a", toId: "b", type: "comorbidity", note: "동반" },
    { fromId: "a", toId: "b", type: "progression", note: "진행" },
  ]);
  const e = edges.find((x) => x.types.includes("relation"))!;
  assert.equal(e.relationType, "progression");
});

test("toRelationType은 유효한 4종은 그대로, 알 수 없는 값·빈 문자열은 comorbidity로 강등한다", () => {
  for (const t of RELATION_TYPES) {
    assert.equal(toRelationType(t), t);
  }
  assert.equal(toRelationType("알수없는값"), "comorbidity");
  assert.equal(toRelationType(""), "comorbidity");
});

test("알 수 없는 타입이 섞여도 유효한 progression이 대표가 된다 (삽입 순서 무관)", () => {
  // DB·폼 검증을 우회해 실수로 들어온 값을 가정 — indexOf가 -1을 최상위로 오판하지 않는지 확인
  const unknownType = "알수없음" as unknown as RelationType;

  const invalidFirst = deriveEdges(diseases, [
    { fromId: "a", toId: "b", type: unknownType, note: "알 수 없는 타입" },
    { fromId: "a", toId: "b", type: "progression", note: "진행" },
  ]);
  const e1 = invalidFirst.find((x) => x.types.includes("relation"))!;
  assert.equal(e1.relationType, "progression");

  const invalidSecond = deriveEdges(diseases, [
    { fromId: "a", toId: "b", type: "progression", note: "진행" },
    { fromId: "a", toId: "b", type: unknownType, note: "알 수 없는 타입" },
  ]);
  const e2 = invalidSecond.find((x) => x.types.includes("relation"))!;
  assert.equal(e2.relationType, "progression");
});

test("복수 관계의 해설을 모두 보존하고 대표 관계와 해설을 일치시킨다", () => {
  const relations = [
    { fromId: "b", toId: "a", type: "progression" as const, note: "대표 진행 해설" },
    { fromId: "a", toId: "b", type: "comorbidity" as const, note: "동반 관계 해설" },
  ];
  for (const input of [relations, [...relations].reverse()]) {
    const edge = deriveEdges(diseases, input)[0];
    assert.equal(edge.note, "대표 진행 해설");
    assert.equal(edge.relationFrom, "b");
    assert.equal(edge.relationDetails?.length, 2);
    assert.equal(edge.relationDetails?.[1].note, "동반 관계 해설");
  }
});
