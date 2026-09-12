"use client";
import type { RefObject } from "react";
import AtlasSheet from "./AtlasSheet";
import type { AtlasData, AtlasEdge, AtlasNode } from "@/lib/atlas-types";
import { DIRECTED_RELATIONS, EDGE_LABELS, RELATION_LABELS } from "@/lib/atlas-types";
import { ANATOMY_LANDMARKS, diseaseLandmarkKey } from "@/lib/atlas-anatomy";

export type Exploration = { kind: "organs" } | { kind: "organ"; key: string } | { kind: "edge"; id: string };

export function edgeTitle(edge: AtlasEdge, nodes: AtlasNode[]) {
  const pair = [edge.relationFrom ?? edge.source, edge.relationTo ?? edge.target].map(id => nodes.find(n => n.id === id));
  if (!edge.relationFrom) pair.sort((a,b) => (a?.name ?? "").localeCompare(b?.name ?? "", "ko"));
  const [from, to] = pair;
  return `${from?.name ?? "질병"} ${edge.relationFrom ? "→" : "↔"} ${to?.name ?? "질병"}`;
}

export default function ExplorationPanel({ exploration, data, panelRef, onClose, onOrgan, onIndex, onDisease }: {
  exploration: Exploration;
  data: AtlasData;
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onOrgan: (key: string) => void;
  onIndex: () => void;
  onDisease: (id: string) => void;
}) {
  const organ = exploration.kind === "organ" ? ANATOMY_LANDMARKS[exploration.key] : null;
  const members = exploration.kind === "organ" ? data.nodes.filter(n => diseaseLandmarkKey(n.slug) === exploration.key) : [];
  const edge = exploration.kind === "edge" ? data.edges.find(e => e.id === exploration.id) : null;
  const endpoints = edge ? [edge.relationFrom ?? edge.source, edge.relationTo ?? edge.target].map(id => data.nodes.find(n => n.id === id)!).filter(Boolean) : [];
  return (
    <AtlasSheet key={exploration.kind === "organ" ? exploration.key : edge?.id ?? "organs"}
      panelRef={panelRef} side="right" title={organ?.label ?? (edge ? edgeTitle(edge, data.nodes) : "장기 탐색")}
      eyebrow={edge ? "연결 설명" : "장기에서 질병으로"} onClose={onClose} closeLabel="탐색 닫기">
      {exploration.kind === "organs" && <>
        <p className="atlas-explore-copy">신체의 장기를 직접 누르거나 아래 목록에서 선택하세요.</p>
        <div className="atlas-organ-grid">
          {Object.entries(ANATOMY_LANDMARKS).map(([key, landmark]) => {
            const count = data.nodes.filter(n => diseaseLandmarkKey(n.slug) === key).length;
            return count > 0 && <button key={key} className="atlas-explore-item" onClick={() => onOrgan(key)}>
              <span>{landmark.label}</span><small>{count}개 질병</small>
            </button>;
          })}
        </div>
      </>}
      {organ && <>
        <button className="atlas-button mb-4" onClick={onIndex}>모든 장기 보기</button>
        <p className="atlas-explore-copy">{members.length}개 질병을 지도에서 강조했어요. 질병을 선택해 자세히 살펴보세요.</p>
        <ul className="space-y-2" aria-label={`${organ.label} 질병 목록`}>
          {members.map(node => <li key={node.id}><button className="atlas-explore-item w-full" onClick={() => onDisease(node.id)}>
            <span>{node.name}</span><small>{node.medicalTerm ?? node.bodyPartName}</small>
          </button></li>)}
        </ul>
        <p className="atlas-explore-copy mt-5">관련 장기 중심으로 묶은 탐색 목록입니다. 여러 장기에 영향을 주는 질병도 포함될 수 있어요.</p>
      </>}
      {edge && <>
        <p className="atlas-explore-copy">두 질병을 잇는 이유를 확인하고, 각 질병의 설명으로 이동할 수 있어요.</p>
        <div className="space-y-4" data-testid="edge-reasons">
          {(edge.relationDetails?.length ? edge.relationDetails : edge.types.includes("relation") ? [{ type: edge.relationType ?? "comorbidity", fromId: edge.relationFrom ?? edge.source, toId: edge.relationTo ?? edge.target, note: edge.note }] : []).map((relation, index) => {
            const from = data.nodes.find(n => n.id === relation.fromId)?.name;
            const to = data.nodes.find(n => n.id === relation.toId)?.name;
            return <section key={index} className="atlas-edge-reason">
              <h3>{RELATION_LABELS[relation.type]}</h3>
              <p className="my-2 text-sm">{from} {DIRECTED_RELATIONS.includes(relation.type) ? "→" : "↔"} {to}</p>
              <p>{relation.note?.trim() || "이 연결의 상세 해설은 아직 등록되지 않았습니다."}</p>
            </section>;
          })}
          {edge.types.includes("symptom") && <section className="atlas-edge-reason"><h3>{EDGE_LABELS.symptom}</h3><p>{edge.sharedSymptoms?.join(" · ") || "등록된 증상을 공유합니다."}</p><small>증상이 같다고 같은 질병이거나 원인 관계인 것은 아니에요.</small></section>}
          {edge.types.includes("category") && <section className="atlas-edge-reason"><h3>{EDGE_LABELS.category}</h3><p>{endpoints[0]?.categoryName ?? "같은 계통으로 분류되어 있습니다."}</p></section>}
          {edge.types.includes("bodypart") && <section className="atlas-edge-reason"><h3>{EDGE_LABELS.bodypart}</h3><p>{endpoints[0]?.bodyPartName}</p></section>}
        </div>
        <p className="atlas-explore-copy mt-5">화살표는 등록된 관계의 방향입니다. 모든 사람이 이 순서로 질병을 겪는다는 의미는 아니에요.</p>
        <div className="space-y-2">{endpoints.map(node => <button key={node.id} className="atlas-explore-item w-full" onClick={() => onDisease(node.id)}><span>{node.name} 자세히 보기</span></button>)}</div>
      </>}
    </AtlasSheet>
  );
}
