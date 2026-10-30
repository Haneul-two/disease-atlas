import type { ResolvedTour, TourSession } from "./tour-session";

export const TOUR_PROGRESS_KEY = "disease-atlas:tour-progress:v1";
export type TourProgress = {
  diseaseSlug: string;
  completed: boolean;
  updatedAt: number;
  steps: string[];
};
export type ProgressMap = Record<string, TourProgress>;

export function readProgress(
  raw: string | null,
  tours: ResolvedTour[],
): ProgressMap {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1 ||
      !("tours" in value) ||
      !value.tours ||
      typeof value.tours !== "object"
    )
      return {};
    const result: ProgressMap = {};
    for (const tour of tours) {
      const item: unknown = Object.getOwnPropertyDescriptor(
        value.tours,
        tour.slug,
      )?.value;
      if (
        !item ||
        typeof item !== "object" ||
        !("diseaseSlug" in item) ||
        typeof item.diseaseSlug !== "string" ||
        !("completed" in item) ||
        typeof item.completed !== "boolean" ||
        !("updatedAt" in item) ||
        typeof item.updatedAt !== "number" ||
        !Number.isFinite(item.updatedAt) ||
        !("steps" in item) ||
        !Array.isArray(item.steps)
      )
        continue;
      const slugs = tour.steps.map((s) => s.diseaseSlug);
      if (!slugs.includes(item.diseaseSlug)) continue;
      result[tour.slug] = {
        diseaseSlug: item.diseaseSlug,
        completed:
          item.completed &&
          JSON.stringify(item.steps) === JSON.stringify(slugs),
        updatedAt: item.updatedAt,
        steps: slugs,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function progressSession(
  tour: ResolvedTour,
  progress?: TourProgress,
): TourSession {
  return {
    slug: tour.slug,
    step: progress
      ? Math.max(
          0,
          tour.steps.findIndex((s) => s.diseaseSlug === progress.diseaseSlug),
        )
      : 0,
    completed: progress?.completed ?? false,
  };
}
