// deriveEdges가 수동 관계의 타입·방향을 보존하는지 검증한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveEdges } from "../src/lib/atlas-layout";

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
