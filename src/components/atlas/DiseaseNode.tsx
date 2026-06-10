"use client";
// 커스텀 질병 노드 — "표본 태그(specimen tag)". 잉크 표면 + 부위색 헤어라인/점.
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type DiseaseNodeData = {
  label: string;
  color: string;
  bodyPartName: string;
  selected?: boolean;
  dimmed?: boolean;
  appearDelay?: number;
};

function hexToRgba(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function DiseaseNode({ data }: NodeProps) {
  const d = data as DiseaseNodeData;
  const c = d.color;

  return (
    <div
      className="atlas-node group relative flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-[13px] font-medium tracking-tight transition-[transform,box-shadow,background,border-color] duration-200 will-change-transform"
      style={{
        fontFamily: "var(--f-plex-kr)",
        background: d.selected
          ? hexToRgba(c, 0.16)
          : "var(--node-bg)",
        color: d.selected ? "var(--bone-bright)" : "var(--node-fg)",
        borderColor: d.selected ? c : hexToRgba(c, 0.42),
        borderWidth: 1,
        opacity: d.dimmed ? 0.22 : 1,
        boxShadow: d.selected
          ? `0 0 0 1px ${c}, 0 0 18px ${hexToRgba(c, 0.45)}, 0 8px 24px rgba(0,0,0,0.5)`
          : "0 2px 10px rgba(0,0,0,0.35)",
        animation: "atlas-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: `${d.appearDelay ?? 0}ms`,
      }}
      title={`${d.label} · ${d.bodyPartName}`}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />

      {/* 표본 점 — 부위색 */}
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full transition-shadow duration-200"
        style={{
          background: c,
          boxShadow: d.selected ? `0 0 8px ${c}` : "none",
        }}
      />
      <span className="whitespace-nowrap">{d.label}</span>

      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

export default DiseaseNode;
