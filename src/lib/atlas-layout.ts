// Disease Atlas — 해부학적 노드 배치 + 엣지 파생 (순수 함수)
// 결정적(deterministic)이므로 서버에서 한 번 계산해 클라이언트로 넘긴다.

import type { AtlasEdge, EdgeType } from "./atlas-types";
import { EDGE_PRIORITY } from "./atlas-types";

/** 부위(layoutZone)별 배치 구역 — 실루엣 위에 겹쳐 보이도록 신체 좌표를 따른다.
 *  중앙 세로축(x≈470): 머리→가슴→복부→다리(관절). 내분비만 목·샘처럼 우측으로 오프셋. */
type ZoneConfig = { cx: number; cy: number; cols: number; gapX: number; gapY: number };

const ZONE_LAYOUT: Record<string, ZoneConfig> = {
  head: { cx: 470, cy: 215, cols: 4, gapX: 132, gapY: 86 }, // 머리~목덜미 = 뇌·신경
  endocrine: { cx: 800, cy: 478, cols: 2, gapX: 120, gapY: 84 }, // 우측 오프셋(목·샘) = 내분비
  chest: { cx: 470, cy: 540, cols: 3, gapX: 132, gapY: 86 }, // 가슴
  abdomen: { cx: 470, cy: 790, cols: 3, gapX: 132, gapY: 86 }, // 복부
  limbs: { cx: 470, cy: 1040, cols: 4, gapX: 132, gapY: 86 }, // 다리·척추 = 관절
};

const FALLBACK_ZONE: ZoneConfig = { cx: 470, cy: 1240, cols: 4, gapX: 132, gapY: 86 };

/** 결정적 지터 — 같은 입력이면 항상 같은 오프셋 (서버/클라 일치) */
function jitter(seed: number): { jx: number; jy: number } {
  const a = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  const b = Math.sin(seed * 269.5 + 183.3) * 28001.8384;
  return {
    jx: (a - Math.floor(a) - 0.5) * 2, // -1 ~ 1
    jy: (b - Math.floor(b) - 0.5) * 2,
  };
}

/**
 * 한 부위(zone)에 속한 질병들을 그 구역 안에 배치한 좌표를 돌려준다.
 * 격자 기반 + 행 교차 오프셋 + 결정적 지터 → 표가 아니라 별자리처럼 흩어진다.
 * @param zone layoutZone 키
 * @param count 그 zone의 질병 수
 * @returns index → {x, y}
 */
export function zonePositions(zone: string, count: number): { x: number; y: number }[] {
  const cfg = ZONE_LAYOUT[zone] ?? FALLBACK_ZONE;
  const cols = Math.min(cfg.cols, count) || 1;
  const rows = Math.ceil(count / cols);
  const zoneSeed = zone.split("").reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const { jx, jy } = jitter(zoneSeed + i * 17);
    const rowShift = (row % 2 === 1 ? 0.5 : 0) * cfg.gapX * 0.6; // 벌집형 교차
    out.push({
      x: Math.round(cfg.cx + (col - (cols - 1) / 2) * cfg.gapX + rowShift + jx * 22),
      y: Math.round(cfg.cy + (row - (rows - 1) / 2) * cfg.gapY + jy * 16),
    });
  }
  return out;
}

/** 부위별 클러스터 라벨 위치(라벨은 격자 위쪽에 둔다) */
export function zoneLabelPosition(zone: string, count: number): { x: number; y: number } {
  const cfg = ZONE_LAYOUT[zone] ?? FALLBACK_ZONE;
  const cols = Math.min(cfg.cols, count) || 1;
  const rows = Math.ceil(count / cols);
  return {
    x: cfg.cx,
    y: Math.round(cfg.cy - ((rows - 1) / 2) * cfg.gapY - 62),
  };
}

/** 부위 클러스터의 중심 좌표 (실루엣 글로우 배치용) */
export function zoneCenter(zone: string): { x: number; y: number } {
  const cfg = ZONE_LAYOUT[zone] ?? FALLBACK_ZONE;
  return { x: cfg.cx, y: cfg.cy };
}

/** 부위 클러스터를 감싸는 타원 반경 (부위색 글로우 크기 계산용) */
export function zoneExtent(zone: string, count: number): { rx: number; ry: number } {
  const cfg = ZONE_LAYOUT[zone] ?? FALLBACK_ZONE;
  const cols = Math.min(cfg.cols, count) || 1;
  const rows = Math.ceil(count / cols);
  return {
    rx: Math.round(((cols - 1) * cfg.gapX) / 2 + cfg.gapX * 0.85),
    ry: Math.round(((rows - 1) * cfg.gapY) / 2 + cfg.gapY * 1.0),
  };
}

// ── 엣지 파생 ──────────────────────────────────────────────

type DiseaseForEdges = {
  id: string;
  bodyPartSlug: string;
  categoryName: string | null;
  symptoms: string[];
};

type ManualRelation = { fromId: string; toId: string; note?: string | null };

/** undirected 쌍 키 (정렬해 중복 방지) */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function higherPriority(a: EdgeType, b: EdgeType): EdgeType {
  return EDGE_PRIORITY.indexOf(a) <= EDGE_PRIORITY.indexOf(b) ? a : b;
}

/**
 * 4가지 기준으로 엣지를 만들고, 같은 쌍은 하나의 엣지로 합쳐(types 배열) 돌려준다.
 * - relation: 수동 합병/연관
 * - symptom: 공통 증상 1개 이상
 * - category: 같은 계통
 * - bodypart: 같은 부위
 */
export function deriveEdges(
  diseases: DiseaseForEdges[],
  relations: ManualRelation[]
): AtlasEdge[] {
  const merged = new Map<
    string,
    {
      source: string;
      target: string;
      types: Set<EdgeType>;
      note?: string | null;
      sharedSymptoms?: string[];
    }
  >();

  const add = (
    a: string,
    b: string,
    type: EdgeType,
    extra?: { note?: string | null; sharedSymptoms?: string[] }
  ) => {
    if (a === b) return;
    const key = pairKey(a, b);
    const existing = merged.get(key);
    if (existing) {
      existing.types.add(type);
      if (extra?.note) existing.note = extra.note;
      if (extra?.sharedSymptoms) existing.sharedSymptoms = extra.sharedSymptoms;
    } else {
      merged.set(key, {
        source: a < b ? a : b,
        target: a < b ? b : a,
        types: new Set([type]),
        note: extra?.note,
        sharedSymptoms: extra?.sharedSymptoms,
      });
    }
  };

  // 수동 관계
  for (const r of relations) add(r.fromId, r.toId, "relation", { note: r.note });

  // 쌍 비교 기반 (부위 / 계통 / 공통 증상)
  for (let i = 0; i < diseases.length; i++) {
    for (let j = i + 1; j < diseases.length; j++) {
      const a = diseases[i];
      const b = diseases[j];
      if (a.bodyPartSlug === b.bodyPartSlug) add(a.id, b.id, "bodypart");
      if (a.categoryName && a.categoryName === b.categoryName) add(a.id, b.id, "category");
      const shared = a.symptoms.filter((s) => b.symptoms.includes(s));
      if (shared.length > 0) add(a.id, b.id, "symptom", { sharedSymptoms: shared });
    }
  }

  const edges: AtlasEdge[] = [];
  for (const [key, m] of merged) {
    const types = [...m.types];
    const primary = types.reduce((acc, t) => higherPriority(acc, t));
    edges.push({
      id: `e-${key}`,
      source: m.source,
      target: m.target,
      types,
      primary,
      note: m.note ?? null,
      sharedSymptoms: m.sharedSymptoms,
    });
  }
  return edges;
}
