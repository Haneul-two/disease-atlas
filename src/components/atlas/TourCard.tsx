"use client";
// 투어 해설 카드 — 좌하단(모바일: 하단 시트). 스텝 해설 + 이전/다음/종료.
import { useEffect } from "react";
import { isTypingTarget } from "@/lib/keyboard";

type Props = {
  tourTitle: string;
  stepIndex: number; // 0-base
  stepCount: number;
  diseaseName: string;
  color: string; // 부위색
  narrative: string;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
};

export default function TourCard({
  tourTitle,
  stepIndex,
  stepCount,
  diseaseName,
  color,
  narrative,
  onPrev,
  onNext,
  onExit,
}: Props) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === stepCount - 1;

  // 키보드 내비게이션 — ←/→ 스텝, Esc 종료
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowRight" && !isLast) onNext();
      else if (e.key === "ArrowLeft" && !isFirst) onPrev();
      else if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFirst, isLast, onNext, onPrev, onExit]);

  return (
    <aside
      key={stepIndex}
      className="absolute bottom-0 left-0 z-20 w-full border-t border-[var(--line)] bg-[var(--ink-800)]/95 backdrop-blur-md sm:bottom-4 sm:left-4 sm:w-[380px] sm:rounded-xl sm:border sm:border-[var(--line-strong)] sm:shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      style={{ animation: "panel-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      {/* 헤더 — 투어 제목 + 진행 + 종료 */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
        <span
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          Tour · {tourTitle}
        </span>
        <span
          className="ml-auto text-[11px] text-[var(--muted)]"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          {stepIndex + 1} / {stepCount}
        </span>
        <button
          onClick={onExit}
          aria-label="투어 종료"
          className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
        >
          ✕
        </button>
      </div>

      {/* 본문 — 질병명 + 해설 */}
      <div className="px-4 pb-3 pt-3.5">
        <p className="mb-1.5 flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 7px ${color}aa` }}
          />
          <span
            className="text-[17px] leading-none text-[var(--paper)]"
            style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
          >
            {diseaseName}
          </span>
        </p>
        <p
          className="text-[13.5px] leading-relaxed text-[var(--paper-dim)]"
          style={{ fontFamily: "var(--f-plex-kr)" }}
        >
          {narrative}
        </p>
      </div>

      {/* 풋터 — 이전/다음 */}
      <div className="flex items-center gap-2 border-t border-[var(--line)] px-4 py-2.5">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[12.5px] text-[var(--paper-dim)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--paper)] disabled:cursor-default disabled:opacity-35"
        >
          ← 이전
        </button>
        <button
          onClick={isLast ? onExit : onNext}
          className="flex-1 rounded-md border border-[var(--line-strong)] bg-[var(--ink-700)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--ink-850)]"
        >
          {isLast ? "투어 마치기" : "다음 →"}
        </button>
        <span
          className="hidden text-[10px] text-[var(--muted)] sm:block"
          style={{ fontFamily: "var(--f-plex-mono)" }}
        >
          ←→ / esc
        </span>
      </div>
    </aside>
  );
}
