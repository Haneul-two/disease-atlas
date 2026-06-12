"use server";
// 관리자 변이 — 로그인/로그아웃 + 질병·계통·증상·관계 CRUD.
// 모든 변이는 인증 세션을 요구하고, 성공 시 Atlas(`/`)와 대시보드를 재검증한다.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, checkPassword, isAuthed, sessionToken } from "@/lib/auth";

export type ActionResult = { ok: boolean; error?: string; message?: string };

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("UNAUTHORIZED");
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/");
}

/** 이름에서 slug 후보를 만들고, 아스키가 부족하면(한글 등) 랜덤 접미사. */
function genSlug(prefix: string, name: string): string {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii.length >= 2) return ascii;
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

function str(fd: FormData, key: string): string {
  return (fd.get(key) ?? "").toString().trim();
}

// ── 인증 ────────────────────────────────────────────

export async function loginAction(
  _prev: ActionResult | null,
  fd: FormData
): Promise<ActionResult> {
  const pw = str(fd, "password");
  if (!checkPassword(pw)) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }
  const token = sessionToken();
  if (!token) return { ok: false, error: "서버에 관리자 비밀번호가 설정되지 않았습니다." };

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12, // 12시간
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ── 질병 ────────────────────────────────────────────

/** 콤마/줄바꿈으로 구분된 증상 입력을 정규화 */
function parseSymptoms(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const name = part.trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

export async function saveDisease(
  _prev: ActionResult | null,
  fd: FormData
): Promise<ActionResult> {
  await requireAuth();

  const id = str(fd, "id");
  const name = str(fd, "name");
  const medicalTerm = str(fd, "medicalTerm") || null;
  const description = str(fd, "description");
  const treatment = str(fd, "treatment");
  const bodyPartId = str(fd, "bodyPartId");
  const categoryId = str(fd, "categoryId") || null;
  const slugInput = str(fd, "slug");
  const symptomNames = parseSymptoms(str(fd, "symptoms"));

  if (!name) return { ok: false, error: "질병명을 입력하세요." };
  if (!bodyPartId) return { ok: false, error: "부위를 선택하세요." };
  if (!description) return { ok: false, error: "설명을 입력하세요." };
  if (!treatment) return { ok: false, error: "치료법을 입력하세요." };

  try {
    await prisma.$transaction(async (tx) => {
      const slug = slugInput || genSlug("disease", name);
      const base = { name, slug, medicalTerm, description, treatment, bodyPartId, categoryId };

      const disease = id
        ? await tx.disease.update({ where: { id }, data: base })
        : await tx.disease.create({ data: base });

      // 증상 마스터 upsert + 조인 재구성
      const symptomIds: string[] = [];
      for (const sName of symptomNames) {
        const s = await tx.symptom.upsert({
          where: { name: sName },
          update: {},
          create: { name: sName },
        });
        symptomIds.push(s.id);
      }
      await tx.diseaseSymptom.deleteMany({
        where: {
          diseaseId: disease.id,
          symptomId: { notIn: symptomIds.length ? symptomIds : ["__none__"] },
        },
      });
      for (const symptomId of symptomIds) {
        await tx.diseaseSymptom.upsert({
          where: { diseaseId_symptomId: { diseaseId: disease.id, symptomId } },
          update: {},
          create: { diseaseId: disease.id, symptomId },
        });
      }
    });

    revalidateAll();
    return { ok: true, message: id ? "질병을 수정했습니다." : "질병을 추가했습니다." };
  } catch (e) {
    return { ok: false, error: uniqueMsg(e, "이미 같은 이름 또는 slug의 질병이 있습니다.") };
  }
}

export async function deleteDisease(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  if (!id) return;
  await prisma.disease.delete({ where: { id } });
  revalidateAll();
}

// ── 계통 ────────────────────────────────────────────

export async function saveCategory(
  _prev: ActionResult | null,
  fd: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = str(fd, "id");
  const name = str(fd, "name");
  const slugInput = str(fd, "slug");
  if (!name) return { ok: false, error: "계통명을 입력하세요." };
  try {
    if (id) {
      await prisma.category.update({ where: { id }, data: { name } });
    } else {
      await prisma.category.create({ data: { name, slug: slugInput || genSlug("cat", name) } });
    }
    revalidateAll();
    return { ok: true, message: id ? "계통을 수정했습니다." : "계통을 추가했습니다." };
  } catch (e) {
    return { ok: false, error: uniqueMsg(e, "이미 같은 이름 또는 slug의 계통이 있습니다.") };
  }
}

export async function deleteCategory(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  if (!id) return;
  // 질병의 categoryId는 자동으로 null 처리되지 않으므로 먼저 끊는다.
  await prisma.disease.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });
  revalidateAll();
}

// ── 증상 ────────────────────────────────────────────

export async function saveSymptom(
  _prev: ActionResult | null,
  fd: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "증상명을 입력하세요." };
  try {
    if (id) {
      await prisma.symptom.update({ where: { id }, data: { name } });
    } else {
      await prisma.symptom.create({ data: { name } });
    }
    revalidateAll();
    return { ok: true, message: id ? "증상명을 수정했습니다." : "증상을 추가했습니다." };
  } catch (e) {
    return { ok: false, error: uniqueMsg(e, "이미 같은 이름의 증상이 있습니다.") };
  }
}

export async function deleteSymptom(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  if (!id) return;
  await prisma.symptom.delete({ where: { id } }); // 조인은 cascade
  revalidateAll();
}

// ── 관계 ────────────────────────────────────────────

export async function saveRelation(
  _prev: ActionResult | null,
  fd: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = str(fd, "id");
  const fromId = str(fd, "fromId");
  const toId = str(fd, "toId");
  const type = str(fd, "type") || "comorbidity";
  const note = str(fd, "note") || null;
  if (!fromId || !toId) return { ok: false, error: "두 질병을 모두 선택하세요." };
  if (fromId === toId) return { ok: false, error: "서로 다른 질병을 선택하세요." };
  try {
    if (id) {
      await prisma.diseaseRelation.update({ where: { id }, data: { fromId, toId, type, note } });
    } else {
      await prisma.diseaseRelation.create({ data: { fromId, toId, type, note } });
    }
    revalidateAll();
    return { ok: true, message: id ? "관계를 수정했습니다." : "관계를 추가했습니다." };
  } catch (e) {
    return { ok: false, error: uniqueMsg(e, "이미 같은 방향·유형의 관계가 있습니다.") };
  }
}

export async function deleteRelation(fd: FormData) {
  await requireAuth();
  const id = str(fd, "id");
  if (!id) return;
  await prisma.diseaseRelation.delete({ where: { id } });
  revalidateAll();
}

/** Prisma 고유키 위반(P2002)이면 친절한 메시지로, 아니면 일반 오류. */
function uniqueMsg(e: unknown, dup: string): string {
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return dup;
  return "저장 중 오류가 발생했습니다.";
}
