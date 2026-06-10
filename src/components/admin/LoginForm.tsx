"use client";
// 로그인 폼 — useActionState로 오류 메시지 표시, 성공 시 액션이 리다이렉트.
import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { fieldCls, Field, Notice, SubmitButton } from "./ui";

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, null);

  return (
    <form action={action} className="mt-5 space-y-4">
      <Field label="비밀번호">
        <input
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className={fieldCls}
          placeholder="••••••••"
        />
      </Field>
      <Notice state={state} />
      <SubmitButton>로그인</SubmitButton>
    </form>
  );
}
