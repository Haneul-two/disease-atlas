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
import ExplorationPanel, { edgeTitle, type Exploration } from "./ExplorationPanel";
import OrganTargets from "./OrganTargets";
import { ANATOMY_LANDMARKS, diseaseLandmarkKey, alignedPositions } from "@/lib/atlas-anatomy";
import ViewSettings, { useViewSettings } from "./ViewSettings";
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
  const view = useViewSettings();
  const labelPositions = useMemo(() => alignedPositions(data.nodes), [data.nodes]);
  const [visibleZones, setVisibleZones] = useState(
    () => new Set(data.bodyParts.map((b) => b.layoutZone)),
  );
  const [enabledEdges, setEnabledEdges] = useState(
    () => new Set<EdgeType>(["relation"]),
  );
  const [restoreCamera, setRestoreCamera] = useState(false);
  const [returnSelection, setReturnSelection] = useState<string | null>(null);
  const [exploration, setExploration] = useState<Exploration | null>(null);
  const explorationTrigger = useRef<Element | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const zoom = useStore((state) => state.transform[2]);
  const overview = zoom < 0.7;
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
  const previousView = useRef(`${view.settings.aligned}:${view.settings.readable}`);
  useEffect(() => {
    const key = `${view.settings.aligned}:${view.settings.readable}`;
    const changed = previousView.current !== key;
    previousView.current = key;
    if (route.kind !== "browse") return;
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { void fitView({ padding: 0.2, duration: 0 }); });
    };
    if (changed) refit();
    window.addEventListener("resize", refit);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", refit); };
  }, [view.settings.aligned, view.settings.readable, fitView, route.kind]);
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
      setExploration(null);
      setHoveredId(null);
      setCameraFocus(null);
      savedViewport.current = null;
    };
    window.addEventListener("popstate", onHistory);
    return () => window.removeEventListener("popstate", onHistory);
  }, []);
  const openExploration = useCallback((next: Exploration) => {
    explorationTrigger.current = document.activeElement;
    setExploration(next);
    setRestoreCamera(false);
    setHoveredId(null);
    navigate({ kind: "browse" });
    if (next.kind === "organ") {
      const zones = data.nodes.filter(n => diseaseLandmarkKey(n.slug) === next.key).map(n => n.layoutZone);
      setVisibleZones(previous => new Set([...previous, ...zones]));
    }
  }, [data.nodes, navigate]);
  const closeExploration = useCallback(() => {
    setExploration(null);
    setHoveredId(null);
    requestAnimationFrame(() => {
      const trigger = explorationTrigger.current;
      if (trigger?.isConnected && (trigger instanceof HTMLElement || trigger instanceof SVGElement)) trigger.focus({ preventScroll: true });
      else document.getElementById("atlas-organ-trigger")?.focus({ preventScroll: true });
    });
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
        slug: n.slug,
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
  const exploredEdge = exploration?.kind === "edge" ? activeEdges.find(e => e.id === exploration.id) : null;
  const exploredOrgan = exploration?.kind === "organ" ? exploration.key : null;
  const organIds = useMemo(() => new Set(data.nodes.filter(n => diseaseLandmarkKey(n.slug) === exploredOrgan).map(n => n.id)), [data.nodes, exploredOrgan]);
  const neighborIds = useMemo(() => {
    if (activeTour) return tourNodeIds;
    if (exploredEdge) return new Set([exploredEdge.source, exploredEdge.target]);
    if (exploredOrgan) return organIds;
    if (!activeId) return null;
    const ids = new Set([activeId]);
    for (const e of activeEdges) {
      if (e.source === activeId) ids.add(e.target);
      if (e.target === activeId) ids.add(e.source);
    }
    return ids;
  }, [activeTour, tourNodeIds, activeId, activeEdges, exploredEdge, exploredOrgan, organIds]);
  const activeZone =
    data.nodes.find((n) => n.id === activeId)?.layoutZone ?? (exploredOrgan ? ANATOMY_LANDMARKS[exploredOrgan].zone : null);
  const renderNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        position: view.settings.aligned ? labelPositions.get(String(n.data.slug)) ?? n.position : n.position,
        hidden: !visibleNodeIds.has(n.id),
        data: {
          ...n.data,
          active: n.id === activeId,
          overview: overview && !exploredOrgan && !exploredEdge,
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
      exploredOrgan,
      exploredEdge,
      view.settings.aligned,
      labelPositions,
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
        focusable: false,
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
        selectable: false,
        focusable: true,
        ariaRole: "button",
        ariaLabel: `${edgeTitle(e, data.nodes)} 연결 설명`,
        interactionWidth: 24 / zoom,
        domAttributes: { onKeyDown: event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault(); event.stopPropagation();
            openExploration({ kind: "edge", id: e.id });
          }
        } },
        className: (exploredEdge ? exploredEdge.id !== e.id : exploredOrgan ? !(organIds.has(e.source) && organIds.has(e.target)) : activeId ? e.source !== activeId && e.target !== activeId : false) ? "atlas-edge-dimmed" : undefined,
        animated: !exploredEdge && v.animated,
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
          strokeWidth: exploredEdge?.id === e.id ? 3 : v.strokeWidth,
          opacity: exploredEdge ? (exploredEdge.id === e.id ? 1 : .025)
            : exploredOrgan ? (organIds.has(e.source) && organIds.has(e.target) ? .65 : .025)
            : !activeId ? v.opacity * (overview ? 0.4 : 0.55) : v.opacity,
        },
      };
    });
  }, [activeTour, stepIndex, completed, activeEdges, activeId, overview, exploredEdge, exploredOrgan, organIds, zoom, data.nodes, openExploration]);

  const focusNode = useCallback(
    (id: string) => {
      const node = data.nodes.find((n) => n.id === id);
      if (!node) return;
      setExploration(null);
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
      setExploration(null);
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
    : exploredEdge ? [exploredEdge.source, exploredEdge.target]
      : exploredOrgan ? [...organIds]
      : selectedId && !restoreCamera
        ? [selectedId]
        : [];
  usePanelCamera(
    canvasRef,
    panelRef,
    cameraIds,
    `${tour?.slug ?? "browse"}:${stepIndex}:${completed}:${selectedId}:${cameraFocus?.revision ?? 0}:${exploredOrgan}:${exploredEdge?.id}:${view.settings.aligned}`,
    exploration ? 64 : 0,
  );
  const nextTour = activeTour
    ? availableTours[
        (availableTours.indexOf(activeTour) + 1) % availableTours.length
      ]
    : null;

  return (
    <div className="atlas-experience flex h-full min-h-0 flex-col" data-readable={view.settings.readable} data-body-layer={view.settings.layer} data-aligned={view.settings.aligned}>
      <ViewSettings {...view} />
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
          toggleZone={(zone) => {
            setExploration(null);
            setVisibleZones((prev) => {
              const next = new Set(prev);
              if (next.has(zone)) next.delete(zone);
              else next.add(zone);
              return next;
            });
          }}
          enabledEdges={enabledEdges}
          toggleEdge={(type) => {
            setExploration(null);
            setEnabledEdges((prev) => {
              const next = new Set(prev);
              if (next.has(type)) next.delete(type);
              else next.add(type);
              return next;
            });
          }}
        />
      )}
      <div ref={canvasRef} className="relative min-h-0 flex-1">
        <Starfield focused={!!activeId || !!activeTour || !!exploration} />
        <ReactFlow
          nodes={renderNodes}
          edges={renderEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgeClick={(event, edge) => { if (!activeTour) { event.stopPropagation(); openExploration({ kind: "edge", id: edge.id }); } }}
          onNodeClick={(_, node) => {
            if (!activeTour) focusNode(node.id);
          }}
          onNodeMouseEnter={(_, node) => {
            if (!activeTour && !exploration) setHoveredId(node.id);
          }}
          onNodeMouseLeave={() => setHoveredId(null)}
          onPaneClick={() => {
            if (!activeTour) { closeExploration(); closeDetail(); }
          }}
          nodesDraggable={!activeTour && !view.settings.aligned}
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
          <OrganTargets onSelect={key => openExploration({ kind: "organ", key })}
            selected={exploredOrgan} enabled={!activeTour} visibleZones={effectiveZones} />
          <Silhouette
            aligned={view.settings.aligned}
            activeNode={data.nodes.find(n => n.id === activeId)}
            onFocusZone={(zone) => {
              setExploration(null);
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
        {!activeTour && !selectedNode && !exploration && (
          <div className="atlas-view-key">
            <p className="atlas-eyebrow">인체의 별자리</p>
            <p>
              {overview
                ? "장기나 부위 이름을 눌러 살펴보세요"
                : "질병이나 관계선을 눌러 살펴보세요"}
            </p>
            <span>장기 주변에 펼친 배치 · 선택하면 위치 표시</span>
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
        {!activeTour && selectedNode && !exploration && (
          <DetailPanel
            key={selectedNode.id}
            node={selectedNode}
            data={data}
            panelRef={panelRef}
            onClose={closeDetail}
            onSelectRelated={focusNode}
            onInspectRelation={id => openExploration({ kind: "edge", id })}
            visibleEdges={activeEdges}
          />
        )}
        {!activeTour && !exploration && <button id="atlas-organ-trigger" className="atlas-organ-trigger" onClick={() => openExploration({ kind: "organs" })}>장기 탐색</button>}
        {!activeTour && exploration && <ExplorationPanel exploration={exploration} data={data} panelRef={panelRef}
          onClose={closeExploration} onOrgan={key => openExploration({ kind: "organ", key })}
          onIndex={() => openExploration({ kind: "organs" })} onDisease={focusNode} />}
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
