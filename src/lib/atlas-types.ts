// Disease Atlas — Atlas 그래프 공용 타입
// 서버에서 계산해 클라이언트(React Flow)로 넘기는 데이터 형태를 정의한다.

/** 엣지(연결선) 종류 — 설계의 4가지 관계 기준 */
export type EdgeType = "relation" | "symptom" | "category" | "bodypart";

/** 부위(클러스터) 메타 — 필터칩·색·실루엣 라벨에 사용 */
export type AtlasBodyPart = {
  slug: string;
  name: string;
  color: string;
  layoutZone: string;
};

/** 그래프 노드 1개 = 질병 1개 (상세 패널에 필요한 정보까지 포함) */
export type AtlasNode = {
  id: string;
  slug: string;
  name: string;
  medicalTerm: string | null;
  description: string;
  treatment: string;
  bodyPartSlug: string;
  bodyPartName: string;
  color: string;
  layoutZone: string;
  categoryName: string | null;
  symptoms: string[];
  position: { x: number; y: number };
};

/** 그래프 엣지 1개 — 같은 쌍의 여러 관계 기준을 types 배열로 합쳐 보관 */
export type AtlasEdge = {
  id: string;
  source: string;
  target: string;
  types: EdgeType[];
  /** 색·우선순위를 정하는 대표 타입 (relation > symptom > category > bodypart) */
  primary: EdgeType;
  /** 수동 관계(relation)일 때의 설명 */
  note?: string | null;
  /** 공통 증상 엣지일 때 공유하는 증상 이름들 */
  sharedSymptoms?: string[];
};

export type AtlasData = {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  bodyParts: AtlasBodyPart[];
};

/** 엣지 타입별 표시 색상 (잉크 도판 톤) */
export const EDGE_COLORS: Record<EdgeType, string> = {
  relation: "#e0607a", // 합병/연관 (수동) — 로즈
  symptom: "#5bb7ad", // 공통 증상 — 틸
  category: "#9b8cd6", // 같은 계통 — 바이올렛
  bodypart: "#6b7280", // 같은 부위 — 슬레이트(흐릿)
};

/** 엣지 타입별 한국어 라벨 */
export const EDGE_LABELS: Record<EdgeType, string> = {
  relation: "합병·연관",
  symptom: "공통 증상",
  category: "같은 계통",
  bodypart: "같은 부위",
};

/** 색 우선순위 (낮을수록 우선) */
export const EDGE_PRIORITY: EdgeType[] = ["relation", "symptom", "category", "bodypart"];
