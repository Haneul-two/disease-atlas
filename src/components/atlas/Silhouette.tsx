"use client";
// 별자리 배경 — 가는 라인아트 몸 실루엣(스스로 그려지는 선) + 부위별 성운 글로우.
// ViewportPortal 안이라 팬/줌에 함께 고정된다.
import { ViewportPortal } from "@xyflow/react";
import type { AtlasBodyPart, AtlasNode } from "@/lib/atlas-types";
import { zoneCenter, zoneExtent, zoneLabelPosition } from "@/lib/atlas-layout";

type Props = {
  bodyParts: AtlasBodyPart[];
  nodes: AtlasNode[];
  visibleZones: Set<string>;
  /** 강조(호버/선택) 노드가 속한 부위 — 해당 글로우를 밝힌다 */
  activeZone?: string | null;
};

const BODY_LEFT = 470; // div 중심 = 중앙 세로축
const BODY_TOP = 90;

// 라인아트 스트로크 — pathLength=1 트릭으로 dashoffset 1→0 드로잉
function DrawnPath({
  d,
  delay,
  duration = 1.6,
}: {
  d: string;
  delay: number;
  duration?: number;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray={1}
      style={{
        animation: `body-draw ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s backwards`,
      }}
    />
  );
}

export default function Silhouette({ bodyParts, nodes, visibleZones, activeZone }: Props) {
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
      {/* 1) 부위별 성운 글로우 — 클러스터 뒤에 넓고 옅게 깔린다.
             호버/선택 부위는 밝아지고, 다른 부위는 가라앉는다. */}
      {activeParts.map((bp, i) => {
        const c = zoneCenter(bp.layoutZone);
        const e = zoneExtent(bp.layoutZone, countByZone.get(bp.layoutZone) ?? 1);
        const isActive = activeZone === bp.layoutZone;
        const dimOther = !!activeZone && !isActive;
        const a = isActive ? ["40", "1e"] : ["17", "0a"]; // [중심, 중간] 알파(hex)
        return (
          <div
            key={`glow-${bp.slug}`}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: e.rx * 2.7,
              height: e.ry * 2.7,
              pointerEvents: "none",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(ellipse at center, ${bp.color}${a[0]} 0%, ${bp.color}${a[1]} 42%, transparent 70%)`,
              opacity: dimOther ? 0.3 : 1,
              transition: "opacity 0.35s ease",
              animation: isActive
                ? undefined
                : `nebula-drift ${13 + i * 2.4}s ease-in-out ${i * 1.7}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* 2) 몸 실루엣 — 가는 외곽선이 스스로 그려진다 */}
      <div
        style={{
          position: "absolute",
          left: BODY_LEFT,
          top: BODY_TOP,
          transform: "translate(-50%, 0)",
          pointerEvents: "none",
          animation: "silhouette-breathe 14s ease-in-out infinite",
        }}
      >
        <svg width={560} height={1080} viewBox="0 0 560 1080" fill="none" aria-hidden>
          {/* 아주 옅은 면 — 몸의 존재감만 */}
          <g fill="rgba(203, 184, 147, 0.025)" stroke="none">
            <circle cx={280} cy={96} r={78} />
            <path d="M252 166 h56 v42 h-56 Z" />
            <path d="M150 210 Q280 184 410 210 L432 470 Q436 650 390 775 Q280 832 170 775 Q124 650 128 470 Z" />
            <path d="M196 772 Q166 872 172 1000 L232 1000 Q246 860 268 700 Z" />
            <path d="M364 772 Q394 872 388 1000 L328 1000 Q314 860 292 700 Z" />
          </g>

          {/* 라인아트 외곽선 — 위에서 아래로 순서대로 그려진다 */}
          <g
            stroke="rgba(203, 184, 147, 0.22)"
            strokeWidth={1.1}
            strokeLinecap="round"
            fill="none"
          >
            {/* 머리 */}
            <circle
              cx={280}
              cy={96}
              r={78}
              pathLength={1}
              strokeDasharray={1}
              style={{ animation: "body-draw 1.4s cubic-bezier(0.4,0,0.2,1) 0.2s backwards" }}
            />
            {/* 목 */}
            <DrawnPath d="M252 170 L252 208 M308 170 L308 208" delay={0.9} duration={0.6} />
            {/* 몸통 */}
            <DrawnPath
              d="M150 210 Q280 184 410 210 L432 470 Q436 650 390 775 Q280 832 170 775 Q124 650 128 470 Z"
              delay={1.1}
              duration={2.2}
            />
            {/* 팔 */}
            <DrawnPath
              d="M158 222 Q96 282 78 470 Q70 562 92 652"
              delay={1.7}
              duration={1.4}
            />
            <DrawnPath
              d="M402 222 Q464 282 482 470 Q490 562 468 652"
              delay={1.7}
              duration={1.4}
            />
            {/* 다리 */}
            <DrawnPath
              d="M196 772 Q166 872 172 1000 M268 700 Q246 860 232 1000"
              delay={2.4}
              duration={1.4}
            />
            <DrawnPath
              d="M364 772 Q394 872 388 1000 M292 700 Q314 860 328 1000"
              delay={2.4}
              duration={1.4}
            />
          </g>
        </svg>
      </div>

      {/* 3) 내분비 리더선 — 목에서 우측 샘 클러스터로, 조용한 점선 */}
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
            strokeDasharray="2 7"
            opacity={0.22}
            style={{ animation: "lead-flow 2.4s linear infinite" }}
          />
        </svg>
      )}

      {/* 4) 부위 라벨 — 클러스터 위 작은 별자리 이름 */}
      {activeParts.map((bp, i) => {
        const pos = zoneLabelPosition(bp.layoutZone, countByZone.get(bp.layoutZone) ?? 1);
        const isActive = activeZone === bp.layoutZone;
        return (
          <div
            key={bp.slug}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              animation: `star-in 0.8s ease ${0.5 + i * 0.18}s backwards`,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-[13px] leading-none tracking-[0.18em]"
                style={{
                  fontFamily: "var(--f-gowun)",
                  color: isActive ? "var(--paper)" : "var(--paper-dim)",
                  opacity: isActive ? 0.95 : 0.6,
                  transition: "opacity 0.3s ease, color 0.3s ease",
                }}
              >
                {bp.name}
              </span>
              <span
                className="inline-block h-px w-7"
                style={{
                  background: bp.color,
                  opacity: isActive ? 0.7 : 0.35,
                  transition: "opacity 0.3s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </ViewportPortal>
  );
}
