import type { AtlasNode } from "./atlas-types";
import {
  tourStepIndex,
  type ResolvedTour,
  type TourSession,
} from "./tour-session";

export type AtlasRoute =
  | { kind: "browse" }
  | { kind: "disease"; slug: string }
  | ({ kind: "tour" } & TourSession);

export function parseAtlasRoute(
  search: string,
  nodes: AtlasNode[],
  tours: ResolvedTour[],
): AtlasRoute {
  const params = new URLSearchParams(search);
  const tour = tours.find((t) => t.slug === params.get("tour"));
  if (tour) {
    const raw = params.get("step") ?? "1";
    const step = tourStepIndex(
      /^\d+$/.test(raw) ? Number(raw) - 1 : 0,
      tour.steps.length,
    );
    const completed = params.get("done") === "1";
    return {
      kind: "tour",
      slug: tour.slug,
      step: completed ? tour.steps.length - 1 : step,
      completed,
    };
  }
  const disease = nodes.find((n) => n.slug === params.get("disease"));
  return disease ? { kind: "disease", slug: disease.slug } : { kind: "browse" };
}

export function atlasSearch(route: AtlasRoute, search = "") {
  const params = new URLSearchParams(search);
  for (const key of ["tour", "step", "done", "disease"]) params.delete(key);
  if (route.kind === "disease") params.set("disease", route.slug);
  if (route.kind === "tour") {
    params.set("tour", route.slug);
    params.set("step", String(route.step + 1));
    if (route.completed) params.set("done", "1");
  }
  return params.size ? `?${params}` : "";
}
