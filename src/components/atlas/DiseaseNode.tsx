"use client";
// 커스텀 질병 노드 — 부위 색의 알약(pill) 모양. 선택/디밍 상태를 반영한다.
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type DiseaseNodeData = {
  label: string;
  color: string;
  bodyPartName: string;
  selected?: boolean;
  dimmed?: boolean;
};

function DiseaseNode({ data }: NodeProps) {
  const d = data as DiseaseNodeData;
  return (
    <div
      className="rounded-full border px-3.5 py-1.5 text-center text-[13px] font-medium shadow-sm transition-all"
      style={{
        background: d.selected ? d.color : "var(--node-bg)",
        color: d.selected ? "#fff" : "var(--node-fg)",
        borderColor: d.color,
        borderWidth: d.selected ? 2 : 1.5,
        opacity: d.dimmed ? 0.25 : 1,
        boxShadow: d.selected ? `0 0 0 4px ${d.color}33` : undefined,
      }}
      title={`${d.label} · ${d.bodyPartName}`}
    >
      {/* 엣지 연결점 — 사방 핸들을 숨겨서 알약 어디에나 선이 붙도록 */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <span className="whitespace-nowrap">{d.label}</span>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

export default DiseaseNode;
