// Atlas (메인) — 질병 관계 그래프
import { getAtlasGraph } from "@/lib/atlas-data";
import AtlasFlow from "@/components/atlas/AtlasFlow";
import Disclaimer from "@/components/atlas/Disclaimer";

export const dynamic = "force-dynamic"; // 항상 최신 DB 반영

export default async function Home() {
  const data = await getAtlasGraph();
  const plateNo = String(data.bodyParts.length).padStart(2, "0");

  return (
    <div className="relative z-10 flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--ink-850)]/80 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* 플레이트 카투쉬 */}
          <div
            className="hidden flex-col items-center justify-center rounded-md border border-[var(--line)] px-3 py-1.5 sm:flex"
            style={{ background: "var(--ink-800)" }}
          >
            <span
              className="text-[9px] uppercase leading-none tracking-[0.2em] text-[var(--muted)]"
              style={{ fontFamily: "var(--f-plex-mono)" }}
            >
              Plate
            </span>
            <span
              className="text-[20px] italic leading-none text-[var(--bone)]"
              style={{ fontFamily: "var(--f-fraunces)" }}
            >
              {plateNo}
            </span>
          </div>

          <div>
            <h1
              className="text-[22px] leading-none text-[var(--paper)]"
              style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
            >
              질병 아틀라스
            </h1>
            <p
              className="mt-1.5 text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]"
              style={{ fontFamily: "var(--f-plex-mono)" }}
            >
              Atlas of the Body · 人體 解剖
            </p>
          </div>
        </div>

        <Disclaimer className="hidden max-w-xs text-right md:block" />
      </header>

      <main className="relative min-h-0 flex-1">
        <AtlasFlow data={data} />
      </main>
    </div>
  );
}
