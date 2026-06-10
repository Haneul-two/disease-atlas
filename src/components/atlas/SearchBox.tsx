"use client";
// 검색 팔레트 — `/`로 열어 질병을 퍼지 검색하고, 고르면 그래프가 해당 노드로 이동.
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import type { AtlasNode } from "@/lib/atlas-types";

type Props = {
  nodes: AtlasNode[];
  onSelect: (nodeId: string) => void;
};

/** 입력 포커스 중이면 `/` 단축키를 가로채지 않는다 */
function isTypingTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable;
}

export default function SearchBox({ nodes, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 인덱스 — 질병명·부위·계통·증상·설명을 가중치로 검색
  const fuse = useMemo(
    () =>
      new Fuse(nodes, {
        keys: [
          { name: "name", weight: 0.5 },
          { name: "bodyPartName", weight: 0.15 },
          { name: "categoryName", weight: 0.1 },
          { name: "symptoms", weight: 0.15 },
          { name: "description", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeMatches: true,
      }),
    [nodes]
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q, { limit: 8 });
  }, [fuse, query]);

  // 결과 개수가 바뀌어도 항상 유효 범위 안의 하이라이트를 쓰도록 렌더 시 보정.
  const activeIndex = results.length ? Math.min(active, results.length - 1) : 0;

  function openSearch() {
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  function closeSearch() {
    setOpen(false);
    setQuery("");
  }

  // 전역 `/` 단축키로 열기
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !open && !isTypingTarget(e.target)) {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 열릴 때 입력에 포커스 (DOM 동기화 — 상태 변경 아님)
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  function choose(nodeId: string) {
    onSelect(nodeId);
    closeSearch();
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closeSearch();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) choose(hit.item.id);
    }
  }

  if (!open) {
    return (
      <button
        onClick={openSearch}
        className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-800)]/85 px-4 py-1.5 text-[12.5px] text-[var(--muted)] shadow-lg backdrop-blur-md transition-colors hover:border-[var(--line-strong)] hover:text-[var(--paper-dim)]"
        style={{ fontFamily: "var(--f-plex-kr)" }}
      >
        <span className="text-[13px]">⌕</span>
        질병 검색
        <kbd
          className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          /
        </kbd>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-40">
      {/* 백드롭 — 클릭 시 닫기 */}
      <div
        className="absolute inset-0 bg-[var(--ink-900)]/40 backdrop-blur-[1px]"
        onClick={closeSearch}
      />

      <div
        className="absolute left-1/2 top-[8vh] w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--ink-800)]/97 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-md"
        style={{ animation: "panel-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        {/* 입력 */}
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <span className="text-[16px] text-[var(--muted)]">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="질병·증상·부위로 검색…"
            className="flex-1 bg-transparent text-[15px] text-[var(--paper)] outline-none placeholder:text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-kr)" }}
          />
          <kbd
            className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            esc
          </kbd>
        </div>

        {/* 결과 */}
        <ul className="max-h-[52vh] overflow-y-auto py-1.5">
          {query.trim() && results.length === 0 && (
            <li
              className="px-4 py-6 text-center text-[13px] text-[var(--muted)]"
              style={{ fontFamily: "var(--f-plex-kr)" }}
            >
              일치하는 질병이 없습니다
            </li>
          )}
          {results.map((r, i) => {
            const n = r.item;
            const on = i === activeIndex;
            return (
              <li key={n.id}>
                <button
                  onClick={() => choose(n.id)}
                  onMouseMove={() => setActive(i)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{ background: on ? "var(--ink-700)" : "transparent" }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: n.color, boxShadow: `0 0 7px ${n.color}aa` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[14px] font-medium text-[var(--paper)]"
                      style={{ fontFamily: "var(--f-plex-kr)" }}
                    >
                      {n.name}
                    </span>
                    <span
                      className="block truncate text-[11.5px] text-[var(--muted)]"
                      style={{ fontFamily: "var(--f-plex-kr)" }}
                    >
                      {n.bodyPartName}
                      {n.categoryName ? ` · ${n.categoryName}` : ""}
                      {n.symptoms.length ? ` · ${n.symptoms.slice(0, 3).join(", ")}` : ""}
                    </span>
                  </span>
                  {on && (
                    <span className="shrink-0 text-[var(--muted)]">↵</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 풋터 힌트 */}
        <div
          className="flex items-center gap-3 border-t border-[var(--line)] px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          <span>↑↓ 이동</span>
          <span>↵ 선택</span>
          <span>esc 닫기</span>
        </div>
      </div>
    </div>
  );
}
