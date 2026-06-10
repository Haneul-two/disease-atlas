"use client";
// 계통(분류) CRUD — 이름만 편집, slug는 비우면 자동.
import { useActionState, useState } from "react";
import type { AdminCategory } from "@/lib/admin-data";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { fieldCls, Field, Notice, SubmitButton, DeleteButton } from "./ui";

export default function CategoryPanel({ categories }: { categories: AdminCategory[] }) {
  const [editing, setEditing] = useState<AdminCategory | null>(null);

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <CategoryForm key={editing?.id ?? "new"} editing={editing} onDone={() => setEditing(null)} />

      <div className="min-w-0">
        <h2 className="mb-3 text-[14px] font-medium text-[var(--paper)]">
          계통 목록 <span className="text-[var(--muted)]">({categories.length})</span>
        </h2>
        <ul className="space-y-1.5">
          {categories.map((c) => {
            const on = editing?.id === c.id;
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5"
                style={{
                  borderColor: on ? "var(--bone)" : "var(--line)",
                  background: on ? "var(--ink-750)" : "var(--ink-800)",
                }}
              >
                <span className="flex-1 truncate text-[14px] text-[var(--paper)]">{c.name}</span>
                <span
                  className="text-[11px] text-[var(--muted)]"
                  style={{ fontFamily: "var(--f-plex-mono)" }}
                >
                  질병 {c.diseaseCount}
                </span>
                <button
                  onClick={() => setEditing(c)}
                  className="rounded px-2 py-1 text-[12px] text-[var(--paper-dim)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
                >
                  편집
                </button>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <DeleteButton confirmLabel={c.name} />
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CategoryForm({
  editing,
  onDone,
}: {
  editing: AdminCategory | null;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveCategory, null);
  return (
    <form
      action={action}
      className="h-fit space-y-4 rounded-xl border border-[var(--line)] bg-[var(--ink-800)]/70 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[var(--paper)]">
          {editing ? "계통 편집" : "새 계통"}
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
      <Field label="계통명">
        <input name="name" defaultValue={editing?.name ?? ""} className={fieldCls} required />
      </Field>
      {!editing && (
        <Field label="slug (비우면 자동 생성)">
          <input name="slug" className={`${fieldCls} font-mono text-[13px]`} placeholder="infection" />
        </Field>
      )}
      <Notice state={state} />
      <SubmitButton>{editing ? "수정 저장" : "추가"}</SubmitButton>
    </form>
  );
}
