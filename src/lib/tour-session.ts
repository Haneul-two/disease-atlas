import type { AtlasNode } from "./atlas-types";
import type { Tour } from "./tours";

export type TourSession = { slug: string; step: number; completed: boolean };

// Missing DB records are removed before the menu, path and card are built.
// The same resolved steps are the single source of truth for all three.
export function resolveTour(tour: Tour, nodes: AtlasNode[]) {
  const bySlug = new Map(nodes.map((node) => [node.slug, node]));
  const steps = tour.steps.flatMap((step) => {
    const node = bySlug.get(step.diseaseSlug);
    return node ? [{ ...step, node }] : [];
  });
  return steps.length >= 2 ? { ...tour, steps } : null;
}
export type ResolvedTour = NonNullable<ReturnType<typeof resolveTour>>;

export function tourStepIndex(step: number, count: number) {
  return Math.max(
    0,
    Math.min(Number.isFinite(step) ? Math.trunc(step) : 0, count - 1),
  );
}

export function learningPath(
  tour: ResolvedTour,
  index: number,
  completed: boolean,
) {
  return tour.steps.slice(1).map((step, i) => ({
    id: `tour-${tour.slug}-${i}`,
    source: tour.steps[i].node.id,
    target: step.node.id,
    current: !completed && (i === index || i + 1 === index),
    visited: completed || i < index,
  }));
}
