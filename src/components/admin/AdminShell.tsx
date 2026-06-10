"use client";
// 관리자 탭 셸 — 질병/계통/증상/관계 패널 전환.
import { useState } from "react";
import type { AdminData } from "@/lib/admin-data";
import DiseasePanel from "./DiseasePanel";
import CategoryPanel from "./CategoryPanel";
import SymptomPanel from "./SymptomPanel";
import RelationPanel from "./RelationPanel";

type Tab = "disease" | "category" | "symptom" | "relation";

export default function AdminShell({ data }: { data: AdminData }) {
  const [tab, setTab] = useState<Tab>("disease");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "disease", label: "질병", count: data.diseases.length },
    { key: "category", label: "계통", count: data.categories.length },
    { key: "symptom", label: "증상", count: data.symptoms.length },
    { key: "relation", label: "관계", count: data.relations.length },
  ];

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 rounded-md border px-3.5 py-2 text-[13.5px] transition-colors"
              style={{
                fontFamily: "var(--f-plex-kr)",
                borderColor: on ? "var(--bone)" : "var(--line)",
                background: on ? "var(--ink-750)" : "transparent",
                color: on ? "var(--bone-bright)" : "var(--muted)",
              }}
            >
              {t.label}
              <span
                className="rounded px-1.5 text-[11px]"
                style={{
                  fontFamily: "var(--f-plex-mono)",
                  background: on ? "var(--ink-800)" : "var(--ink-800)",
                  color: "var(--muted)",
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </nav>

      {tab === "disease" && (
        <DiseasePanel
          diseases={data.diseases}
          bodyParts={data.bodyParts}
          categories={data.categories}
        />
      )}
      {tab === "category" && <CategoryPanel categories={data.categories} />}
      {tab === "symptom" && <SymptomPanel symptoms={data.symptoms} />}
      {tab === "relation" && (
        <RelationPanel relations={data.relations} diseases={data.diseases} />
      )}
    </div>
  );
}
