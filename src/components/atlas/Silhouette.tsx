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

/** 전신 외곽 — 목→어깨→팔(몸에 붙임)→허리→골반→다리→발, 좌우 대칭의 연속 곡선.
 *  좌측 좌표를 기준으로 우측은 x' = 560 - x 미러. */
const BODY_OUTLINE = [
  "M 258 150",
  "C 256 170 250 182 234 190", // 목 → 승모근
  "C 198 202 170 218 158 248", // 어깨
  "C 140 290 132 348 130 412", // 상완(몸에 붙은 팔) 외곽
  "C 126 470 136 520 150 558", // 팔꿈치 → 허리(잘록)
  "C 158 595 160 642 154 690", // 골반 외곽
  "C 150 760 158 840 164 905", // 허벅지 외곽
  "C 168 950 170 985 170 1015", // 종아리 → 발목
  "L 208 1015", // 발
  "C 212 960 216 905 222 850", // 종아리 안쪽
  "C 230 790 246 745 266 715", // 허벅지 안쪽
  "C 274 706 278 702 280 700", // 가랑이 중심
  "C 282 702 286 706 294 715",
  "C 314 745 330 790 338 850",
  "C 344 905 348 960 352 1015",
  "L 390 1015",
  "C 390 985 392 950 396 905",
  "C 402 840 410 760 406 690",
  "C 400 642 402 595 410 558",
  "C 424 520 434 470 430 412",
  "C 428 348 420 290 402 248",
  "C 390 218 362 202 326 190",
  "C 310 182 304 170 302 150",
].join(" ");

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
          <g fill="rgba(203, 184, 147, 0.03)" stroke="none">
            <circle cx={280} cy={92} r={56} />
            <path d={BODY_OUTLINE} />
          </g>

          {/* 라인아트 외곽선 — 머리부터 발끝까지 순서대로 그려진다 */}
          <g
            stroke="rgba(203, 184, 147, 0.24)"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            {/* 머리 */}
            <circle
              cx={280}
              cy={92}
              r={56}
              pathLength={1}
              strokeDasharray={1}
              style={{ animation: "body-draw 1.3s cubic-bezier(0.4,0,0.2,1) 0.2s backwards" }}
            />
            {/* 전신 외곽 — 하나의 연속 곡선 */}
            <DrawnPath d={BODY_OUTLINE} delay={1.0} duration={3.2} />
          </g>

          {/* 해부 힌트 — 쇄골·골반, 아주 흐릿하게 나중에 떠오른다 */}
          <g
            stroke="rgba(203, 184, 147, 0.12)"
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
          >
            <path
              d="M230 218 Q280 236 330 218"
              style={{ animation: "hint-in 1.2s ease 3.4s backwards" }}
            />
            <path
              d="M234 656 Q280 690 326 656"
              style={{ animation: "hint-in 1.2s ease 3.7s backwards" }}
            />
            {/* 팔 분리선 — 겨드랑이에서 손목으로, 몸과 팔을 나눈다 */}
            <DrawnPath
              d="M 178 268 C 164 330 158 395 160 455 C 162 510 168 545 178 575"
              delay={3.0}
              duration={1.2}
            />
            <DrawnPath
              d="M 382 268 C 396 330 402 395 400 455 C 398 510 392 545 382 575"
              delay={3.0}
              duration={1.2}
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
