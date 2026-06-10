"use client";
// 흐릿한 해부 도판 — 몸 실루엣(인그레이빙 느낌) + 등록(registration) 틱 + 부위 주석.
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
  const countByZone = new Map<string, number>();
  for (const n of nodes) {
    if (!visibleZones.has(n.layoutZone)) continue;
    countByZone.set(n.layoutZone, (countByZone.get(n.layoutZone) ?? 0) + 1);
  }

  return (
    <ViewportPortal>
      {/* 몸 실루엣 도판 — 좌표계 원점 기준 절대 배치 */}
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 110,
          transform: "translate(-50%, 0)",
          pointerEvents: "none",
        }}
      >
        <svg width={460} height={860} viewBox="-20 -20 460 860" fill="none" aria-hidden>
          {/* 중심축 + 등록 틱 (측정 도판 느낌) */}
          <g stroke="var(--silhouette)" strokeWidth={1}>
            <line x1={210} y1={-10} x2={210} y2={820} strokeDasharray="2 8" />
            {[40, 200, 360, 520, 680].map((y) => (
              <g key={y}>
                <line x1={-10} y1={y} x2={4} y2={y} />
                <line x1={416} y1={y} x2={430} y2={y} />
              </g>
            ))}
          </g>

          {/* 실루엣 본체 */}
          <g
            fill="var(--silhouette)"
            stroke="rgba(203,184,147,0.09)"
            strokeWidth={1}
          >
            <circle cx={210} cy={70} r={52} />
            <rect x={188} y={118} width={44} height={28} rx={12} />
            <path d="M150 150 Q210 132 270 150 L286 360 Q286 470 250 560 Q210 600 170 560 Q134 470 134 360 Z" />
            <path d="M150 165 Q96 200 80 330 Q74 400 90 470 L118 462 Q108 390 116 330 Q128 230 162 200 Z" />
            <path d="M270 165 Q324 200 340 330 Q346 400 330 470 L302 462 Q312 390 304 330 Q292 230 258 200 Z" />
            <path d="M172 555 Q150 660 150 760 L188 760 Q200 660 206 560 Z" />
            <path d="M248 555 Q270 660 270 760 L232 760 Q220 660 214 560 Z" />
          </g>
        </svg>
      </div>

      {/* 부위 주석 (plate annotation) */}
      {bodyParts
        .filter(
          (bp) => visibleZones.has(bp.layoutZone) && (countByZone.get(bp.layoutZone) ?? 0) > 0
        )
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
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.25em]"
                  style={{ fontFamily: "var(--f-plex-mono)", color: bp.color, opacity: 0.75 }}
                >
                  {bp.slug}
                </span>
                <span
                  className="text-[15px] leading-none"
                  style={{ fontFamily: "var(--f-gowun)", color: "var(--paper-dim)" }}
                >
                  {bp.name}
                </span>
                <span
                  className="mt-0.5 inline-block h-px w-8"
                  style={{ background: bp.color, opacity: 0.5 }}
                />
              </div>
            </div>
          );
        })}
    </ViewportPortal>
  );
}
