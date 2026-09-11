"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type Viewport,
  useNodesState,
  useStore,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { AtlasData, EdgeType } from "@/lib/atlas-types";
import { edgeVisual } from "@/lib/edge-style";
import { TOURS } from "@/lib/tours";
import { learningPath, resolveTour, tourStepIndex } from "@/lib/tour-session";
import DiseaseNode from "./DiseaseNode";
import Silhouette from "./Silhouette";
import Starfield from "./Starfield";
import FilterBar from "./FilterBar";
import DetailPanel from "./DetailPanel";
import SearchBox from "./SearchBox";
import TourMenu from "./TourMenu";
import TourCard from "./TourCard";
import { useAtlasNavigation } from "./useAtlasNavigation";
import { useTourProgress } from "./useTourProgress";
import { progressSession } from "@/lib/tour-progress";
import { usePanelCamera } from "./usePanelCamera";

const nodeTypes = { disease: DiseaseNode };

function AtlasInner({ data }: { data: AtlasData }) {
  const [visibleZones, setVisibleZones] = useState(
    () => new Set(data.bodyParts.map((b) => b.layoutZone)),
  );
  const [enabledEdges, setEnabledEdges] = useState(
    () => new Set<EdgeType>(["relation"]),
  );
  const [restoreCamera, setRestoreCamera] = useState(false);
  const [returnSelection, setReturnSelection] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const overview = useStore((state) => state.transform[2] < 0.7);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const savedViewport = useRef<Viewport | null>(null);
  const [cameraFocus, setCameraFocus] = useState<{
    id: string;
    revision: number;
  } | null>(null);
  const { getViewport, setViewport, fitView } = useReactFlow();

  const availableTours = useMemo(
    () =>
      TOURS.flatMap((definition) => {
        const resolved = resolveTour(definition, data.nodes);
        return resolved ? [resolved] : [];
      }),
    [data.nodes],
  );
  const { route, navigate } = useAtlasNavigation(data.nodes, availableTours);
  const { progress, save, clear, storageFailed } =
    useTourProgress(availableTours);
  const tour = route.kind === "tour" ? route : null;
  const selectedId =
    route.kind === "disease"
      ? (data.nodes.find((n) => n.slug === route.slug)?.id ?? null)
      : tour
        ? returnSelection
        : null;
  useEffect(() => {
    if (tour) save(tour);
  }, [tour, save]);
  useEffect(() => {
    const onHistory = () => {
      setRestoreCamera(false);
      setHoveredId(null);
      setCameraFocus(null);
      savedViewport.current = null;
    };
    window.addEventListener("popstate", onHistory);
    return () => window.removeEventListener("popstate", onHistory);
  }, []);
  const activeTour = availableTours.find((t) => t.slug === tour?.slug) ?? null;
  const stepIndex = tourStepIndex(
    tour?.step ?? 0,
    activeTour?.steps.length ?? 0,
  );
  const stepNode = activeTour?.steps[stepIndex].node ?? null;
  const completed = !!tour?.completed;
  // Tour controls the view; browsing filters and selection remain intact underneath.
  const activeId = activeTour
    ? completed
      ? null
      : (stepNode?.id ?? null)
    : (hoveredId ?? selectedId);
  const effectiveSelectedId = activeTour
    ? completed
      ? null
      : stepNode?.id
    : selectedId;
  const tourNodeIds = useMemo(
    () => new Set(activeTour?.steps.map((s) => s.node.id)),
    [activeTour],
  );
  const effectiveZones = useMemo(
    () =>
      activeTour
        ? new Set(activeTour.steps.map((s) => s.node.layoutZone))
        : selectedId
          ? new Set(visibleZones).add(
              data.nodes.find((n) => n.id === selectedId)!.layoutZone,
            )
          : visibleZones,
    [activeTour, visibleZones, selectedId, data.nodes],
  );

  const weightById = useMemo(() => {
    const degrees = new Map<string, number>();
    for (const e of data.edges) {
      if (!e.types.some((t) => t === "relation" || t === "symptom")) continue;
      for (const id of [e.source, e.target])
        degrees.set(id, (degrees.get(id) ?? 0) + 1);
    }
    const max = Math.max(1, ...degrees.values());
    return new Map(
      data.nodes.map((n) => [n.id, (degrees.get(n.id) ?? 0) / max]),
    );
  }, [data.edges, data.nodes]);

  const representatives = useMemo(() => {
    const result = new Set<string>();
    for (const part of data.bodyParts) {
      const candidates = data.nodes.filter(
        (n) => n.layoutZone === part.layoutZone,
      );
      candidates.sort(
        (a, b) =>
          (weightById.get(b.id) ?? 0) - (weightById.get(a.id) ?? 0) ||
          a.slug.localeCompare(b.slug),
      );
      if (candidates[0]) result.add(candidates[0].id);
    }
    return result;
  }, [data.nodes, data.bodyParts, weightById]);

  const [nodes, , onNodesChange] = useNodesState<Node>(
    data.nodes.map((n, i) => ({
      id: n.id,
      type: "disease",
      position: n.position,
      data: {
        label: n.name,
        color: n.color,
        bodyPartName: n.bodyPartName,
        weight: weightById.get(n.id) ?? 0,
        appearDelay: Math.min(i * 25, 900),
      },
    })),
  );
  const visibleNodeIds = useMemo(
    () =>
      new Set(
        data.nodes
          .filter((n) => effectiveZones.has(n.layoutZone))
          .map((n) => n.id),
      ),
    [data.nodes, effectiveZones],
  );
  const activeEdges = useMemo(
    () =>
      data.edges.filter(
        (e) =>
          e.types.some((t) => enabledEdges.has(t)) &&
          visibleNodeIds.has(e.source) &&
          visibleNodeIds.has(e.target),
      ),
    [data.edges, enabledEdges, visibleNodeIds],
  );
  const neighborIds = useMemo(() => {
    if (activeTour) return tourNodeIds;
    if (!activeId) return null;
    const ids = new Set([activeId]);
    for (const e of activeEdges) {
      if (e.source === activeId) ids.add(e.target);
      if (e.target === activeId) ids.add(e.source);
    }
    return ids;
  }, [activeTour, tourNodeIds, activeId, activeEdges]);
  const activeZone =
    data.nodes.find((n) => n.id === activeId)?.layoutZone ?? null;
  const renderNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        hidden: !visibleNodeIds.has(n.id),
        data: {
          ...n.data,
          active: n.id === activeId,
          overview,
          representative: representatives.has(n.id),
          selected: n.id === effectiveSelectedId,
          dimmed: neighborIds ? !neighborIds.has(n.id) : false,
          tourStep: activeTour
            ? activeTour.steps.findIndex((s) => s.node.id === n.id) + 1
            : 0,
        },
      })),
    [
      nodes,
      visibleNodeIds,
      activeId,
      effectiveSelectedId,
      neighborIds,
      activeTour,
      overview,
      representatives,
    ],
  );
  const renderEdges: Edge[] = useMemo(() => {
    if (activeTour)
      return learningPath(activeTour, stepIndex, completed).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "straight",
        selectable: false,
        className: "atlas-learning-path",
        // Learning order is deliberately marker-free, distinct from medical arrows.
        style: {
          stroke: e.current ? "var(--bone-bright)" : "var(--bone)",
          strokeWidth: e.current ? 2.5 : 1.5,
          strokeDasharray: "6 7",
          opacity: e.current || e.visited ? 0.95 : 0.35,
        },
      }));
    return activeEdges.map((e) => {
      const v = edgeVisual(e, activeId);
      return {
        id: e.id,
        source: v.source,
        target: v.target,
        type: "straight",
        animated: v.animated,
        markerEnd: v.directed
          ? {
              type: MarkerType.ArrowClosed,
              width: 12,
              height: 12,
              color: v.color,
            }
          : undefined,
        style: {
          stroke: v.color,
          strokeWidth: v.strokeWidth,
          opacity: !activeId ? v.opacity * (overview ? 0.4 : 0.55) : v.opacity,
        },
      };
    });
  }, [activeTour, stepIndex, completed, activeEdges, activeId, overview]);

  const focusNode = useCallback(
    (id: string) => {
      const node = data.nodes.find((n) => n.id === id);
      if (!node) return;
      setRestoreCamera(false);
      setCameraFocus((previous) => ({
        id,
        revision: (previous?.revision ?? 0) + 1,
      }));
      setHoveredId(null);
      setVisibleZones((prev) => new Set(prev).add(node.layoutZone));
      navigate({ kind: "disease", slug: node.slug });
    },
    [data.nodes, navigate],
  );
  const startTour = useCallback(
    (slug: string, resume = false) => {
      const definition = availableTours.find((t) => t.slug === slug);
      if (!definition) return;
      if (!savedViewport.current) {
        savedViewport.current = getViewport();
        setReturnSelection(selectedId);
      }
      setRestoreCamera(false);
      setHoveredId(null);
      const session = resume
        ? progressSession(definition, progress[slug])
        : { slug, step: 0, completed: false };
      save(session, !resume);
      navigate({ kind: "tour", ...session });
    },
    [availableTours, getViewport, selectedId, progress, save, navigate],
  );
  const exitTour = useCallback(() => {
    setRestoreCamera(!!savedViewport.current);
    setCameraFocus(null);
    setHoveredId(null);
    const node = data.nodes.find((n) => n.id === returnSelection);
    navigate(node ? { kind: "disease", slug: node.slug } : { kind: "browse" });
    if (savedViewport.current) {
      void setViewport(savedViewport.current, { duration: 0 });
    } else if (!node) {
      requestAnimationFrame(() => {
        void fitView({ padding: 0.2, duration: 0 });
      });
    }
    savedViewport.current = null;
    requestAnimationFrame(() =>
      document
        .getElementById("atlas-tour-trigger")
        ?.focus({ preventScroll: true }),
    );
  }, [setViewport, fitView, data.nodes, returnSelection, navigate]);
  const goToStep = useCallback(
    (index: number) => {
      if (!activeTour) return;
      setHoveredId(null);
      navigate({
        kind: "tour",
        slug: activeTour.slug,
        step: tourStepIndex(index, activeTour.steps.length),
        completed: false,
      });
    },
    [activeTour, navigate],
  );
  const closeDetail = useCallback(() => {
    navigate({ kind: "browse" });
    setHoveredId(null);
  }, [navigate]);
  const selectedNode = data.nodes.find((n) => n.id === selectedId) ?? null;
  const cameraIds = activeTour
    ? (completed
        ? activeTour.steps
        : activeTour.steps.slice(Math.max(0, stepIndex - 1), stepIndex + 1)
      ).map((s) => s.node.id)
    : selectedId && !restoreCamera
      ? [selectedId]
      : [];
  usePanelCamera(
    canvasRef,
    panelRef,
    cameraIds,
    `${tour?.slug ?? "browse"}:${stepIndex}:${completed}:${selectedId}:${cameraFocus?.revision ?? 0}`,
  );
  const nextTour = activeTour
    ? availableTours[
        (availableTours.indexOf(activeTour) + 1) % availableTours.length
      ]
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {activeTour ? (
        <div className="atlas-tour-bar">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-6 border-t-2 border-dashed border-[var(--bone)]"
            />
            학습 경로
          </span>
          <span className="text-xs text-[var(--paper-dim)]">
            투어 중에는 경로에 집중해요
          </span>
          <button className="atlas-button ml-auto" onClick={exitTour}>
            자유 탐색
          </button>
        </div>
      ) : (
        <FilterBar
          bodyParts={data.bodyParts}
          visibleZones={visibleZones}
          toggleZone={(zone) =>
            setVisibleZones((prev) => {
              const next = new Set(prev);
              if (next.has(zone)) next.delete(zone);
              else next.add(zone);
              return next;
            })
          }
          enabledEdges={enabledEdges}
          toggleEdge={(type) =>
            setEnabledEdges((prev) => {
              const next = new Set(prev);
              if (next.has(type)) next.delete(type);
              else next.add(type);
              return next;
            })
          }
        />
      )}
      <div ref={canvasRef} className="relative min-h-0 flex-1">
        <Starfield focused={!!activeId || !!activeTour} />
        <ReactFlow
          nodes={renderNodes}
          edges={renderEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => {
            if (!activeTour) focusNode(node.id);
          }}
          onNodeMouseEnter={(_, node) => {
            if (!activeTour) setHoveredId(node.id);
          }}
          onNodeMouseLeave={() => setHoveredId(null)}
          onPaneClick={() => {
            if (!activeTour) closeDetail();
          }}
          nodesDraggable={!activeTour}
          nodesFocusable={!activeTour}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={30}
            size={1}
            color="var(--rf-dots)"
          />
          {!activeTour && <Controls showInteractive={false} />}
          <Silhouette
            onFocusZone={(zone) => {
              void fitView({
                nodes: data.nodes
                  .filter((n) => n.layoutZone === zone)
                  .map((n) => ({ id: n.id })),
                padding: 0.28,
                maxZoom: 1.25,
                duration: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? 0
                  : 550,
              });
            }}
            interactive={!activeTour && !selectedNode}
            bodyParts={data.bodyParts}
            nodes={data.nodes}
            visibleZones={effectiveZones}
            activeZone={activeZone}
          />
        </ReactFlow>
        {!activeTour && !selectedNode && (
          <div className="atlas-view-key">
            <p className="atlas-eyebrow">인체의 별자리</p>
            <p>
              {overview
                ? "부위 이름을 눌러 가까이 살펴보세요"
                : "질병을 선택해 연결을 살펴보세요"}
            </p>
            <span>배치는 부위별 분류를 나타냅니다.</span>
            <button
              className="atlas-button"
              onClick={() => {
                void fitView({ padding: 0.2, duration: 0 });
              }}
            >
              전체 지도
            </button>
          </div>
        )}
        {!activeTour && selectedNode && (
          <DetailPanel
            key={selectedNode.id}
            node={selectedNode}
            data={data}
            panelRef={panelRef}
            onClose={closeDetail}
            onSelectRelated={focusNode}
          />
        )}
        {!activeTour && <SearchBox nodes={data.nodes} onSelect={focusNode} />}
        {!activeTour && (
          <TourMenu
            tours={availableTours}
            onStart={startTour}
            progress={progress}
            onClear={clear}
            storageFailed={storageFailed}
          />
        )}
        {activeTour && (
          <TourCard
            key={activeTour.slug}
            tour={activeTour}
            stepIndex={stepIndex}
            completed={completed}
            storageFailed={storageFailed}
            panelRef={panelRef}
            onStep={goToStep}
            onComplete={() =>
              navigate({
                kind: "tour",
                slug: activeTour.slug,
                step: activeTour.steps.length - 1,
                completed: true,
              })
            }
            onExit={exitTour}
            onRestart={() => startTour(activeTour.slug)}
            nextTourTitle={
              nextTour?.slug !== activeTour.slug ? nextTour?.title : undefined
            }
            onStartNext={() => {
              if (nextTour) startTour(nextTour.slug);
            }}
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
