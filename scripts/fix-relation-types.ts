// 일회성 스크립트 — v1.2에서 type이 바뀐 기존 관계를 정정한다.
// upsert 키가 (fromId,toId,type)이라 시드만 돌리면 옛 type의 행이 유령으로 남기 때문.
// dry-run:  npx tsx scripts/fix-relation-types.ts
// 실제 적용: npx tsx scripts/fix-relation-types.ts --apply
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { relations } from "../prisma/seed-data";

const APPLY = process.argv.includes("--apply");

type Plan = {
  id: string;
  from: string;
  to: string;
  oldType: string;
  newType: string;
  note: string;
  action: "update" | "delete";
};

async function main() {
  const diseases = await prisma.disease.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(diseases.map((d) => [d.slug, d.id]));
  const slugById = new Map(diseases.map((d) => [d.id, d.slug]));

  // seed-data가 의도하는 (fromId,toId) → type/note
  const wanted = new Map<string, { type: string; note: string }>();
  for (const r of relations) {
    const fromId = idBySlug.get(r.from);
    const toId = idBySlug.get(r.to);
    if (!fromId || !toId) continue;
    wanted.set(`${fromId}__${toId}`, { type: r.type, note: r.note });
  }

  const existing = await prisma.diseaseRelation.findMany();

  // (fromId,toId) 쌍별로 묶는다 — 같은 쌍에 유령 행이 두 개 이상 남아 있는 경우까지 다뤄야 한다.
  const byPair = new Map<string, typeof existing>();
  for (const e of existing) {
    const key = `${e.fromId}__${e.toId}`;
    const list = byPair.get(key);
    if (list) list.push(e);
    else byPair.set(key, [e]);
  }

  const plan: Plan[] = [];
  for (const [key, want] of wanted) {
    const rows = byPair.get(key);
    if (!rows) continue; // DB에 아직 없는 관계 — seed가 새로 만든다(정정 대상 아님). 프루닝도 하지 않는다.

    const stale = rows.filter((r) => r.type !== want.type);
    if (stale.length === 0) continue;

    // 이미 올바른 type의 행이 있으면 유령 행은 전부 지운다.
    // 없으면 유령 행 중 하나만 갱신하고 나머지는 지운다 — 여러 개를 동시에 같은 type으로
    // 갱신하면 (fromId,toId,type) 유니크 키 충돌이 나기 때문이다.
    const alreadyCorrect = rows.some((r) => r.type === want.type);
    stale.forEach((e, i) => {
      const action: Plan["action"] = alreadyCorrect || i > 0 ? "delete" : "update";
      plan.push({
        id: e.id,
        from: slugById.get(e.fromId) ?? e.fromId,
        to: slugById.get(e.toId) ?? e.toId,
        oldType: e.type,
        newType: want.type,
        note: want.note,
        action,
      });
    });
  }

  console.log(`정정 대상 ${plan.length}건${APPLY ? " (적용)" : " (dry-run — 적용하려면 --apply)"}`);
  for (const p of plan)
    console.log(`  ${p.action.padEnd(6)} ${p.from} → ${p.to}: ${p.oldType} ⇒ ${p.newType}`);

  if (!APPLY) return;

  for (const p of plan) {
    if (p.action === "delete") {
      await prisma.diseaseRelation.delete({ where: { id: p.id } });
    } else {
      await prisma.diseaseRelation.update({
        where: { id: p.id },
        data: { type: p.newType, note: p.note },
      });
    }
  }
  console.log("✅ 정정 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
