"use client";
// 합병·연관 관계 CRUD — 두 질병 사이의 수동 엣지(방향·유형·메모).
import { useActionState, useState } from "react";
import type { AdminDisease, AdminRelation } from "@/lib/admin-data";
import { deleteRelation, saveRelation } from "@/app/admin/actions";
import { fieldCls, Field, Notice, SubmitButton, DeleteButton } from "./ui";

const TYPES = [
  { value: "comorbidity", label: "합병·연관" },
  { value: "progression", label: "진행" },
];

function typeLabel(v: string) {
  return TYPES.find((t) => t.value === v)?.label ?? v;
}

export default function RelationPanel({
  relations,
  diseases,
}: {
  relations: AdminRelation[];
  diseases: AdminDisease[];
}) {
  const [editing, setEditing] = useState<AdminRelation | null>(null);

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <RelationForm
        key={editing?.id ?? "new"}
        editing={editing}
        diseases={diseases}
        onDone={() => setEditing(null)}
      />

      <div className="min-w-0">
        <h2 className="mb-3 text-[14px] font-medium text-[var(--paper)]">
          관계 목록 <span className="text-[var(--muted)]">({relations.length})</span>
        </h2>
        <ul className="space-y-1.5">
          {relations.map((r) => {
            const on = editing?.id === r.id;
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5"
                style={{
                  borderColor: on ? "var(--bone)" : "var(--line)",
                  background: on ? "var(--ink-750)" : "var(--ink-800)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] text-[var(--paper)]">
                    {r.fromName} <span className="text-[var(--muted)]">→</span> {r.toName}
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 text-[10.5px] text-[#f0a8b6]"
                      style={{ background: "#e0607a1f", fontFamily: "var(--f-plex-mono)" }}
                    >
                      {typeLabel(r.type)}
                    </span>
                  </p>
                  {r.note && (
                    <p
                      className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]"
                      style={{ fontFamily: "var(--f-plex-kr)" }}
                    >
                      {r.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditing(r)}
                  className="rounded px-2 py-1 text-[12px] text-[var(--paper-dim)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
                >
                  편집
                </button>
                <form action={deleteRelation}>
                  <input type="hidden" name="id" value={r.id} />
                  <DeleteButton confirmLabel={`${r.fromName} → ${r.toName}`} />
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function RelationForm({
  editing,
  diseases,
  onDone,
}: {
  editing: AdminRelation | null;
  diseases: AdminDisease[];
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveRelation, null);
  return (
    <form
      action={action}
      className="h-fit space-y-4 rounded-xl border border-[var(--line)] bg-[var(--ink-800)]/70 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[var(--paper)]">
          {editing ? "관계 편집" : "새 관계"}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={onDone}
            className="text-[12px] text-[var(--muted)] hover:text-[var(--paper-dim)]"
          >
            ＋ 새로 작성
          </button>
        )}
      </div>
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <Field label="시작 질병">
        <select name="fromId" defaultValue={editing?.fromId ?? ""} className={fieldCls} required>
          <option value="" disabled>
            선택…
          </option>
          {diseases.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="연결 질병">
        <select name="toId" defaultValue={editing?.toId ?? ""} className={fieldCls} required>
          <option value="" disabled>
            선택…
          </option>
          {diseases.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="유형">
        <select name="type" defaultValue={editing?.type ?? "comorbidity"} className={fieldCls}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="메모 (선택)">
        <input
          name="note"
          defaultValue={editing?.note ?? ""}
          className={fieldCls}
          placeholder="고혈압은 뇌졸중의 주요 위험인자"
        />
      </Field>

      <Notice state={state} />
      <SubmitButton>{editing ? "수정 저장" : "추가"}</SubmitButton>
    </form>
  );
}
