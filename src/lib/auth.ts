// 관리자 인증 — 단일 비밀번호(env) + httpOnly 쿠키 세션 (서버 전용).
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "da_admin";

/** 비밀번호에서 파생한 세션 토큰(해시) — 쿠키엔 원문 대신 이 값을 담는다. */
function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`disease-atlas|${pw}`).digest("hex");
}

/** 길이까지 포함해 상수시간 비교 (timingSafeEqual은 길이 다르면 throw) */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** 입력 비밀번호가 env와 일치하는지 */
export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

/** 로그인 성공 시 쿠키에 담을 토큰 */
export function sessionToken(): string | null {
  return expectedToken();
}

/** 관리자 비밀번호가 환경에 설정돼 있는지 */
export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

/** 현재 요청이 인증된 관리자 세션인지 */
export async function isAuthed(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const store = await cookies();
  const got = store.get(ADMIN_COOKIE)?.value;
  return !!got && safeEqual(got, expected);
}
