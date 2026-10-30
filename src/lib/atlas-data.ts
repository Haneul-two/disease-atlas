// Disease Atlas — DB → Atlas 그래프 데이터 (서버 전용)
import { prisma } from "./prisma";
import { deriveEdges } from "./atlas-layout";
import { anatomicalPositions } from "./atlas-anatomy";
import { toRelationType } from "./atlas-types";
import type { AtlasData, AtlasNode } from "./atlas-types";

/** 질병/부위/관계를 읽어 노드(해부학적 좌표 포함)와 엣지를 만든다. */
export async function getAtlasGraph(): Promise<AtlasData> {
  const [bodyParts, diseases, relations] = await Promise.all([
    prisma.bodyPart.findMany({ orderBy: { order: "asc" } }),
    prisma.disease.findMany({
      include: {
        bodyPart: true,
        category: true,
        symptoms: { include: { symptom: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.diseaseRelation.findMany(),
  ]);

  const positions = anatomicalPositions(diseases.map(d => ({
    slug: d.slug, layoutZone: d.bodyPart.layoutZone,
  })));

  const nodes: AtlasNode[] = diseases.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    medicalTerm: d.medicalTerm,
    description: d.description,
    treatment: d.treatment,
    bodyPartSlug: d.bodyPart.slug,
    bodyPartName: d.bodyPart.name,
    color: d.bodyPart.color,
    layoutZone: d.bodyPart.layoutZone,
    categoryName: d.category?.name ?? null,
    symptoms: d.symptoms.map((s) => s.symptom.name),
    position: positions.get(d.slug) ?? { x: 0, y: 0 },
  }));

  const edges = deriveEdges(
    nodes.map((n) => ({
      id: n.id,
      bodyPartSlug: n.bodyPartSlug,
      categoryName: n.categoryName,
      symptoms: n.symptoms,
    })),
    relations.map((r) => ({
      fromId: r.fromId,
      toId: r.toId,
      type: toRelationType(r.type),
      note: r.note,
    }))
  );

  return {
    nodes,
    edges,
    bodyParts: bodyParts.map((b) => ({
      slug: b.slug,
      name: b.name,
      color: b.color,
      layoutZone: b.layoutZone,
    })),
  };
}
