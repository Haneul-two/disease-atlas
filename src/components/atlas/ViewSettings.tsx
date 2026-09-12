"use client";
import { useSyncExternalStore } from "react";

export type BodyLayer = "all" | "organs" | "skeleton";
const key = "disease-atlas:view";
const event = "atlas-view-change";
const fallback = '{"layer":"all","aligned":false,"readable":false}';
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(event, callback);
  };
}
let temporary: string | null = null;
function snapshot() {
  try { return temporary ?? localStorage.getItem(key) ?? fallback; }
  catch { return temporary ?? fallback; }
}
export function useViewSettings() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => fallback);
  let value;
  try { value = JSON.parse(raw); } catch { value = null; }
  const settings = {
    layer: (["all", "organs", "skeleton"].includes(value?.layer) ? value.layer : "all") as BodyLayer,
    aligned: value?.aligned === true,
    readable: value?.readable === true,
  };
  return { settings, update: (next: Partial<typeof settings>) => {
    const serialized = JSON.stringify({ ...settings, ...next });
    try { localStorage.setItem(key, serialized); temporary = null; }
    catch { temporary = serialized; }
    window.dispatchEvent(new Event(event));
  } };
}

export default function ViewSettings({ settings, update }: ReturnType<typeof useViewSettings>) {
  return <div className="atlas-view-settings" aria-label="지도 화면 설정">
    <label>신체 보기
      <select value={settings.layer} onChange={e => update({ layer: e.target.value as BodyLayer })}>
        <option value="all">전체</option>
        <option value="organs">장기 중심</option>
        <option value="skeleton">골격 중심</option>
      </select>
    </label>
    <button type="button" aria-pressed={settings.aligned} onClick={() => update({ aligned: !settings.aligned })}>질병명 정렬</button>
    <button type="button" aria-pressed={settings.readable} onClick={() => update({ readable: !settings.readable })}>큰 글씨</button>
  </div>;
}
