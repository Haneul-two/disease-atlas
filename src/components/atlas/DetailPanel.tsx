"use client";
// 우측 인스펙션 카드 — 표본 카탈로그 항목처럼 질병을 펼쳐 보인다.
import type { RefObject } from "react";
import ShareLink from "./ShareLink";
import AtlasSheet from "./AtlasSheet";
import type { AtlasData, AtlasNode, AtlasEdge } from "@/lib/atlas-types";
import { RELATION_LABELS } from "@/lib/atlas-types";
import { groupRelated, relatedItemLabel } from "@/lib/related";
import Disclaimer from "./Disclaimer";

type Props = {
  node: AtlasNode;
  visibleEdges: AtlasEdge[];
  onInspectRelation: (id: string) => void;
  panelRef: RefObject<HTMLElement | null>;
  data: AtlasData;
  onClose: () => void;
  onSelectRelated: (nodeId: string) => void;
};

export default function DetailPanel({
  node,
  visibleEdges,
  onInspectRelation,
  data,
  onClose,
  onSelectRelated,
  panelRef,
}: Props) {
  if (!node) return null;

  const groups = groupRelated(node, data);

  return (
    <AtlasSheet
      panelRef={panelRef}
      side="right"
      title={node.name}
      eyebrow={[node.bodyPartName, node.categoryName]
        .filter(Boolean)
        .join(" · ")}
      onClose={onClose}
      closeLabel="닫기"
      footer={<Disclaimer />}
    >
      <ShareLink route={{ kind: "disease", slug: node.slug }} />
      {node.medicalTerm && (
        <p className="mb-4 font-mono text-xs italic text-[var(--muted)]">
          {node.medicalTerm}
        </p>
      )}
      <div className="space-y-6">
        <Section index="01" title="설명 · Definition">
          <p className="atlas-body-copy text-[15px] leading-relaxed text-[var(--paper-dim)]">
            {node.description}
          </p>
        </Section>

        <Section index="02" title="주요 증상 · Symptoms">
          <div className="flex flex-wrap gap-1.5">
            {node.symptoms.map((s) => (
              <span
                key={s}
                className="rounded border border-[#5bb7ad55] bg-[#5bb7ad14] px-2 py-1 text-[12px] text-[#8fd0c7]"
                style={{ fontFamily: "var(--f-plex-kr)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section index="03" title="치료법 · Treatment">
          <p className="atlas-body-copy text-[15px] leading-relaxed text-[var(--paper-dim)]">
            {node.treatment}
          </p>
        </Section>

        <details className="atlas-connection-list">
          <summary>연결선 설명 보기</summary>
          <ul className="mt-3 space-y-2">
            {visibleEdges.filter(e => e.source === node.id || e.target === node.id).map(edge => {
              const other = data.nodes.find(n => n.id === (edge.source === node.id ? edge.target : edge.source));
              return other && <li key={edge.id}><button className="atlas-explore-item w-full" onClick={() => onInspectRelation(edge.id)}>{node.name} · {other.name} 연결 설명</button></li>;
            })}
          </ul>
        </details>
        {groups.length > 0 && (
          <Section index="04" title="관련 질환 · Related">
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.type}>
                  <p
                    className="mb-1 px-2 text-xs font-medium text-[var(--muted)]"
                  >
                    {RELATION_LABELS[g.type]}
                  </p>
                  <ul className="-mx-2 space-y-0.5">
                    {g.items.map(({ node: r, note, direction }) => (
                      <li key={`${g.type}-${r.id}`}>
                        <button
                          onClick={() => onSelectRelated(r.id)}
                          aria-label={relatedItemLabel(
                            node.name,
                            { node: r, note, direction },
                            RELATION_LABELS[g.type],
                          )}
                          className="group flex w-full flex-col gap-1 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--ink-700)]"
                        >
                          <span className="flex w-full items-center gap-2.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                background: r.color,
                                boxShadow: `0 0 6px ${r.color}aa`,
                              }}
                            />
                            {direction && (
                              <span
                                aria-hidden="true"
                                className="shrink-0 text-[11px] text-[var(--muted)]"
                              >
                                {direction === "out" ? "→" : "←"}
                              </span>
                            )}
                            <span className="text-[13.5px] font-medium text-[var(--paper)] group-hover:text-[var(--bone-bright)]">
                              {r.name}
                            </span>
                          </span>
                          {note && (
                            <span className="pl-[18px] text-xs leading-relaxed text-[var(--muted)]">
                              — {note}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AtlasSheet>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3
        className="mb-2.5 flex items-center gap-2 text-xs font-medium tracking-wide text-[var(--muted)]"
      >
        <span className="font-mono text-[var(--bone)]">{index}</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
        {title}
      </h3>
      {children}
    </section>
  );
}
