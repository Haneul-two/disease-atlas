import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { bodyParts, categories, diseases, relations } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const bpMap: Record<string, string> = {};
  for (const bp of bodyParts) {
    const r = await prisma.bodyPart.upsert({
      where: { slug: bp.slug },
      update: { name: bp.name, color: bp.color, layoutZone: bp.layoutZone, order: bp.order },
      create: bp,
    });
    bpMap[bp.slug] = r.id;
  }

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const r = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    catMap[c.slug] = r.id;
  }

  const dMap: Record<string, string> = {};
  for (const d of diseases) {
    const data = {
      name: d.name,
      description: d.description,
      treatment: d.treatment,
      bodyPartId: bpMap[d.bodyPart],
      categoryId: d.category ? catMap[d.category] : null,
    };
    const r = await prisma.disease.upsert({
      where: { slug: d.slug },
      update: data,
      create: { slug: d.slug, ...data },
    });
    dMap[d.slug] = r.id;

    for (const sName of d.symptoms) {
      const s = await prisma.symptom.upsert({
        where: { name: sName },
        update: {},
        create: { name: sName },
      });
      await prisma.diseaseSymptom.upsert({
        where: { diseaseId_symptomId: { diseaseId: r.id, symptomId: s.id } },
        update: {},
        create: { diseaseId: r.id, symptomId: s.id },
      });
    }
  }

  for (const rel of relations) {
    await prisma.diseaseRelation.upsert({
      where: {
        fromId_toId_type: { fromId: dMap[rel.from], toId: dMap[rel.to], type: rel.type },
      },
      update: { note: rel.note ?? null },
      create: { fromId: dMap[rel.from], toId: dMap[rel.to], type: rel.type, note: rel.note ?? null },
    });
  }

  const counts = {
    bodyParts: await prisma.bodyPart.count(),
    categories: await prisma.category.count(),
    symptoms: await prisma.symptom.count(),
    diseases: await prisma.disease.count(),
    relations: await prisma.diseaseRelation.count(),
  };
  console.log("✅ Seed 완료:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
