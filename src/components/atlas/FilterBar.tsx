"use client";
// 상단 필터 바 — 부위 칩(표시할 부위 선택) + 엣지 타입 토글(관계 기준 선택)
import type { AtlasBodyPart, EdgeType } from "@/lib/atlas-types";
import { EDGE_COLORS, EDGE_LABELS, EDGE_PRIORITY } from "@/lib/atlas-types";

type Props = {
  bodyParts: AtlasBodyPart[];
  visibleZones: Set<string>;
  toggleZone: (zone: string) => void;
  enabledEdges: Set<EdgeType>;
  toggleEdge: (type: EdgeType) => void;
};

export default function FilterBar({
  bodyParts,
  visibleZones,
  toggleZone,
  enabledEdges,
  toggleEdge,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
      {/* 부위 필터칩 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-zinc-500">부위</span>
        {bodyParts.map((bp) => {
          const on = visibleZones.has(bp.layoutZone);
          return (
            <button
              key={bp.slug}
              onClick={() => toggleZone(bp.layoutZone)}
              className="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
              style={{
                borderColor: bp.color,
                background: on ? bp.color : "transparent",
                color: on ? "#fff" : bp.color,
                opacity: on ? 1 : 0.6,
              }}
            >
              {bp.name}
            </button>
          );
        })}
      </div>

      {/* 엣지 타입 토글 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-zinc-500">연결선</span>
        {EDGE_PRIORITY.map((type: EdgeType) => {
          const on = enabledEdges.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleEdge(type)}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                borderColor: on ? EDGE_COLORS[type] : "transparent",
                background: on ? `${EDGE_COLORS[type]}1a` : "transparent",
                color: on ? EDGE_COLORS[type] : "#9ca3af",
              }}
            >
              <span
                className="inline-block h-0.5 w-4 rounded"
                style={{ background: on ? EDGE_COLORS[type] : "#d1d5db" }}
              />
              {EDGE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
