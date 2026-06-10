// Disease Atlas — DB → Atlas 그래프 데이터 (서버 전용)
import { prisma } from "./prisma";
import { deriveEdges, zonePositions } from "./atlas-layout";
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

  // 부위(zone)별로 묶어 좌표 배치
  const byZone = new Map<string, typeof diseases>();
  for (const d of diseases) {
    const zone = d.bodyPart.layoutZone;
    const list = byZone.get(zone) ?? [];
    list.push(d);
    byZone.set(zone, list);
  }

  const positionById = new Map<string, { x: number; y: number }>();
  for (const [zone, list] of byZone) {
    const coords = zonePositions(zone, list.length);
    list.forEach((d, i) => positionById.set(d.id, coords[i]));
  }

  const nodes: AtlasNode[] = diseases.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description,
    treatment: d.treatment,
    bodyPartSlug: d.bodyPart.slug,
    bodyPartName: d.bodyPart.name,
    color: d.bodyPart.color,
    layoutZone: d.bodyPart.layoutZone,
    categoryName: d.category?.name ?? null,
    symptoms: d.symptoms.map((s) => s.symptom.name),
    position: positionById.get(d.id) ?? { x: 0, y: 0 },
  }));

  const edges = deriveEdges(
    nodes.map((n) => ({
      id: n.id,
      bodyPartSlug: n.bodyPartSlug,
      categoryName: n.categoryName,
      symptoms: n.symptoms,
    })),
    relations.map((r) => ({ fromId: r.fromId, toId: r.toId, note: r.note }))
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
