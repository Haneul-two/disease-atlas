"use client";
// Atlas 메인 캔버스 — React Flow로 질병 노드를 해부학적으로 배치하고,
// 부위/엣지 필터·선택 하이라이트·상세 패널을 연결한다.
import { useCallback, useMemo, useState } from "react";
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
import FilterBar from "./FilterBar";
import DetailPanel from "./DetailPanel";
import SearchBox from "./SearchBox";

const nodeTypes = { disease: DiseaseNode };

function AtlasInner({ data }: { data: AtlasData }) {
  const allZones = useMemo(
    () => new Set(data.bodyParts.map((b) => b.layoutZone)),
    [data.bodyParts]
  );
  const [visibleZones, setVisibleZones] = useState<Set<string>>(allZones);
  const [enabledEdges, setEnabledEdges] = useState<Set<EdgeType>>(
    new Set<EdgeType>(["relation", "symptom"])
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
      // 노드 좌표는 좌상단 기준 — 대략적인 노드 중심으로 보정해 중앙 정렬.
      setCenter(target.position.x + 60, target.position.y + 18, {
        zoom: 1.2,
        duration: 600,
      });
    },
    [data.nodes, setCenter]
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

  // 표시용 엣지 — 대표 타입 색, 강조 노드에 닿는 엣지만 또렷
  const renderEdges: Edge[] = useMemo(
    () =>
      activeEdges.map((e) => {
        const touchesActive =
          !!activeId && (e.source === activeId || e.target === activeId);
        const dimmed = !!activeId && !touchesActive;
        const color = EDGE_COLORS[e.primary];
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          animated: e.primary === "relation" || touchesActive,
          style: {
            stroke: color,
            strokeWidth: touchesActive ? 2.6 : 1.4,
            opacity: dimmed ? 0.06 : e.primary === "bodypart" ? 0.4 : 0.72,
          },
        };
      }),
    [activeEdges, activeId]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

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
        <ReactFlow
          nodes={renderNodes}
          edges={renderEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onPaneClick={() => setSelectedId(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Cross}
            gap={36}
            size={6}
            color="var(--rf-dots)"
          />
          <Controls showInteractive={false} />
          <Silhouette
            bodyParts={data.bodyParts}
            nodes={data.nodes}
            visibleZones={visibleZones}
            activeZone={activeZone}
          />
        </ReactFlow>
        <DetailPanel
          node={selectedNode}
          data={data}
          onClose={() => setSelectedId(null)}
          onSelectRelated={focusNode}
        />
        <SearchBox nodes={data.nodes} onSelect={focusNode} />
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
