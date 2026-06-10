"use client";
// 관리자 폼 공용 프리미티브 — 잉크 도판 톤에 맞춘 입력/버튼/알림.
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/actions";

export const fieldCls =
  "w-full rounded-md border border-[var(--line)] bg-[var(--ink-850)] px-3 py-2 text-[14px] text-[var(--paper)] outline-none transition-colors focus:border-[var(--bone)] placeholder:text-[var(--muted)]";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]"
      style={{ fontFamily: "var(--f-plex-mono)" }}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {children}
    </label>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[var(--bone)] text-[var(--ink-900)] hover:bg-[var(--bone-bright)]"
      : "border border-[var(--line)] text-[var(--paper-dim)] hover:bg-[var(--ink-700)] hover:text-[var(--paper)]";
  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {pending ? "처리 중…" : children}
    </button>
  );
}

export function Notice({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  const bad = !state.ok;
  const text = state.error ?? state.message;
  if (!text) return null;
  return (
    <p
      className="rounded-md border px-3 py-2 text-[12.5px]"
      style={{
        fontFamily: "var(--f-plex-kr)",
        borderColor: bad ? "#e0607a55" : "#5bb7ad55",
        background: bad ? "#e0607a14" : "#5bb7ad14",
        color: bad ? "#f0a8b6" : "#8fd0c7",
      }}
    >
      {text}
    </p>
  );
}

/** 작은 위험 버튼 — 삭제 폼 제출용 (확인 onSubmit) */
export function DeleteButton({ confirmLabel }: { confirmLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`'${confirmLabel}' 을(를) 삭제할까요?`)) e.preventDefault();
      }}
      className="rounded px-2 py-1 text-[12px] text-[var(--muted)] transition-colors hover:bg-[#e0607a1f] hover:text-[#f0a8b6] disabled:opacity-50"
    >
      삭제
    </button>
  );
}
