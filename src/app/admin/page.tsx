// 관리자 대시보드 — 인증 가드 후 모든 엔티티를 불러와 탭 UI로 렌더.
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAdminData } from "@/lib/admin-data";
import { logoutAction } from "./actions";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const data = await getAdminData();

  return (
    <div className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-5 py-8">
      <header className="mb-7 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
            style={{ fontFamily: "var(--f-plex-mono)" }}
          >
            Atlas · Admin
          </p>
          <h1
            className="mt-1 text-[26px] text-[var(--paper)]"
            style={{ fontFamily: "var(--f-gowun)", fontWeight: 700 }}
          >
            콘텐츠 관리
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[12.5px] text-[var(--muted)] transition-colors hover:text-[var(--paper-dim)]"
          >
            아틀라스 보기 →
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[12.5px] text-[var(--paper-dim)] transition-colors hover:bg-[var(--ink-700)] hover:text-[var(--paper)]"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <AdminShell data={data} />

      <p
        className="mt-10 text-center text-[11px] text-[var(--muted)]"
        style={{ fontFamily: "var(--f-plex-kr)" }}
      >
        교육용 자료 관리 화면 · 콘텐츠의 의학적 정확성 책임은 관리자에게 있습니다.
      </p>
    </div>
  );
}
