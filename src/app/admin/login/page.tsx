// 관리자 로그인 — 단일 비밀번호. 이미 인증돼 있으면 대시보드로.
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminConfigured, isAuthed } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");
  const configured = adminConfigured();

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
      <div className="w-[min(380px,100%)]">
        <Link
          href="/"
          className="mb-6 inline-block text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--paper-dim)]"
        >
          ← 아틀라스로
        </Link>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--ink-800)]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p
            className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            Atlas · Admin
          </p>
          <h1
            className="mt-1.5 text-[22px] text-[var(--paper)]"
            style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
          >
            관리자 로그인
          </h1>

          {configured ? (
            <LoginForm />
          ) : (
            <p
              className="mt-5 rounded-md border border-[#e0607a55] bg-[#e0607a14] px-3 py-2.5 text-[12.5px] text-[#f0a8b6]"
              style={{ fontFamily: "var(--f-plex-kr)" }}
            >
              서버에 <code className="font-mono">ADMIN_PASSWORD</code> 환경변수가 설정되지
              않았습니다. <code className="font-mono">.env</code>에 추가한 뒤 다시 시도하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
