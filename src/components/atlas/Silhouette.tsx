"use client";
// 해부 도판 배경 — 확대한 몸 실루엣(인그레이빙) + 부위별 색 글로우(노드를 신체에 묶음)
// + 내분비 연결선 + 등록(registration) 틱. ViewportPortal 안이라 팬/줌에 함께 고정된다.
import { ViewportPortal } from "@xyflow/react";
import type { AtlasBodyPart, AtlasNode } from "@/lib/atlas-types";
import { zoneCenter, zoneExtent, zoneLabelPosition } from "@/lib/atlas-layout";

type Props = {
  bodyParts: AtlasBodyPart[];
  nodes: AtlasNode[];
  visibleZones: Set<string>;
};

// 실루엣 SVG 좌표 → 그래프 좌표: graph_x = svgx + 190, graph_y = svgy + 90
const BODY_LEFT = 470; // div 중심 = 중앙 세로축
const BODY_TOP = 90;

export default function Silhouette({ bodyParts, nodes, visibleZones }: Props) {
  const countByZone = new Map<string, number>();
  for (const n of nodes) {
    if (!visibleZones.has(n.layoutZone)) continue;
    countByZone.set(n.layoutZone, (countByZone.get(n.layoutZone) ?? 0) + 1);
  }

  const activeParts = bodyParts.filter(
    (bp) => visibleZones.has(bp.layoutZone) && (countByZone.get(bp.layoutZone) ?? 0) > 0
  );

  // 내분비 연결선 좌표(목 → 내분비 클러스터)
  const endoVisible = activeParts.some((bp) => bp.layoutZone === "endocrine");
  const endoC = zoneCenter("endocrine");

  return (
    <ViewportPortal>
      {/* 1) 부위별 색 글로우 — 각 클러스터 뒤에 깔려 노드를 신체에 묶는다 */}
      {activeParts.map((bp, i) => {
        const c = zoneCenter(bp.layoutZone);
        const e = zoneExtent(bp.layoutZone, countByZone.get(bp.layoutZone) ?? 1);
        return (
          <div
            key={`glow-${bp.slug}`}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: e.rx * 2,
              height: e.ry * 2,
              pointerEvents: "none",
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, ${bp.color}26 0%, ${bp.color}12 38%, transparent 72%)`,
              animation: `atlas-breathe 7s ease-in-out ${i * 0.9}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* 2) 내분비 연결선 — 목에서 우측 샘 클러스터로 (도판 리더선) */}
      {endoVisible && (
        <svg
          style={{
            position: "absolute",
            left: 560,
            top: 300,
            pointerEvents: "none",
            overflow: "visible",
          }}
          width={1}
          height={1}
          aria-hidden
        >
          <line
            x1={40}
            y1={20}
            x2={endoC.x - 560}
            y2={endoC.y - 300}
            stroke="#b07ae0"
            strokeWidth={1}
            strokeDasharray="2 6"
            opacity={0.4}
            style={{ animation: "lead-flow 1.6s linear infinite" }}
          />
          <circle cx={40} cy={20} r={3} fill="#b07ae0" opacity={0.5} />
        </svg>
      )}

      {/* 3) 몸 실루엣 도판 */}
      <div
        style={{
          position: "absolute",
          left: BODY_LEFT,
          top: BODY_TOP,
          transform: "translate(-50%, 0)",
          pointerEvents: "none",
          animation: "silhouette-breathe 9s ease-in-out infinite",
        }}
      >
        <svg width={560} height={1080} viewBox="0 0 560 1080" fill="none" aria-hidden>
          {/* 중심축 + 등록 틱 (측정 도판 느낌) */}
          <g stroke="var(--silhouette)" strokeWidth={1}>
            <line x1={280} y1={-10} x2={280} y2={1040} strokeDasharray="2 9" />
            {[40, 260, 470, 690, 940].map((y) => (
              <g key={y}>
                <line x1={6} y1={y} x2={22} y2={y} />
                <line x1={538} y1={y} x2={554} y2={y} />
              </g>
            ))}
          </g>

          {/* 코너 크롭 마크 (플레이트) */}
          <g stroke="rgba(203,184,147,0.14)" strokeWidth={1}>
            {[
              [4, 4, 1, 1],
              [556, 4, -1, 1],
              [4, 1076, 1, -1],
              [556, 1076, -1, -1],
            ].map(([x, y, sx, sy], i) => (
              <g key={i}>
                <line x1={x} y1={y} x2={x + sx * 18} y2={y} />
                <line x1={x} y1={y} x2={x} y2={y + sy * 18} />
              </g>
            ))}
          </g>

          {/* 실루엣 본체 — 머리/목/몸통/팔/다리 */}
          <g fill="var(--silhouette)" stroke="rgba(203,184,147,0.2)" strokeWidth={1.3}>
            <circle cx={280} cy={96} r={78} />
            <rect x={252} y={166} width={56} height={42} rx={16} />
            {/* 몸통 */}
            <path d="M150 210 Q280 184 410 210 L432 470 Q436 650 390 775 Q280 832 170 775 Q124 650 128 470 Z" />
            {/* 팔 */}
            <path d="M158 222 Q96 282 78 470 Q70 562 92 652 L126 640 Q108 560 116 480 Q130 332 190 280 Z" />
            <path d="M402 222 Q464 282 482 470 Q490 562 468 652 L434 640 Q452 560 444 480 Q430 332 370 280 Z" />
            {/* 다리 */}
            <path d="M196 772 Q166 872 172 1000 L232 1000 Q246 860 268 700 Z" />
            <path d="M364 772 Q394 872 388 1000 L328 1000 Q314 860 292 700 Z" />
          </g>

          {/* 장기 힌트 — 흉곽/골반 곡선 (아주 흐릿한 주석선) */}
          <g stroke="rgba(203,184,147,0.11)" strokeWidth={1} fill="none">
            <path d="M186 400 Q280 430 374 400" />
            <path d="M196 446 Q280 474 364 446" />
            <path d="M206 700 Q280 740 354 700" />
          </g>
        </svg>
      </div>

      {/* 4) 부위 주석 (plate annotation) */}
      {activeParts.map((bp) => {
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
                style={{ fontFamily: "var(--f-plex-mono)", color: bp.color, opacity: 0.78 }}
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
