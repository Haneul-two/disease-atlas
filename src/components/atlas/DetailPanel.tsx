"use client";
// 우측 인스펙션 카드 — 표본 카탈로그 항목처럼 질병을 펼쳐 보인다.
import type { AtlasData, AtlasNode } from "@/lib/atlas-types";
import { RELATION_LABELS } from "@/lib/atlas-types";
import { groupRelated, relatedItemLabel } from "@/lib/related";
import Disclaimer from "./Disclaimer";

type Props = {
  node: AtlasNode | null;
  data: AtlasData;
  onClose: () => void;
  onSelectRelated: (nodeId: string) => void;
};

export default function DetailPanel({ node, data, onClose, onSelectRelated }: Props) {
  if (!node) return null;

  const groups = groupRelated(node, data);

  const c = node.color;

  return (
    <aside
      key={node.id}
      className="absolute right-0 top-0 z-20 flex h-full w-[min(390px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--ink-800)]/95 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ animation: "panel-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      {/* 부위색 상단 인레이 */}
      <span
        className="absolute left-0 top-0 h-full w-px"
        style={{ background: `linear-gradient(to bottom, ${c}, transparent 60%)` }}
      />

      {/* 헤더 */}
      <div className="relative px-5 pt-5 pb-4">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
        >
          ✕
        </button>

        {/* 에이브로우 — 표본 메타 */}
        <div
          className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--f-plex-mono)", color: "var(--muted)" }}
        >
          <span style={{ color: c }}>● {node.bodyPartName}</span>
          {node.categoryName && (
            <>
              <span className="text-[var(--line-strong)]">/</span>
              <span>{node.categoryName}</span>
            </>
          )}
        </div>

        <h2
          className="text-[27px] leading-tight text-[var(--paper)]"
          style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
        >
          {node.name}
        </h2>
        {node.medicalTerm && (
          <p
            className="mt-1.5 text-[12px] italic leading-snug text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            {node.medicalTerm}
          </p>
        )}
        <span className="mt-3 block h-px w-full bg-[var(--line)]" />
      </div>

      {/* 본문 */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-6">
        <Section index="01" title="설명 · Definition">
          <p className="text-[14px] leading-relaxed text-[var(--paper-dim)]">
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
          <p className="text-[14px] leading-relaxed text-[var(--paper-dim)]">
            {node.treatment}
          </p>
        </Section>

        {groups.length > 0 && (
          <Section index="04" title="관련 질환 · Related">
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.type}>
                  <p
                    className="mb-1 px-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"
                    style={{ fontFamily: "var(--f-plex-mono)" }}
                  >
                    {RELATION_LABELS[g.type]}
                  </p>
                  <ul className="-mx-2 space-y-0.5">
                    {g.items.map(({ node: r, note, direction }) => (
                      <li key={`${g.type}-${r.id}`}>
                        <button
                          onClick={() => onSelectRelated(r.id)}
                          aria-label={relatedItemLabel(node.name, { node: r, note, direction }, RELATION_LABELS[g.type])}
                          className="group flex w-full flex-col gap-1 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--ink-700)]"
                        >
                          <span className="flex w-full items-center gap-2.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ background: r.color, boxShadow: `0 0 6px ${r.color}aa` }}
                            />
                            {direction && (
                              <span aria-hidden="true" className="shrink-0 text-[11px] text-[var(--muted)]">
                                {direction === "out" ? "→" : "←"}
                              </span>
                            )}
                            <span className="text-[13.5px] font-medium text-[var(--paper)] group-hover:text-[var(--bone-bright)]">
                              {r.name}
                            </span>
                          </span>
                          {note && (
                            <span className="pl-[18px] text-[11px] leading-relaxed text-[var(--muted)]">
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

      {/* 고지 */}
      <div className="border-t border-[var(--line)] bg-[var(--ink-850)] px-5 py-3.5">
        <Disclaimer />
      </div>
    </aside>
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
        className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]"
        style={{ fontFamily: "var(--f-plex-mono)" }}
      >
        <span className="text-[var(--bone)]">{index}</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
        {title}
      </h3>
      {children}
    </section>
  );
}
