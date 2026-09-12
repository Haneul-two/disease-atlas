"use client";
import { ViewportPortal } from "@xyflow/react";
import { ANATOMY_LANDMARKS } from "@/lib/atlas-anatomy";

const TARGETS = [
  { key: "brain", rx: 70, ry: 64 }, { key: "lung", rx: 48, ry: 82 },
  { key: "heart", rx: 30, ry: 40 }, { key: "liver", rx: 60, ry: 25 },
  { key: "stomach", rx: 26, ry: 32 }, { key: "bowel", rx: 62, ry: 48 },
  { key: "kidney", rx: 24, ry: 40 }, { key: "knee", rx: 28, ry: 30 },
];
export default function OrganTargets({ onSelect, selected, enabled, visibleZones }: {
  onSelect: (key: string) => void; selected: string | null; enabled: boolean; visibleZones: Set<string>;
}) {
  if (!enabled) return null;
  return <ViewportPortal><svg className="atlas-organ-targets" width="1400" height="1500">
    {TARGETS.filter(t => visibleZones.has(ANATOMY_LANDMARKS[t.key].zone)).map(target => {
      const organ = ANATOMY_LANDMARKS[target.key];
      return <ellipse key={target.key} className="atlas-organ-target nodrag nopan" role="button" tabIndex={0}
        aria-label={`${organ.label} 관련 질병`} aria-pressed={selected === target.key}
        cx={organ.x} cy={organ.y} rx={target.rx} ry={target.ry}
        onClick={event => { event.stopPropagation(); onSelect(target.key); }}
        onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onSelect(target.key); } }}>
        <title>{organ.label} 관련 질병 보기</title>
      </ellipse>;
    })}
  </svg></ViewportPortal>;
}
