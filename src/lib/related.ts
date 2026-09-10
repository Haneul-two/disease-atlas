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

/**
 * 관련 질환 항목의 스크린리더 라벨 — 방향을 두 질병 이름으로 못박아 인과가 뒤집히지 않게 한다.
 * 각 질병 이름은 문자열에 정확히 한 번만, 원인 → 결과 순서로 등장한다(접두어로 중복하지 않는다) —
 * 그래야 "원인 이름이 결과 이름보다 앞에 온다"는 검증이 실제로 의미를 가진다.
 * 은/는·이/가처럼 받침에 따라 갈리는 조사는 피하고, 이름이 무엇이든 안전하게 붙는 "에서"/"방향"만 쓴다.
 */
export function relatedItemLabel(
  currentName: string,
  item: RelatedItem,
  typeLabel: string
): string {
  const { node, note, direction } = item;
  if (direction === null) {
    return `${typeLabel}, ${node.name}${note ? `. ${note}` : ""}`;
  }
  const originName = direction === "out" ? currentName : node.name;
  const destName = direction === "out" ? node.name : currentName;
  return `${typeLabel}, ${originName}에서 ${destName} 방향${note ? `. ${note}` : ""}`;
}
