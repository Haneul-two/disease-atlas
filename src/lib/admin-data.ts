// 관리자 대시보드용 데이터 로더 (서버 전용) — 모든 엔티티를 한 번에 읽는다.
import { prisma } from "./prisma";

export type AdminDisease = {
  id: string;
  name: string;
  slug: string;
  description: string;
  treatment: string;
  bodyPartId: string;
  bodyPartName: string;
  categoryId: string | null;
  categoryName: string | null;
  symptoms: string[];
};

export type AdminBodyPart = { id: string; name: string };
export type AdminCategory = { id: string; name: string; slug: string; diseaseCount: number };
export type AdminSymptom = { id: string; name: string; diseaseCount: number };
export type AdminRelation = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  type: string;
  note: string | null;
};

export type AdminData = {
  diseases: AdminDisease[];
  bodyParts: AdminBodyPart[];
  categories: AdminCategory[];
  symptoms: AdminSymptom[];
  relations: AdminRelation[];
};

export async function getAdminData(): Promise<AdminData> {
  const [bodyParts, categories, symptoms, diseases, relations] = await Promise.all([
    prisma.bodyPart.findMany({ orderBy: { order: "asc" } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { diseases: true } } },
    }),
    prisma.symptom.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { diseases: true } } },
    }),
    prisma.disease.findMany({
      orderBy: { name: "asc" },
      include: {
        bodyPart: true,
        category: true,
        symptoms: { include: { symptom: true } },
      },
    }),
    prisma.diseaseRelation.findMany({
      include: { from: true, to: true },
    }),
  ]);

  return {
    bodyParts: bodyParts.map((b) => ({ id: b.id, name: b.name })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      diseaseCount: c._count.diseases,
    })),
    symptoms: symptoms.map((s) => ({
      id: s.id,
      name: s.name,
      diseaseCount: s._count.diseases,
    })),
    diseases: diseases.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      description: d.description,
      treatment: d.treatment,
      bodyPartId: d.bodyPartId,
      bodyPartName: d.bodyPart.name,
      categoryId: d.categoryId,
      categoryName: d.category?.name ?? null,
      symptoms: d.symptoms.map((s) => s.symptom.name),
    })),
    relations: relations.map((r) => ({
      id: r.id,
      fromId: r.fromId,
      fromName: r.from.name,
      toId: r.toId,
      toName: r.to.name,
      type: r.type,
      note: r.note,
    })),
  };
}
