"use client";
// Atlas 메인 캔버스 — React Flow로 질병 노드를 해부학적으로 배치하고,
// 부위/엣지 필터·선택 하이라이트·상세 패널을 연결한다.
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { AtlasData, EdgeType } from "@/lib/atlas-types";
import { EDGE_COLORS } from "@/lib/atlas-types";
import DiseaseNode from "./DiseaseNode";
import Silhouette from "./Silhouette";
import Starfield from "./Starfield";
import FilterBar from "./FilterBar";
import DetailPanel from "./DetailPanel";
import SearchBox from "./SearchBox";
import { TOURS } from "@/lib/tours";
import TourMenu from "./TourMenu";
import TourCard from "./TourCard";

const nodeTypes = { disease: DiseaseNode };

function AtlasInner({ data }: { data: AtlasData }) {
  const allZones = useMemo(
    () => new Set(data.bodyParts.map((b) => b.layoutZone)),
    [data.bodyParts]
  );
  const [visibleZones, setVisibleZones] = useState<Set<string>>(allZones);
  // 초기에는 핵심 관계(합병·연관)만 — 선이 너무 많으면 별자리가 아니라 실타래가 된다.
  const [enabledEdges, setEnabledEdges] = useState<Set<EdgeType>>(
    new Set<EdgeType>(["relation"])
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { setCenter } = useReactFlow();

  // 호버가 선택보다 우선 — 강조 대상 id
  const activeId = hoveredId ?? selectedId;

  // 노드별 연결 수(의미 있는 relation·symptom 기준) → 크기 가중치(0~1)
  const weightById = useMemo(() => {
    const deg = new Map<string, number>();
    for (const e of data.edges) {
      if (!e.types.some((t) => t === "relation" || t === "symptom")) continue;
      deg.set(e.source, (deg.get(e.source) ?? 0) + 1);
      deg.set(e.target, (deg.get(e.target) ?? 0) + 1);
    }
    const max = Math.max(1, ...deg.values());
    const w = new Map<string, number>();
    for (const n of data.nodes) w.set(n.id, (deg.get(n.id) ?? 0) / max);
    return w;
  }, [data.edges, data.nodes]);

  // 검색/관련 질환에서 노드로 점프 — 부위가 숨겨져 있으면 켜고, 선택 + 화면 중앙 이동.
  const focusNode = useCallback(
    (nodeId: string) => {
      const target = data.nodes.find((n) => n.id === nodeId);
      if (!target) return;
      setVisibleZones((prev) =>
        prev.has(target.layoutZone) ? prev : new Set(prev).add(target.layoutZone)
      );
      setSelectedId(nodeId);
      // 노드 좌표는 좌상단 기준 — 별(점) 중심으로 보정해 중앙 정렬.
      setCenter(target.position.x + 48, target.position.y + 12, {
        zoom: 1.2,
        duration: 600,
      });
    },
    [data.nodes, setCenter]
  );

  // ── 투어 모드 ──
  const [tour, setTour] = useState<{ slug: string; step: number } | null>(null);

  const nodeBySlug = useMemo(() => {
    const m = new Map<string, (typeof data.nodes)[number]>();
    for (const n of data.nodes) m.set(n.slug, n);
    return m;
  }, [data.nodes]);

  // 활성 투어 — 시드에 없는 slug 스텝은 건너뛰고 경고(데이터 어긋남 안전망)
  const activeTour = useMemo(() => {
    if (!tour) return null;
    const def = TOURS.find((t) => t.slug === tour.slug);
    if (!def) return null;
    const steps = def.steps.filter((s) => {
      if (nodeBySlug.has(s.diseaseSlug)) return true;
      console.warn(`[tour] 시드에 없는 질병 slug: ${s.diseaseSlug}`);
      return false;
    });
    return steps.length >= 2 ? { def, steps } : null;
  }, [tour, nodeBySlug]);

  // 스텝 인덱스는 항상 유효 범위로 보정 (slug 필터로 줄었을 수 있음)
  const stepIndex = activeTour ? Math.min(tour!.step, activeTour.steps.length - 1) : 0;
  const stepNode = activeTour
    ? nodeBySlug.get(activeTour.steps[stepIndex].diseaseSlug) ?? null
    : null;

  // 스텝 변경 시 해당 질병으로 카메라 이동 + 선택 (검색과 같은 경로 재사용)
  useEffect(() => {
    if (stepNode) focusNode(stepNode.id);
  }, [stepNode, focusNode]);

  const startTour = useCallback((slug: string) => setTour({ slug, step: 0 }), []);
  const exitTour = useCallback(() => {
    setTour(null);
    setSelectedId(null);
  }, []);
  const stepPrev = useCallback(
    () => setTour((t) => (t ? { ...t, step: Math.max(0, t.step - 1) } : t)),
    []
  );
  const stepNext = useCallback(
    () =>
      setTour((t) =>
        t && activeTour ? { ...t, step: Math.min(activeTour.steps.length - 1, t.step + 1) } : t
      ),
    [activeTour]
  );

  // 초기 노드 (좌표·data) — 드래그 이동을 위해 useNodesState로 관리.
  // 등장 애니메이션 딜레이를 부위 순서→부위 내 순번으로 stagger.
  const [nodes, , onNodesChange] = useNodesState<Node>(
    (() => {
      const zoneOrder = ["head", "chest", "abdomen", "limbs", "endocrine"];
      const within = new Map<string, number>();
      return data.nodes.map((n) => {
        const i = within.get(n.layoutZone) ?? 0;
        within.set(n.layoutZone, i + 1);
        const zi = Math.max(0, zoneOrder.indexOf(n.layoutZone));
        return {
          id: n.id,
          type: "disease",
          position: n.position,
          data: {
            label: n.name,
            color: n.color,
            bodyPartName: n.bodyPartName,
            weight: weightById.get(n.id) ?? 0,
            appearDelay: zi * 130 + i * 45,
          },
        };
      });
    })()
  );

  // 현재 보이는 노드 id
  const visibleNodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const n of data.nodes) if (visibleZones.has(n.layoutZone)) set.add(n.id);
    return set;
  }, [data.nodes, visibleZones]);

  // 활성 엣지(타입 필터 + 양 끝 노드 보임)
  const activeEdges = useMemo(
    () =>
      data.edges.filter(
        (e) =>
          e.types.some((t) => enabledEdges.has(t)) &&
          visibleNodeIds.has(e.source) &&
          visibleNodeIds.has(e.target)
      ),
    [data.edges, enabledEdges, visibleNodeIds]
  );

  // 강조 노드의 이웃 (호버 우선, 디밍 계산용)
  const neighborIds = useMemo(() => {
    if (!activeId) return null;
    const set = new Set<string>([activeId]);
    for (const e of activeEdges) {
      if (e.source === activeId) set.add(e.target);
      if (e.target === activeId) set.add(e.source);
    }
    return set;
  }, [activeId, activeEdges]);

  // 강조 노드가 속한 부위 — 실루엣 글로우를 밝힌다
  const activeZone = useMemo(
    () => data.nodes.find((n) => n.id === activeId)?.layoutZone ?? null,
    [data.nodes, activeId]
  );

  // 표시용 노드 — hidden/active/selected/dimmed 반영 (위치는 state에서 유지)
  const renderNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => {
        const dimmed = neighborIds ? !neighborIds.has(n.id) : false;
        return {
          ...n,
          hidden: !visibleNodeIds.has(n.id),
          data: {
            ...n.data,
            active: n.id === activeId,
            selected: n.id === selectedId,
            dimmed,
          },
        };
      }),
    [nodes, visibleNodeIds, neighborIds, activeId, selectedId]
  );

  // 표시용 엣지 — 별자리 선: 평소엔 아주 희미한 직선, 강조 노드에 닿는 선만 점등
  const renderEdges: Edge[] = useMemo(
    () =>
      activeEdges.map((e) => {
        const touchesActive =
          !!activeId && (e.source === activeId || e.target === activeId);
        const dimmed = !!activeId && !touchesActive;
        const color = EDGE_COLORS[e.primary];
        const restOpacity =
          e.primary === "relation" ? 0.3 : e.primary === "symptom" ? 0.16 : 0.1;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "straight",
          animated: touchesActive,
          style: {
            stroke: color,
            strokeWidth: touchesActive ? 1.8 : 1,
            opacity: dimmed ? 0.03 : touchesActive ? 0.95 : restOpacity,
          },
        };
      }),
    [activeEdges, activeId]
  );

  // 투어 중에는 선택이 투어가 주도한다 — 클릭으로 카드와 어긋나지 않게 잠금
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (activeTour) return;
      setSelectedId(node.id);
    },
    [activeTour]
  );

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    setHoveredId(node.id);
  }, []);

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredId(null);
  }, []);

  const toggleZone = useCallback((zone: string) => {
    setVisibleZones((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }, []);

  const toggleEdge = useCallback((type: EdgeType) => {
    setEnabledEdges((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const selectedNode = useMemo(
    () => data.nodes.find((n) => n.id === selectedId) ?? null,
    [data.nodes, selectedId]
  );

  return (
    <div className="flex h-full flex-col">
      <FilterBar
        bodyParts={data.bodyParts}
        visibleZones={visibleZones}
        toggleZone={toggleZone}
        enabledEdges={enabledEdges}
        toggleEdge={toggleEdge}
      />
      <div className="relative flex-1">
        {/* 그래프 뒤 고정 분위기 레이어 — 팬/줌과 분리되어 깊이감을 만든다 */}
        <Starfield />
        <ReactFlow
          nodes={renderNodes}
          edges={renderEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onPaneClick={() => { if (!activeTour) setSelectedId(null); }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          {/* 별먼지 — 미세한 점 그리드 */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={30}
            size={1}
            color="var(--rf-dots)"
          />
          {/* 투어 중엔 좌하단을 TourCard가 차지 — 컨트롤 숨김(휠 줌은 유지) */}
          {!activeTour && <Controls showInteractive={false} />}
          <Silhouette
            bodyParts={data.bodyParts}
            nodes={data.nodes}
            visibleZones={visibleZones}
            activeZone={activeZone}
          />
        </ReactFlow>
        {!activeTour && (
          <DetailPanel
            node={selectedNode}
            data={data}
            onClose={() => setSelectedId(null)}
            onSelectRelated={focusNode}
          />
        )}
        {!activeTour && <SearchBox nodes={data.nodes} onSelect={focusNode} />}
        {!activeTour && <TourMenu onStart={startTour} />}
        {activeTour && stepNode && (
          <TourCard
            tourTitle={activeTour.def.title}
            stepIndex={stepIndex}
            stepCount={activeTour.steps.length}
            diseaseName={stepNode.name}
            color={stepNode.color}
            narrative={activeTour.steps[stepIndex].narrative}
            onPrev={stepPrev}
            onNext={stepNext}
            onExit={exitTour}
          />
        )}
      </div>
    </div>
  );
}

export default function AtlasFlow({ data }: { data: AtlasData }) {
  return (
    <ReactFlowProvider>
      <AtlasInner data={data} />
    </ReactFlowProvider>
  );
}
