"use client";
// 질병 노드 — "별(star)". 발광하는 점 + 그 아래 작은 라벨 (별자리 스타일).
// active = 호버/선택 강조, weight = 연결 수(0~1, 허브일수록 크고 밝게).
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type DiseaseNodeData = {
  label: string;
  color: string;
  bodyPartName: string;
  active?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  weight?: number;
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

  // 연결 수에 따른 별 크기 — 허브 질환일수록 크고 밝다.
  const dot = 9 + w * 9; // 9 ~ 18px
  const lit = d.active || d.selected;

  // 핸들을 점 중앙에 겹쳐 두면 선이 별에서 뻗어나간다.
  const handleStyle: CSSProperties = {
    top: dot / 2,
    bottom: "auto",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1,
    height: 1,
    minWidth: 0,
    minHeight: 0,
    opacity: 0,
    pointerEvents: "none",
    border: "none",
  };

  return (
    <div
      className="atlas-node group relative flex flex-col items-center"
      style={{
        // fill은 backwards만 — both/forwards면 종료 후에도 키프레임 opacity가
        // 인라인 디밍(opacity)을 영구히 덮어쓴다.
        animation: "star-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards",
        animationDelay: `${d.appearDelay ?? 0}ms`,
        opacity: d.dimmed ? 0.1 : 1,
        transition: "opacity 0.3s ease",
        cursor: "pointer",
      }}
      title={`${d.label} · ${d.bodyPartName}`}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      {/* 별 본체 — 코어(밝은 중심) + 부위색 헤일로 */}
      <span
        className="atlas-star"
        style={{
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 35%, ${
            lit ? "#ffffff" : hexToRgba(c, 0.95)
          } 0%, ${c} 48%, ${hexToRgba(c, 0.55)} 100%)`,
          boxShadow: d.active
            ? `0 0 0 3px ${hexToRgba(c, 0.18)}, 0 0 20px 5px ${hexToRgba(c, 0.8)}`
            : d.selected
              ? `0 0 0 2px ${hexToRgba(c, 0.25)}, 0 0 14px 3px ${hexToRgba(c, 0.65)}`
              : `0 0 ${6 + w * 10}px ${1 + w * 2.5}px ${hexToRgba(c, 0.4 + w * 0.25)}`,
          transform: d.active ? "scale(1.22)" : "scale(1)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease",
        }}
      />

      {/* 라벨 — 별 아래 작은 글자 */}
      <span
        style={{
          marginTop: 7,
          fontSize: 11.5 + w * 1.5,
          lineHeight: 1,
          whiteSpace: "nowrap",
          fontFamily: "var(--f-plex-kr)",
          fontWeight: lit ? 600 : 450,
          letterSpacing: "-0.01em",
          color: lit ? "var(--paper)" : "var(--paper-dim)",
          textShadow: d.active
            ? `0 0 12px ${hexToRgba(c, 0.65)}, 0 1px 6px rgba(0,0,0,0.9)`
            : "0 1px 6px rgba(0,0,0,0.85)",
          transition: "color 0.2s ease, text-shadow 0.2s ease",
        }}
      >
        {d.label}
      </span>
    </div>
  );
}

export default DiseaseNode;
