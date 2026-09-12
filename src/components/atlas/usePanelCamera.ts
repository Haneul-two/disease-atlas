"use client";
import { useEffect, type RefObject } from "react";
import { useNodesInitialized, useReactFlow } from "@xyflow/react";
import { diseaseLandmark } from "@/lib/atlas-anatomy";
import { viewportForArea } from "@/lib/atlas-camera";

export function usePanelCamera(
  canvas: RefObject<HTMLDivElement | null>,
  panel: RefObject<HTMLElement | null>,
  targetIds: string[],
  request: string,
  topInset = 0,
) {
  const { getNodes, setViewport } = useReactFlow();
  const ready = useNodesInitialized();
  const targetKey = targetIds.join("|");

  useEffect(() => {
    const host = canvas.current;
    if (!host || !ready || !targetKey) return;
    const ids = new Set(targetKey.split("|"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let first = true;
    const position = () => {
      const nodes = getNodes().filter((n) => ids.has(n.id));
      if (!nodes.length) return;
      const box = host.getBoundingClientRect();
      const overlay = panel.current?.getBoundingClientRect();
      const area = { x: 0, y: topInset, width: box.width, height: box.height - topInset };
      if (overlay) {
        if (window.matchMedia("(max-width: 639px)").matches) {
          area.height = Math.max(60, overlay.top - box.top - 12 - topInset);
        } else if (overlay.left - box.left < box.width / 2) {
          area.x = overlay.right - box.left + 16;
          area.width = Math.max(60, box.width - area.x);
        } else {
          area.width = Math.max(60, overlay.left - box.left - 16);
        }
      }
      const reference = nodes.length === 1 && typeof nodes[0].data.slug === "string"
        ? diseaseLandmark(nodes[0].data.slug) : undefined;
      const anchor = reference && !reference.systemic ? reference : undefined;
      const left = Math.min(...nodes.map((n) => n.position.x), ...(anchor ? [anchor.x - 28] : []));
      const top = Math.min(...nodes.map((n) => n.position.y), ...(anchor ? [anchor.y - 36] : []));
      const right = Math.max(
        ...nodes.map((n) => n.position.x + (n.measured?.width ?? 100)),
        ...(anchor ? [anchor.x + 120] : []),
      );
      const bottom = Math.max(
        ...nodes.map((n) => n.position.y + (n.measured?.height ?? 44)),
        ...(anchor ? [anchor.y + 28] : []),
      );
      void setViewport(
        viewportForArea(
          { x: left, y: top, width: right - left, height: bottom - top },
          area,
        ),
        {
          duration: first && !motion.matches ? 450 : 0,
        },
      );
      first = false;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(host);
    if (panel.current) observer.observe(panel.current);
    schedule();
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", schedule);
    };
  }, [canvas, panel, targetKey, request, ready, getNodes, setViewport, topInset]);
}
