"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

// Non-modal: the map stays usable. Both sheet sizes have a button alternative.
export default function AtlasSheet({
  title,
  eyebrow,
  children,
  footer,
  onClose,
  closeLabel,
  panelRef,
  side = "left",
  defaultExpanded = true,
  compactLabel,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeLabel: string;
  panelRef: RefObject<HTMLElement | null>;
  side?: "left" | "right";
  defaultExpanded?: boolean;
  compactLabel?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (side === "right") headingRef.current?.focus({ preventScroll: true });
  }, [side]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (side === "right" && event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, side]);
  return (
    <aside
      ref={panelRef}
      aria-labelledby={`${id}-title`}
      className={`atlas-sheet atlas-sheet--${side}`}
      data-expanded={expanded}
    >
      <header className="atlas-sheet-header">
        <div className="min-w-0 flex-1">
          <p className="atlas-eyebrow">{eyebrow}</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            id={`${id}-title`}
            className="mt-1 font-display-ko text-xl font-bold leading-snug"
          >
            {title}
          </h2>
          {compactLabel && <p className="atlas-sheet-current">{compactLabel}</p>}
        </div>
        <button
          type="button"
          className="atlas-icon-button sm:hidden"
          aria-expanded={expanded}
          aria-controls={`${id}-content`}
          aria-label={expanded ? "해설 접기" : "해설 펼치기"}
          onClick={() => setExpanded((v) => !v)}
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d={expanded ? "m6 9 6 6 6-6" : "m6 15 6-6 6 6"} />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="atlas-icon-button"
          aria-label={closeLabel}
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </header>
      <div id={`${id}-content`} className="atlas-sheet-content">
        {children}
      </div>
      {footer && <footer className="atlas-sheet-footer">{footer}</footer>}
    </aside>
  );
}
