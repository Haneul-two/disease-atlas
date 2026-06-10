"use client";
// 우측 상세 패널 — 선택한 질병의 용어·증상·치료법·관련 질환.
import type { AtlasData, AtlasNode } from "@/lib/atlas-types";
import Disclaimer from "./Disclaimer";

type Props = {
  node: AtlasNode | null;
  data: AtlasData;
  onClose: () => void;
  onSelectRelated: (nodeId: string) => void;
};

export default function DetailPanel({ node, data, onClose, onSelectRelated }: Props) {
  if (!node) return null;

  // 관련 질환 = 수동 관계(relation) 엣지로 이 노드와 연결된 질병들
  const related = data.edges
    .filter((e) => e.types.includes("relation") && (e.source === node.id || e.target === node.id))
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const other = data.nodes.find((n) => n.id === otherId);
      return other ? { node: other, note: e.note } : null;
    })
    .filter((x): x is { node: AtlasNode; note: string | null | undefined } => x !== null);

  return (
    <aside className="absolute right-0 top-0 z-20 flex h-full w-[min(380px,90vw)] flex-col border-l border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 border-b border-black/5 p-4 dark:border-white/10">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ color: node.color, background: `${node.color}1a` }}
            >
              {node.bodyPartName}
            </span>
            {node.categoryName && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {node.categoryName}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      {/* 본문 */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <Section title="설명">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {node.description}
          </p>
        </Section>

        <Section title="주요 증상">
          <div className="flex flex-wrap gap-1.5">
            {node.symptoms.map((s) => (
              <span
                key={s}
                className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section title="치료법">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {node.treatment}
          </p>
        </Section>

        {related.length > 0 && (
          <Section title="관련 질환">
            <ul className="space-y-1.5">
              {related.map(({ node: r, note }) => (
                <li key={r.id}>
                  <button
                    onClick={() => onSelectRelated(r.id)}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: r.color }}
                    />
                    <span className="text-sm font-medium group-hover:underline">{r.name}</span>
                    {note && (
                      <span className="truncate text-xs text-zinc-400">— {note}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* 고지 */}
      <div className="border-t border-black/5 bg-amber-50/60 p-3 dark:border-white/10 dark:bg-amber-950/20">
        <Disclaimer />
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
