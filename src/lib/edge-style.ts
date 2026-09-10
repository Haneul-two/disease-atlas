// 엣지 하나의 시각 속성을 결정한다 — AtlasFlow의 렌더 분기를 DOM 없이 검증하려고 분리했다.
import { EDGE_COLORS } from "./atlas-types";
import type { AtlasEdge } from "./atlas-types";

export type EdgeVisual = {
  /** React Flow에 넘길 시작/끝 — 방향 관계면 관계 방향으로 세운다 */
  source: string;
  target: string;
  color: string;
  strokeWidth: number;
  opacity: number;
  animated: boolean;
  /** 화살표 마커를 붙일지 */
  directed: boolean;
};

export function edgeVisual(e: AtlasEdge, activeId: string | null): EdgeVisual {
  const touchesActive = !!activeId && (e.source === activeId || e.target === activeId);
  const dimmed = !!activeId && !touchesActive;
  const directed = !!e.relationFrom && !!e.relationTo;
  const isProgression = e.relationType === "progression";

  // 평상시 굵기·불투명도 — 진행 관계는 스토리라인이므로 한 단계 진하게
  const restOpacity =
    e.primary === "relation"
      ? isProgression
        ? 0.45
        : 0.3
      : e.primary === "symptom"
        ? 0.16
        : 0.1;
  const restWidth = e.primary === "relation" && isProgression ? 1.3 : 1;

  return {
    source: directed ? e.relationFrom! : e.source,
    target: directed ? e.relationTo! : e.target,
    color: EDGE_COLORS[e.primary],
    strokeWidth: touchesActive ? 1.8 : restWidth,
    opacity: dimmed ? 0.03 : touchesActive ? 0.95 : restOpacity,
    animated: touchesActive,
    directed,
  };
}
