"use client";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { AtlasNode } from "@/lib/atlas-types";
import type { ResolvedTour } from "@/lib/tour-session";
import {
  atlasSearch,
  parseAtlasRoute,
  type AtlasRoute,
} from "@/lib/atlas-navigation";

const eventName = "atlas:navigate";
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(eventName, callback);
  };
}
const snapshot = () => window.location.search;
const serverSnapshot = () => "";

export function useAtlasNavigation(nodes: AtlasNode[], tours: ResolvedTour[]) {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const route = useMemo(
    () => parseAtlasRoute(search, nodes, tours),
    [search, nodes, tours],
  );
  const navigate = useCallback((next: AtlasRoute, replace = false) => {
    const query = atlasSearch(next, window.location.search);
    if (query === window.location.search) return;
    window.history[replace ? "replaceState" : "pushState"](
      null,
      "",
      window.location.pathname + query + window.location.hash,
    );
    window.dispatchEvent(new Event(eventName));
  }, []);
  useEffect(() => {
    // Read the browser directly: the server snapshot intentionally starts empty.
    const parsed = parseAtlasRoute(window.location.search, nodes, tours);
    navigate(parsed, true);
  }, [search, nodes, tours, navigate]);
  return { route, navigate };
}
