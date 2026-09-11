"use client";
import type { CSSProperties } from "react";
import { ViewportPortal, useViewport, useStore } from "@xyflow/react";
import type { AtlasBodyPart, AtlasNode } from "@/lib/atlas-types";
import { zoneCenter, zoneExtent, zoneLabelPosition } from "@/lib/atlas-layout";

type Props = {
  bodyParts: AtlasBodyPart[];
  nodes: AtlasNode[];
  visibleZones: Set<string>;
  activeZone?: string | null;
  onFocusZone: (zone: string) => void;
  interactive: boolean;
};

// Schematic anatomy: disease clusters denote regions, not precise lesion locations.
const outline =
  "M246 240 C243 276 220 290 188 300 C146 309 115 350 100 403 L55 685 Q49 724 70 747 Q88 752 96 720 L149 488 L156 765 Q144 825 162 925 L179 1265 Q175 1295 151 1315 L217 1315 L255 995 Q267 955 280 932 Q293 955 305 995 L343 1315 L409 1315 Q385 1295 381 1265 L398 925 Q416 825 404 765 L411 488 L464 720 Q472 752 490 747 Q511 724 505 685 L460 403 C445 350 414 309 372 300 C340 290 317 276 314 240";

export default function Silhouette({
  bodyParts,
  nodes,
  visibleZones,
  activeZone,
  onFocusZone,
  interactive,
}: Props) {
  const { zoom } = useViewport();
  const narrow = useStore((state) => state.width < 640);
  const counts = new Map<string, number>();
  for (const n of nodes)
    counts.set(n.layoutZone, (counts.get(n.layoutZone) ?? 0) + 1);
  const parts = bodyParts.filter((b) => visibleZones.has(b.layoutZone));
  const color = (zone: string) =>
    bodyParts.find((b) => b.layoutZone === zone)?.color ?? "#cbb893";
  const organStyle = (zone: string): CSSProperties => ({
    color: color(zone),
    opacity: !visibleZones.has(zone)
      ? 0.08
      : activeZone && activeZone !== zone
        ? 0.22
        : activeZone === zone
          ? 0.9
          : 0.5,
  });
  return (
    <ViewportPortal>
      <div
        className="atlas-anatomy"
        data-active-zone={activeZone ?? "none"}
        style={{ left: 190, top: 40 }}
      >
        <svg
          width="560"
          height="1400"
          viewBox="0 0 560 1400"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="atlas-body-wash" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#cbb893" stopOpacity=".1" />
              <stop offset=".5" stopColor="#829db8" stopOpacity=".025" />
              <stop offset="1" stopColor="#cbb893" stopOpacity=".065" />
            </linearGradient>
          </defs>
          <g
            className="atlas-plate-guides"
            stroke="var(--bone)"
            opacity=".16"
            strokeWidth="1"
          >
            <path d="M280 15V1370" strokeDasharray="2 12" />
            <path d="M80 50H30V100 M480 50H530V100 M80 1350H30V1300 M480 1350H530V1300" />
            {[180, 525, 870, 1215].map((y) => (
              <g key={y}>
                <path d={`M10 ${y}H40 M520 ${y}H550`} />
                <path d={`M65 ${y}H495`} strokeDasharray="1 14" opacity=".6" />
              </g>
            ))}
          </g>
          <g
            className="atlas-body-outline"
            stroke="var(--bone)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="url(#atlas-body-wash)"
          >
            <path d="M280 45 C213 45 188 83 193 146 L200 193 Q220 240 246 249 L314 249 Q340 240 360 193 L367 146 C372 83 347 45 280 45Z" />
            <path d={outline} />
          </g>
          <g
            stroke="var(--bone)"
            strokeWidth="1.3"
            opacity=".24"
            strokeLinecap="round"
          >
            <path d="M185 320Q232 311 280 341Q328 311 375 320 M280 341V690 M170 781Q220 821 251 859 M390 781Q340 821 309 859 M251 859Q280 895 309 859" />
            {[365, 405, 445, 485, 525].map((y, i) => (
              <path
                key={y}
                d={`M270 ${y}Q${180 - i * 2} ${y - 25} ${169 + i * 3} ${y + 22} M290 ${y}Q${380 + i * 2} ${y - 25} ${391 - i * 3} ${y + 22}`}
              />
            ))}
            <path d="M233 945L215 1180 M327 945L345 1180 M210 1225L204 1290 M350 1225L356 1290" />
            <ellipse cx="218" cy="1200" rx="17" ry="23" />
            <ellipse cx="342" cy="1200" rx="17" ry="23" />
          </g>
          <g
            className="atlas-organ"
            data-organ="brain"
            style={organStyle("head")}
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity=".09"
          >
            <path d="M275 84C254 63 227 80 226 101C201 109 210 137 217 144C204 166 225 188 245 186C252 205 274 194 280 183C286 194 308 205 315 186C335 188 356 166 343 144C350 137 359 109 334 101C333 80 306 63 285 84Z" />
            <path
              d="M280 86V180 M245 96Q268 108 246 126T250 169 M315 96Q292 108 314 126T310 169 M220 141Q239 135 245 148 M340 141Q321 135 315 148"
              fill="none"
            />
          </g>
          <g
            className="atlas-organ"
            data-organ="lungs-heart"
            style={organStyle("chest")}
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity=".065"
          >
            <path d="M259 358C245 333 222 351 204 391C187 431 175 499 188 541Q220 560 253 529Z M301 358C315 333 338 351 356 391C373 431 385 499 372 541Q340 560 309 529Z" />
            <path
              d="M280 301V387M280 387L232 435M280 387L327 435M232 435L215 484M327 435L345 484"
              fill="none"
            />
            <path
              d="M284 453C258 428 242 456 252 484C263 515 293 543 300 545C321 519 330 482 313 464C305 454 294 451 284 453Z"
              fillOpacity=".22"
            />
          </g>
          <g
            className="atlas-organ"
            data-organ="abdomen"
            style={organStyle("abdomen")}
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity=".07"
          >
            <path d="M190 606Q232 576 285 604L309 624Q262 673 195 644Z" />
            <path d="M313 613C307 642 340 635 348 664C353 693 324 708 296 684Q280 668 292 650" />
            <path d="M205 709Q190 729 205 754L205 823Q212 846 237 835L333 835Q359 837 357 812L357 736Q360 707 335 708Z" />
            <path
              d="M225 735Q280 717 338 740L233 760Q220 778 337 783L234 805"
              fill="none"
            />
          </g>
          <g
            className="atlas-organ"
            data-organ="joints"
            style={organStyle("limbs")}
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="218" cy="1200" r="26" />
            <circle cx="342" cy="1200" r="26" />
            <circle cx="195" cy="885" r="17" />
            <circle cx="365" cy="885" r="17" />
            <path d="M275 920V1120 M285 920V1120" strokeDasharray="3 9" />
          </g>
        </svg>
      </div>
      {parts.map((bp, i) => {
        const center = zoneCenter(bp.layoutZone),
          extent = zoneExtent(bp.layoutZone, counts.get(bp.layoutZone) ?? 1);
        const active = activeZone === bp.layoutZone;
        const pos = zoneLabelPosition(
          bp.layoutZone,
          counts.get(bp.layoutZone) ?? 1,
        );
        return (
          <div key={bp.slug}>
            <div
              className="atlas-region-halo"
              style={{
                left: center.x,
                top: center.y,
                width: extent.rx * 2.3,
                height: extent.ry * 2.3,
                background: `radial-gradient(ellipse, ${bp.color}${active ? "30" : "10"}, transparent 68%)`,
                opacity: activeZone && !active ? 0.24 : 1,
              }}
            />
            {bp.layoutZone === "endocrine" && (
              <div
                className="atlas-system-frame"
                style={{
                  left: center.x - extent.rx,
                  top: center.y - extent.ry,
                  width: extent.rx * 2,
                  height: extent.ry * 2,
                  borderColor: `${bp.color}50`,
                }}
              />
            )}
            <div
              className="atlas-region-caption"
              style={
                {
                  left: bp.layoutZone === "endocrine" || narrow ? pos.x : 145,
                  top:
                    bp.layoutZone === "endocrine" || narrow
                      ? pos.y - 10
                      : center.y,
                  transform: `translate(-50%, -50%) scale(${Math.min(2.4, 1 / zoom)})`,
                  "--region-color": bp.color,
                } as CSSProperties
              }
            >
              <button
                type="button"
                className="atlas-region-button nodrag nopan"
                disabled={!interactive}
                onClick={() => onFocusZone(bp.layoutZone)}
                aria-label={`${bp.name} 부위 확대`}
              >
                <span className="font-mono text-[10px] opacity-65">
                  0{i + 1}
                </span>
                <span>{bp.name}</span>
                <span aria-hidden="true" className="text-xs opacity-60">
                  {interactive ? "↗" : ""}
                </span>
              </button>
              <span className="atlas-region-meta">
                {bp.layoutZone === "endocrine"
                  ? "여러 장기에 걸친 계통"
                  : `${counts.get(bp.layoutZone) ?? 0}개 질병`}
              </span>
            </div>
          </div>
        );
      })}
    </ViewportPortal>
  );
}
