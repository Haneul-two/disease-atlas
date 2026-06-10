// Atlas (메인) — 질병 관계 그래프
import { getAtlasGraph } from "@/lib/atlas-data";
import AtlasFlow from "@/components/atlas/AtlasFlow";
import Disclaimer from "@/components/atlas/Disclaimer";

export const dynamic = "force-dynamic"; // 항상 최신 DB 반영

export default async function Home() {
  const data = await getAtlasGraph();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 px-4 py-2.5 dark:border-white/10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-bold tracking-tight">질병 아틀라스</h1>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            인체 부위별 질병 관계 지도
          </span>
        </div>
        <Disclaimer className="hidden text-right md:block" />
      </header>
      <main className="min-h-0 flex-1">
        <AtlasFlow data={data} />
      </main>
    </div>
  );
}
