"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ResolvedTour, TourSession } from "@/lib/tour-session";
import { readProgress, TOUR_PROGRESS_KEY } from "@/lib/tour-progress";

let writeFailed = false;
const failedSnapshot = () => writeFailed;
const serverFailedSnapshot = () => false;
const eventName = "atlas:progress";
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === TOUR_PROGRESS_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(eventName, callback);
  };
}
function snapshot() {
  try {
    return window.localStorage.getItem(TOUR_PROGRESS_KEY);
  } catch {
    return null;
  }
}
const serverSnapshot = () => null;

export function useTourProgress(tours: ResolvedTour[]) {
  const storageFailed = useSyncExternalStore(
    subscribe,
    failedSnapshot,
    serverFailedSnapshot,
  );
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const progress = useMemo(() => readProgress(raw, tours), [raw, tours]);
  const save = useCallback(
    (session: TourSession, restart = false) => {
      const tour = tours.find((t) => t.slug === session.slug);
      const step = tour?.steps[session.step];
      if (!tour || !step) return false;
      try {
        const current = readProgress(
          window.localStorage.getItem(TOUR_PROGRESS_KEY),
          tours,
        );
        current[tour.slug] = {
          diseaseSlug: step.diseaseSlug,
          completed: restart
            ? false
            : session.completed || !!current[tour.slug]?.completed,
          updatedAt: Date.now(),
          steps: tour.steps.map((s) => s.diseaseSlug),
        };
        window.localStorage.setItem(
          TOUR_PROGRESS_KEY,
          JSON.stringify({ version: 1, tours: current }),
        );
        writeFailed = false;
        window.dispatchEvent(new Event(eventName));
        return true;
      } catch {
        writeFailed = true;
        window.dispatchEvent(new Event(eventName));
        return false;
      }
    },
    [tours],
  );
  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(TOUR_PROGRESS_KEY);
      writeFailed = false;
      window.dispatchEvent(new Event(eventName));
      return true;
    } catch {
      writeFailed = true;
      window.dispatchEvent(new Event(eventName));
      return false;
    }
  }, []);
  return { progress, save, clear, storageFailed };
}
