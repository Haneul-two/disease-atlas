// 상세 패널의 "관련 질환"을 관계 타입별로 묶는다 — DetailPanel에서 분리해 테스트 가능하게 했다.
import { RELATION_PRIORITY } from "./atlas-types";
import type { AtlasData, AtlasNode, RelationType } from "./atlas-types";

export type RelatedItem = {
  node: AtlasNode;
  note: string | null;
  /** 현재 노드 기준 방향 — out: 내가 원인, in: 내가 결과, null: 무방향 */
  direction: "out" | "in" | null;
};

export type RelatedGroup = { type: RelationType; items: RelatedItem[] };

export function groupRelated(node: AtlasNode, data: AtlasData): RelatedGroup[] {
  const byType = new Map<RelationType, RelatedItem[]>();

  for (const e of data.edges) {
    if (!e.types.includes("relation")) continue;
    if (e.source !== node.id && e.target !== node.id) continue;

    const otherId = e.source === node.id ? e.target : e.source;
    const other = data.nodes.find((n) => n.id === otherId);
    if (!other) continue;

    const type: RelationType = e.relationType ?? "comorbidity";
    const direction: RelatedItem["direction"] = e.relationFrom
      ? e.relationFrom === node.id
        ? "out"
        : "in"
      : null;

    byType.set(type, [...(byType.get(type) ?? []), { node: other, note: e.note ?? null, direction }]);
  }

  return RELATION_PRIORITY.filter((t) => byType.has(t)).map((t) => ({
    type: t,
    items: byType.get(t)!,
  }));
}
