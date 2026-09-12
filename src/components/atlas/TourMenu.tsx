"use client";
import { useEffect, useRef, useState } from "react";
import type { ResolvedTour } from "@/lib/tour-session";
import { progressSession, type ProgressMap } from "@/lib/tour-progress";

type Props = {
  tours: ResolvedTour[];
  onStart: (slug: string, resume?: boolean) => void;
  progress: ProgressMap;
  onClear: () => boolean;
  storageFailed: boolean;
};
export default function TourMenu({
  tours,
  onStart,
  progress,
  onClear,
  storageFailed,
}: Props) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("atlas-tour-trigger")?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const launch = (slug: string, resume = false) => {
    setOpen(false);
    onStart(slug, resume);
  };
  const count = Object.keys(progress).length;
  return (
    <div ref={container} className="absolute left-3 top-3 z-10">
      <button
        id="atlas-tour-trigger"
        aria-label="투어"
        aria-expanded={open}
        aria-controls="atlas-tour-list"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-800)]/95 px-4 text-[13px] text-[var(--paper-dim)] shadow-lg"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m15 9-2 4-4 2 2-4Z" />
        </svg>
        투어
        {count > 0 && (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--bone)]"
          />
        )}
      </button>
      {open && (
        <div
          id="atlas-tour-list"
          className="mt-2 w-[min(360px,92vw)] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--ink-800)] shadow-2xl"
        >
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="atlas-eyebrow">안내 여정</p>
            <p className="mt-1 text-sm text-[var(--paper)]">
              질병의 연결을 따라가 보세요.
            </p>
          </div>
          <ul className="max-h-[55dvh] overflow-y-auto divide-y divide-[var(--line)]">
            {tours.map((t) => {
              const entry = progress[t.slug];
              const session = progressSession(t, entry);
              return (
                <li key={t.slug} className="px-4 py-4">
                  {entry ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display-ko text-base font-bold">
                          {t.title}
                        </h3>
                        <span className="text-xs text-[var(--bone-bright)]">
                          {entry.completed
                            ? "완료"
                            : `${session.step + 1} / ${t.steps.length}단계`}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                        {entry.completed
                          ? "완료한 여정을 다시 살펴보세요."
                          : `최근 살펴본 질병 · ${t.steps[session.step].node.name}`}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="atlas-button atlas-button--primary flex-1"
                          aria-label={`${t.title} ${entry.completed ? "완료 요약" : "이어보기"}`}
                          onClick={() => launch(t.slug, true)}
                        >
                          {entry.completed ? "완료 요약" : "이어보기"}
                        </button>
                        <button
                          className="atlas-button"
                          aria-label={`${t.title} 처음부터`}
                          onClick={() => launch(t.slug)}
                        >
                          처음부터
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className="block w-full rounded-lg text-left"
                      onClick={() => launch(t.slug)}
                    >
                      <span className="block font-display-ko text-base font-bold">
                        {t.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                        {t.audience && <span className="mb-1 block text-[var(--bone)]">{t.audience}</span>}
                        {t.description}
                      </span>
                      <span className="mt-3 block text-xs text-[var(--bone-bright)]">
                        {t.steps.length}단계 · 여정 시작 →
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--line)] px-4 py-3">
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              {storageFailed
                ? "이 브라우저에서 기록을 저장하거나 지우지 못했어요."
                : "학습 기록은 이 브라우저에만 저장됩니다."}
            </p>
            {count > 0 && (
              <button
                className="mt-2 min-h-11 text-xs text-[var(--paper-dim)] underline underline-offset-4"
                onClick={onClear}
              >
                학습 기록 지우기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
