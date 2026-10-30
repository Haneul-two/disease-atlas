"use client";
import { useState } from "react";
import { atlasSearch, type AtlasRoute } from "@/lib/atlas-navigation";

export default function ShareLink({ route }: { route: AtlasRoute }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [url, setUrl] = useState("");
  async function copy() {
    // Share only the selection, not unrelated query parameters or browser history.
    const link =
      window.location.origin + window.location.pathname + atlasSearch(route);
    setUrl(link);
    try {
      await navigator.clipboard.writeText(link);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }
  return (
    <div className="mb-4 rounded-xl border border-[var(--line)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--paper-dim)]">
          이 화면을 다시 찾고 싶다면
        </span>
        <button type="button" className="atlas-button shrink-0" onClick={copy}>
          링크 복사
        </button>
      </div>
      <p
        role="status"
        className="text-xs leading-relaxed text-[var(--bone-bright)]"
      >
        {status === "copied"
          ? "링크를 복사했어요."
          : status === "manual"
            ? "아래 주소를 선택해 복사해 주세요."
            : ""}
      </p>
      {status === "manual" && (
        <input
          aria-label="공유 링크"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 w-full rounded border border-[var(--line-strong)] bg-[var(--ink-900)] p-2 text-xs"
        />
      )}
    </div>
  );
}
