"use client";
// 질병 CRUD — 상단 편집 폼 + 하단 목록. 행의 "편집"이 폼에 값을 채운다.
import { useActionState, useState } from "react";
import type { AdminBodyPart, AdminCategory, AdminDisease } from "@/lib/admin-data";
import { deleteDisease, saveDisease } from "@/app/admin/actions";
import { fieldCls, Field, Notice, SubmitButton, DeleteButton } from "./ui";

type Props = {
  diseases: AdminDisease[];
  bodyParts: AdminBodyPart[];
  categories: AdminCategory[];
};

export default function DiseasePanel({ diseases, bodyParts, categories }: Props) {
  const [editing, setEditing] = useState<AdminDisease | null>(null);

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <DiseaseForm
        key={editing?.id ?? "new"}
        editing={editing}
        bodyParts={bodyParts}
        categories={categories}
        onDone={() => setEditing(null)}
      />

      {/* 목록 */}
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-medium text-[var(--paper)]">
            질병 목록 <span className="text-[var(--muted)]">({diseases.length})</span>
          </h2>
        </div>
        <ul className="space-y-1.5">
          {diseases.map((d) => {
            const on = editing?.id === d.id;
            return (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors"
                style={{
                  borderColor: on ? "var(--bone)" : "var(--line)",
                  background: on ? "var(--ink-750)" : "var(--ink-800)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[var(--paper)]">
                    {d.name}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]"
                    style={{ fontFamily: "var(--f-plex-kr)" }}
                  >
                    {d.bodyPartName}
                    {d.categoryName ? ` · ${d.categoryName}` : ""}
                    {d.symptoms.length ? ` · ${d.symptoms.join(", ")}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(d)}
                  className="rounded px-2 py-1 text-[12px] text-[var(--paper-dim)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--bone-bright)]"
                >
                  편집
                </button>
                <form action={deleteDisease}>
                  <input type="hidden" name="id" value={d.id} />
                  <DeleteButton confirmLabel={d.name} />
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DiseaseForm({
  editing,
  bodyParts,
  categories,
  onDone,
}: {
  editing: AdminDisease | null;
  bodyParts: AdminBodyPart[];
  categories: AdminCategory[];
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveDisease, null);

  return (
    <form
      action={action}
      className="h-fit space-y-4 rounded-xl border border-[var(--line)] bg-[var(--ink-800)]/70 p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[var(--paper)]">
          {editing ? "질병 편집" : "새 질병"}
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

      <Field label="질병명">
        <input name="name" defaultValue={editing?.name ?? ""} className={fieldCls} required />
      </Field>

      <Field label="의학용어 (선택)">
        <input
          name="medicalTerm"
          defaultValue={editing?.medicalTerm ?? ""}
          className={fieldCls}
          placeholder="Hashimoto thyroiditis"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="부위">
          <select name="bodyPartId" defaultValue={editing?.bodyPartId ?? ""} className={fieldCls} required>
            <option value="" disabled>
              선택…
            </option>
            {bodyParts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="계통 (선택)">
          <select name="categoryId" defaultValue={editing?.categoryId ?? ""} className={fieldCls}>
            <option value="">없음</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="설명">
        <textarea
          name="description"
          defaultValue={editing?.description ?? ""}
          rows={3}
          className={`${fieldCls} resize-y`}
          required
        />
      </Field>

      <Field label="치료법">
        <textarea
          name="treatment"
          defaultValue={editing?.treatment ?? ""}
          rows={2}
          className={`${fieldCls} resize-y`}
          required
        />
      </Field>

      <Field label="증상 (콤마로 구분)">
        <input
          name="symptoms"
          defaultValue={editing?.symptoms.join(", ") ?? ""}
          className={fieldCls}
          placeholder="두통, 메스꺼움, 어지럼"
        />
      </Field>

      <Field label="slug (비우면 자동 생성)">
        <input
          name="slug"
          defaultValue={editing?.slug ?? ""}
          className={`${fieldCls} font-mono text-[13px]`}
          placeholder="migraine"
        />
      </Field>

      <Notice state={state} />
      <div className="flex items-center gap-2">
        <SubmitButton>{editing ? "수정 저장" : "추가"}</SubmitButton>
      </div>
    </form>
  );
}
