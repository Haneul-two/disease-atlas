// Disease Atlas — 해부학적 노드 배치 + 엣지 파생 (순수 함수)
// 결정적(deterministic)이므로 서버에서 한 번 계산해 클라이언트로 넘긴다.

import type { AtlasEdge, EdgeType } from "./atlas-types";
import { EDGE_PRIORITY } from "./atlas-types";

/** 부위(layoutZone)별 배치 구역 — 캔버스 ~1000×1200 기준, 신체 위치를 따른다 */
type ZoneConfig = { cx: number; cy: number; cols: number; gapX: number; gapY: number };

const ZONE_LAYOUT: Record<string, ZoneConfig> = {
  head: { cx: 500, cy: 140, cols: 3, gapX: 150, gapY: 95 }, // 위 = 뇌·신경
  chest: { cx: 500, cy: 470, cols: 3, gapX: 150, gapY: 95 }, // 가운데 = 가슴
  abdomen: { cx: 500, cy: 800, cols: 3, gapX: 150, gapY: 95 }, // 아래 = 복부
  limbs: { cx: 120, cy: 600, cols: 1, gapX: 150, gapY: 95 }, // 왼쪽 = 관절
  endocrine: { cx: 890, cy: 600, cols: 1, gapX: 150, gapY: 95 }, // 오른쪽(별도) = 내분비
};

const FALLBACK_ZONE: ZoneConfig = { cx: 500, cy: 1050, cols: 4, gapX: 150, gapY: 95 };

/**
 * 한 부위(zone)에 속한 질병들을 그 구역 안에 격자로 배치한 좌표를 돌려준다.
 * @param zone layoutZone 키
 * @param count 그 zone의 질병 수
 * @returns index → {x, y}
 */
export function zonePositions(zone: string, count: number): { x: number; y: number }[] {
  const cfg = ZONE_LAYOUT[zone] ?? FALLBACK_ZONE;
  const cols = Math.min(cfg.cols, count) || 1;
  const rows = Math.ceil(count / cols);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push({
      x: Math.round(cfg.cx + (col - (cols - 1) / 2) * cfg.gapX),
      y: Math.round(cfg.cy + (row - (rows - 1) / 2) * cfg.gapY),
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
    y: Math.round(cfg.cy - ((rows - 1) / 2) * cfg.gapY - 70),
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
