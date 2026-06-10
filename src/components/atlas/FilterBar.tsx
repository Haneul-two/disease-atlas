"use client";
// 필터 바 — 해부 도판의 "범례(key)". 부위 표본 스와치 + 연결선 키.
import type { AtlasBodyPart, EdgeType } from "@/lib/atlas-types";
import { EDGE_COLORS, EDGE_LABELS, EDGE_PRIORITY } from "@/lib/atlas-types";

type Props = {
  bodyParts: AtlasBodyPart[];
  visibleZones: Set<string>;
  toggleZone: (zone: string) => void;
  enabledEdges: Set<EdgeType>;
  toggleEdge: (type: EdgeType) => void;
};

function KeyLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mr-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]"
      style={{ fontFamily: "var(--f-plex-mono)" }}
    >
      {children}
    </span>
  );
}

export default function FilterBar({
  bodyParts,
  visibleZones,
  toggleZone,
  enabledEdges,
  toggleEdge,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-[var(--line)] bg-[var(--ink-800)]/70 px-5 py-2.5 backdrop-blur-md">
      {/* 부위 표본 스와치 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <KeyLabel>Region</KeyLabel>
        {bodyParts.map((bp) => {
          const on = visibleZones.has(bp.layoutZone);
          return (
            <button
              key={bp.slug}
              onClick={() => toggleZone(bp.layoutZone)}
              className="group flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12.5px] transition-all duration-150"
              style={{
                fontFamily: "var(--f-plex-kr)",
                borderColor: on ? `${bp.color}66` : "var(--line)",
                background: on ? `${bp.color}1f` : "transparent",
                color: on ? "var(--paper)" : "var(--muted)",
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full transition-all"
                style={{
                  background: on ? bp.color : "transparent",
                  border: on ? "none" : `1px solid ${bp.color}88`,
                  boxShadow: on ? `0 0 6px ${bp.color}aa` : "none",
                }}
              />
              {bp.name}
            </button>
          );
        })}
      </div>

      <span className="hidden h-5 w-px bg-[var(--line)] sm:block" />

      {/* 연결선 키 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <KeyLabel>Links</KeyLabel>
        {EDGE_PRIORITY.map((type: EdgeType) => {
          const on = enabledEdges.has(type);
          const c = EDGE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => toggleEdge(type)}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] transition-all duration-150"
              style={{
                fontFamily: "var(--f-plex-kr)",
                borderColor: on ? `${c}55` : "transparent",
                background: on ? `${c}16` : "transparent",
                color: on ? "var(--paper-dim)" : "var(--muted)",
              }}
            >
              <span
                className="inline-block h-[2px] w-5 rounded"
                style={{
                  background: on ? c : "var(--line-strong)",
                  boxShadow: on ? `0 0 6px ${c}88` : "none",
                }}
              />
              {EDGE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
