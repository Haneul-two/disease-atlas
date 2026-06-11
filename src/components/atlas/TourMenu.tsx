"use client";
// 투어 메뉴 — 좌상단 "투어" 필 버튼 + 투어 목록 카드
import { useState } from "react";
import { TOURS } from "@/lib/tours";

type Props = {
  onStart: (tourSlug: string) => void;
};

export default function TourMenu({ onStart }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute left-3 top-3 z-10">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-800)]/85 px-4 py-1.5 text-[12.5px] text-[var(--muted)] shadow-lg backdrop-blur-md transition-colors hover:border-[var(--line-strong)] hover:text-[var(--paper-dim)]"
        style={{ fontFamily: "var(--f-plex-kr)" }}
      >
        <span className="text-[13px]">✦</span>
        투어
      </button>

      {open && (
        <div
          className="mt-2 w-[min(330px,86vw)] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--ink-800)]/97 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-md"
          style={{ animation: "panel-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <p
            className="border-b border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            Guided Tours · 안내 여정
          </p>
          <ul className="py-1.5">
            {TOURS.map((t) => (
              <li key={t.slug}>
                <button
                  onClick={() => {
                    setOpen(false);
                    onStart(t.slug);
                  }}
                  className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-[var(--ink-700)]"
                >
                  <span
                    className="block text-[14px] font-medium text-[var(--paper)]"
                    style={{ fontFamily: "var(--f-gowun)" }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="mt-0.5 block text-[11.5px] leading-snug text-[var(--muted)]"
                    style={{ fontFamily: "var(--f-plex-kr)" }}
                  >
                    {t.description} · {t.steps.length}스텝
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
