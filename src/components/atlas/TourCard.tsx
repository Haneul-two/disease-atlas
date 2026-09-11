"use client";
import { useEffect, useRef, type RefObject } from "react";
import { isTypingTarget } from "@/lib/keyboard";
import type { ResolvedTour } from "@/lib/tour-session";
import ShareLink from "./ShareLink";
import AtlasSheet from "./AtlasSheet";

type Props = {
  tour: ResolvedTour;
  stepIndex: number;
  completed: boolean;
  storageFailed: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onStep: (index: number) => void;
  onComplete: () => void;
  onExit: () => void;
  onRestart: () => void;
  onStartNext: () => void;
  nextTourTitle?: string;
};

export default function TourCard({
  tour,
  stepIndex,
  completed,
  storageFailed,
  panelRef,
  onStep,
  onComplete,
  onExit,
  onRestart,
  onStartNext,
  nextTourTitle,
}: Props) {
  const step = tour.steps[stepIndex];
  const isLast = stepIndex === tour.steps.length - 1;
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const content = panelRef.current?.querySelector(".atlas-sheet-content");
    if (content) content.scrollTop = 0;
  }, [stepIndex, completed, tour.slug, panelRef]);
  // Focus a stable heading on entry/completion; ordinary steps retain button focus.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [completed, tour.slug]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || e.altKey || e.ctrlKey || e.metaKey)
        return;
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
      if (
        completed ||
        (e.target instanceof HTMLElement && e.target.closest("nav"))
      )
        return;
      if (e.key === "ArrowRight" && !isLast) {
        e.preventDefault();
        onStep(stepIndex + 1);
      }
      if (e.key === "ArrowLeft" && stepIndex > 0) {
        e.preventDefault();
        onStep(stepIndex - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completed, isLast, stepIndex, onStep, onExit]);

  return (
    <AtlasSheet
      key={`${tour.slug}:${completed}`}
      panelRef={panelRef}
      title={tour.title}
      eyebrow={
        completed
          ? "여정 완료"
          : `안내 여정 · ${stepIndex + 1} / ${tour.steps.length}`
      }
      onClose={onExit}
      closeLabel="투어 종료"
      footer={
        completed ? (
          <div className="flex gap-2">
            <button className="atlas-button" onClick={onRestart}>
              다시 둘러보기
            </button>
            <button
              className="atlas-button atlas-button--primary flex-1"
              onClick={onExit}
            >
              지도로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              className="atlas-button"
              onClick={() => onStep(stepIndex - 1)}
              disabled={stepIndex === 0}
            >
              이전
            </button>
            <button
              className="atlas-button atlas-button--primary flex-1"
              onClick={isLast ? onComplete : () => onStep(stepIndex + 1)}
            >
              {isLast ? "투어 마치기" : "다음 단계"}
              <span aria-hidden="true"> →</span>
            </button>
          </div>
        )
      }
    >
      {completed ? (
        <div className="space-y-5">
          <div>
            <p className="atlas-eyebrow text-[var(--bone)]">
              하나의 여정을 완주했어요
            </p>
            <h3
              ref={titleRef}
              tabIndex={-1}
              className="mt-2 font-display-ko text-2xl leading-snug outline-none"
            >
              질병 사이의 연결을
              <br />
              다시 떠올려 보세요.
            </h3>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--paper-dim)]">
            {tour.summary.map((text, i) => (
              <li key={text} className="flex gap-3">
                <span className="font-mono text-[var(--bone)]">0{i + 1}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="atlas-eyebrow mb-2">이번 여정의 질병 · 눌러서 복습</p>
            <div className="flex flex-wrap gap-2">
              {tour.steps.map((s, i) => (
                <button
                  key={s.diseaseSlug}
                  className="atlas-button text-xs"
                  onClick={() => onStep(i)}
                >
                  {s.node.name}
                </button>
              ))}
            </div>
          </div>
          {nextTourTitle && (
            <button className="atlas-next-tour" onClick={onStartNext}>
              <span className="atlas-eyebrow">다음 여정</span>
              <span className="mt-1 block font-display-ko text-lg">
                {nextTourTitle} <span aria-hidden="true">↗</span>
              </span>
            </button>
          )}
        </div>
      ) : (
        <>
          <nav aria-label="투어 단계" className="mb-5 flex gap-2">
            {tour.steps.map((s, i) => (
              <button
                key={s.diseaseSlug}
                className="atlas-step"
                aria-label={`${i + 1}단계 ${s.node.name}`}
                aria-current={i === stepIndex ? "step" : undefined}
                onClick={() => onStep(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="sr-only">{s.node.name}</span>
              </button>
            ))}
          </nav>
          <div aria-live="polite" aria-atomic="true">
            <p className="atlas-eyebrow mb-2">
              {step.node.bodyPartName} · {stepIndex + 1}번째 만남
            </p>
            <h3
              ref={titleRef}
              tabIndex={-1}
              className="mb-3 flex items-center gap-2 font-display-ko text-2xl font-bold outline-none"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: step.node.color }}
              />
              {step.node.name}
            </h3>
            <p className="text-[15px] leading-[1.8] text-[var(--paper-dim)]">
              {step.narrative}
            </p>
          </div>
          {!isLast && (
            <div className="mt-5 border-t border-[var(--line)] pt-3">
              <span className="atlas-eyebrow">다음에 살펴볼 질병</span>
              <p className="mt-1 text-sm text-[var(--bone-bright)]">
                {tour.steps[stepIndex + 1].node.name}{" "}
                <span aria-hidden="true">→</span>
              </p>
            </div>
          )}
        </>
      )}
      <div className="mt-5">
        <ShareLink
          key={`${tour.slug}:${stepIndex}:${completed}`}
          route={{ kind: "tour", slug: tour.slug, step: stepIndex, completed }}
        />
        <p className="mb-4 text-xs text-[var(--muted)]" role="status">
          {storageFailed
            ? "이 브라우저에서 진행을 저장하지 못했어요. 링크를 복사해 두세요."
            : "진행 상황은 이 브라우저에 저장돼요."}
        </p>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
        점선은 학습 순서이며, 질병의 진행 경로를 뜻하지 않습니다.
      </p>
    </AtlasSheet>
  );
}
