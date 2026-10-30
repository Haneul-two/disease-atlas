// 관리자 인증 — 단일 비밀번호(env) + httpOnly 쿠키 세션 (서버 전용).
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "da_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간 (초)

/**
 * 세션 서명 키. 비밀번호에 DATABASE_URL을 섞어, 쿠키가 새도 비밀번호를 오프라인으로 추측할 수 없게 한다.
 * 비밀번호를 바꾸면 키가 바뀌어 기존 세션이 모두 무효가 된다.
 */
function signingKey(): Buffer | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256")
    .update(`disease-atlas-session|${pw}|${process.env.DATABASE_URL ?? ""}`)
    .digest();
}

function sign(key: Buffer, issuedAt: number): string {
  return createHmac("sha256", key).update(String(issuedAt)).digest("hex");
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

/** 로그인 성공 시 쿠키에 담을 토큰 — "발급시각.서명" */
export function sessionToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const issuedAt = Math.floor(Date.now() / 1000);
  return `${issuedAt}.${sign(key, issuedAt)}`;
}

// ── 로그인 시도 제한 ──────────────────────────────────
// IP별로 15분에 5번까지 실패를 허용한다. 서버 인스턴스 메모리 기준이라
// 인스턴스가 여러 개면 각자 센다(완벽한 차단이 아니라 대입 속도를 크게 늦추는 장치).
const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_IPS = 10_000; // 다수 IP로 기록을 부풀리는 것을 막는 상한
const failures = new Map<string, { count: number; resetAt: number }>();

/** 이 IP가 지금 로그인을 시도할 수 없는 상태인지 */
export function loginBlocked(ip: string): boolean {
  const entry = failures.get(ip);
  return !!entry && entry.resetAt > Date.now() && entry.count >= MAX_FAILURES;
}

/** 로그인 실패 1회 기록 */
export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  // 넣은 순서 = 만료 순서라서, 앞에서부터 만료된 것만 지우고 멈춘다.
  for (const [k, v] of failures) {
    if (v.resetAt > now) break;
    failures.delete(k);
  }
  const entry = failures.get(ip);
  if (entry) {
    entry.count += 1;
    return;
  }
  if (failures.size >= MAX_TRACKED_IPS) failures.delete(failures.keys().next().value!);
  failures.set(ip, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
}

/** 로그인 성공 시 실패 기록 삭제 */
export function clearLoginFailures(ip: string): void {
  failures.delete(ip);
}

/** 관리자 비밀번호가 환경에 설정돼 있는지 */
export function adminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

/** 현재 요청이 인증된 관리자 세션인지 */
export async function isAuthed(): Promise<boolean> {
  const key = signingKey();
  if (!key) return false;
  const store = await cookies();
  const got = store.get(ADMIN_COOKIE)?.value;
  if (!got) return false;

  const [issuedAtStr, signature] = got.split(".");
  const issuedAt = Number(issuedAtStr);
  if (!Number.isInteger(issuedAt) || !signature) return false;
  // 만료는 브라우저가 아니라 서버가 판정한다 (미래 시각 토큰도 거부)
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age > SESSION_MAX_AGE) return false;
  return safeEqual(signature, sign(key, issuedAt));
}
