"use client";
// 증상 마스터 CRUD — 이름 추가/수정/삭제. 삭제 시 질병 연결도 함께 사라진다.
import { useActionState, useState } from "react";
import type { AdminSymptom } from "@/lib/admin-data";
import { deleteSymptom, saveSymptom } from "@/app/admin/actions";
import { fieldCls, Field, Notice, SubmitButton, DeleteButton } from "./ui";

export default function SymptomPanel({ symptoms }: { symptoms: AdminSymptom[] }) {
  const [editing, setEditing] = useState<AdminSymptom | null>(null);

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <SymptomForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} />

      <div className="min-w-0">
        <h2 className="mb-3 text-[14px] font-medium text-[var(--paper)]">
          증상 목록 <span className="text-[var(--muted)]">({symptoms.length})</span>
        </h2>
        <ul className="flex flex-wrap gap-1.5">
          {symptoms.map((s) => {
            const on = editing?.id === s.id;
            return (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                style={{
                  borderColor: on ? "var(--bone)" : "var(--line)",
                  background: on ? "var(--ink-750)" : "var(--ink-800)",
                }}
              >
                <button
                  onClick={() => setEditing(s)}
                  className="text-[13px] text-[var(--paper)] transition-colors hover:text-[var(--bone-bright)]"
                  title="편집"
                >
                  {s.name}
                </button>
                <span
                  className="text-[10.5px] text-[var(--muted)]"
                  style={{ fontFamily: "var(--f-plex-mono)" }}
                >
                  {s.diseaseCount}
                </span>
                <form action={deleteSymptom} className="flex">
                  <input type="hidden" name="id" value={s.id} />
                  <DeleteButton confirmLabel={s.name} />
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SymptomForm({
  editing,
  onDone,
}: {
  editing: AdminSymptom | null;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveSymptom, null);
  return (
    <form
      action={action}
      className="h-fit space-y-4 rounded-xl border border-[var(--line)] bg-[var(--ink-800)]/70 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[var(--paper)]">
          {editing ? "증상명 편집" : "새 증상"}
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
      <Field label="증상명">
        <input name="name" defaultValue={editing?.name ?? ""} className={fieldCls} required />
      </Field>
      <Notice state={state} />
      <SubmitButton>{editing ? "수정 저장" : "추가"}</SubmitButton>
      <p className="text-[11px] leading-relaxed text-[var(--muted)]" style={{ fontFamily: "var(--f-plex-kr)" }}>
        증상은 질병 편집 화면에서 콤마로 입력하면 자동 생성됩니다. 여기선 이름 수정·정리·삭제에 사용하세요.
      </p>
    </form>
  );
}
