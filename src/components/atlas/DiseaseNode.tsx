"use client";
// 커스텀 질병 노드 — "표본 태그(specimen tag)". 잉크 표면 + 부위색 헤어라인/점.
// active = 호버/선택으로 강조된 상태, weight = 연결 수(허브일수록 크게).
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type DiseaseNodeData = {
  label: string;
  color: string;
  bodyPartName: string;
  active?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  weight?: number; // 0~1, 연결 수 정규화 → 크기/강조
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
  const w = d.weight ?? 0;

  // 연결 수에 따른 크기 — 허브 질환이 한눈에 크게 보이도록.
  const fontSize = 12.5 + w * 3.5; // 12.5 ~ 16px
  const padX = 11 + w * 5; // 11 ~ 16px
  const padY = 5.5 + w * 2.5;
  const dot = 7 + w * 3; // 7 ~ 10px

  return (
    <div
      className="atlas-node group relative flex items-center gap-2 rounded-[10px] border font-medium tracking-tight transition-[transform,box-shadow,background,border-color,opacity] duration-200 will-change-transform"
      style={{
        fontFamily: "var(--f-plex-kr)",
        fontSize: `${fontSize}px`,
        padding: `${padY}px ${padX}px`,
        background: d.active ? hexToRgba(c, 0.18) : "var(--node-bg)",
        color: d.active ? "var(--bone-bright)" : "var(--node-fg)",
        borderColor: d.active ? c : hexToRgba(c, 0.4 + w * 0.18),
        borderWidth: 1,
        opacity: d.dimmed ? 0.16 : 1,
        boxShadow: d.active
          ? `0 0 0 1px ${c}, 0 0 22px ${hexToRgba(c, 0.5)}, 0 8px 26px rgba(0,0,0,0.55)`
          : d.selected
            ? `0 0 0 1px ${hexToRgba(c, 0.7)}, 0 4px 16px rgba(0,0,0,0.45)`
            : "0 2px 10px rgba(0,0,0,0.35)",
        // fill은 backwards만 — both/forwards면 종료 후에도 키프레임의
        // opacity:1이 인라인 디밍(opacity 0.16)을 영구히 덮어쓴다.
        animation: "atlas-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards",
        animationDelay: `${d.appearDelay ?? 0}ms`,
      }}
      title={`${d.label} · ${d.bodyPartName}`}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />

      {/* 표본 점 — 부위색 */}
      <span
        className="inline-block shrink-0 rounded-full transition-shadow duration-200"
        style={{
          width: `${dot}px`,
          height: `${dot}px`,
          background: c,
          boxShadow: d.active ? `0 0 9px ${c}` : `0 0 ${2 + w * 4}px ${hexToRgba(c, 0.5)}`,
        }}
      />
      <span className="whitespace-nowrap">{d.label}</span>

      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

export default DiseaseNode;
