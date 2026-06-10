"use client";
// 흐릿한 몸 실루엣 가이드 + 부위 클러스터 라벨.
// ViewportPortal 안에 두어 그래프 좌표계(팬/줌)에 함께 고정된다.
import { ViewportPortal } from "@xyflow/react";
import type { AtlasBodyPart, AtlasNode } from "@/lib/atlas-types";
import { zoneLabelPosition } from "@/lib/atlas-layout";

type Props = {
  bodyParts: AtlasBodyPart[];
  nodes: AtlasNode[];
  visibleZones: Set<string>;
};

export default function Silhouette({ bodyParts, nodes, visibleZones }: Props) {
  // zone별 질병 수 (라벨 위치 계산용)
  const countByZone = new Map<string, number>();
  for (const n of nodes) {
    if (!visibleZones.has(n.layoutZone)) continue;
    countByZone.set(n.layoutZone, (countByZone.get(n.layoutZone) ?? 0) + 1);
  }

  return (
    <ViewportPortal>
      {/* 몸 실루엣 — 좌표계 원점 기준 절대 배치 */}
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 120,
          transform: "translate(-50%, 0)",
          pointerEvents: "none",
        }}
      >
        <svg width={420} height={820} viewBox="0 0 420 820" fill="none" aria-hidden>
          <g
            fill="var(--silhouette)"
            stroke="var(--silhouette)"
            strokeWidth={1}
          >
            {/* 머리 */}
            <circle cx={210} cy={70} r={52} />
            {/* 목 */}
            <rect x={188} y={118} width={44} height={28} rx={12} />
            {/* 몸통(가슴+복부) */}
            <path d="M150 150 Q210 132 270 150 L286 360 Q286 470 250 560 Q210 600 170 560 Q134 470 134 360 Z" />
            {/* 왼팔 */}
            <path d="M150 165 Q96 200 80 330 Q74 400 90 470 L118 462 Q108 390 116 330 Q128 230 162 200 Z" />
            {/* 오른팔 */}
            <path d="M270 165 Q324 200 340 330 Q346 400 330 470 L302 462 Q312 390 304 330 Q292 230 258 200 Z" />
            {/* 왼다리 */}
            <path d="M172 555 Q150 660 150 760 L188 760 Q200 660 206 560 Z" />
            {/* 오른다리 */}
            <path d="M248 555 Q270 660 270 760 L232 760 Q220 660 214 560 Z" />
          </g>
        </svg>
      </div>

      {/* 부위 클러스터 라벨 */}
      {bodyParts
        .filter((bp) => visibleZones.has(bp.layoutZone) && (countByZone.get(bp.layoutZone) ?? 0) > 0)
        .map((bp) => {
          const pos = zoneLabelPosition(bp.layoutZone, countByZone.get(bp.layoutZone) ?? 1);
          return (
            <div
              key={bp.slug}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold tracking-tight"
                style={{ color: bp.color, background: `${bp.color}1a` }}
              >
                {bp.name}
              </span>
            </div>
          );
        })}
    </ViewportPortal>
  );
}
