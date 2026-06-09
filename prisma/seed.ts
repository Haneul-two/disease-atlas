// Disease Atlas — 시드 데이터 (교육용 · 비의학적)
// 부위 5개 / 계통 분류 / 질병 25개 / 증상 / 합병·연관 관계
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type Seedable = { slug: string };

const bodyParts = [
  { slug: "brain", name: "뇌·신경", color: "#7aa2ff", layoutZone: "head", order: 1 },
  { slug: "chest", name: "가슴", color: "#e15b5b", layoutZone: "chest", order: 2 },
  { slug: "abdomen", name: "복부", color: "#e0a94f", layoutZone: "abdomen", order: 3 },
  { slug: "joint", name: "관절", color: "#56c596", layoutZone: "limbs", order: 4 },
  { slug: "endocrine", name: "내분비", color: "#b07ae0", layoutZone: "endocrine", order: 5 },
];

const categories = [
  { slug: "infection", name: "감염성" },
  { slug: "autoimmune", name: "자가면역" },
  { slug: "tumor", name: "종양" },
  { slug: "metabolic", name: "대사·내분비" },
  { slug: "degenerative", name: "퇴행성" },
  { slug: "vascular", name: "혈관성" },
  { slug: "neuropsych", name: "정신·신경" },
  { slug: "inflammatory", name: "염증성" },
];

type DiseaseSeed = {
  slug: string;
  name: string;
  description: string;
  treatment: string;
  bodyPart: string;
  category: string | null;
  symptoms: string[];
};

const diseases: DiseaseSeed[] = [
  // ── 뇌·신경 ──
  {
    slug: "migraine", name: "편두통", bodyPart: "brain", category: "neuropsych",
    description: "한쪽 머리에 박동성 통증이 발작적으로 나타나는 만성 두통 질환.",
    treatment: "급성기에는 트립탄·진통제, 잦으면 예방약 복용. 수면·카페인 등 유발인자 관리.",
    symptoms: ["두통", "메스꺼움", "빛공포증"],
  },
  {
    slug: "stroke", name: "뇌졸중", bodyPart: "brain", category: "vascular",
    description: "뇌혈관이 막히거나 터져 뇌조직이 손상되는 응급 질환.",
    treatment: "골든타임 내 혈전용해·혈전제거술, 이후 재활과 위험인자(고혈압·당뇨) 관리.",
    symptoms: ["편마비", "언어장애", "어지럼", "두통"],
  },
  {
    slug: "alzheimer", name: "알츠하이머병", bodyPart: "brain", category: "degenerative",
    description: "기억력과 인지 기능이 서서히 저하되는 대표적 퇴행성 치매.",
    treatment: "콜린에스터분해효소 억제제 등 약물로 진행 지연, 인지·생활 지원.",
    symptoms: ["기억력저하", "인지저하", "혼동"],
  },
  {
    slug: "parkinson", name: "파킨슨병", bodyPart: "brain", category: "degenerative",
    description: "도파민 신경세포 소실로 운동이 느려지고 떨림이 생기는 퇴행성 질환.",
    treatment: "레보도파 등 도파민 보충 약물, 운동치료, 일부는 뇌심부자극술.",
    symptoms: ["떨림", "경직", "느린움직임"],
  },
  {
    slug: "meningitis", name: "뇌수막염", bodyPart: "brain", category: "infection",
    description: "뇌와 척수를 둘러싼 수막에 생긴 감염성 염증.",
    treatment: "세균성은 즉시 항생제, 바이러스성은 대증치료. 일부는 예방접종 가능.",
    symptoms: ["발열", "두통", "목경직"],
  },
  {
    slug: "epilepsy", name: "뇌전증", bodyPart: "brain", category: "neuropsych",
    description: "뇌의 비정상적 전기 활동으로 발작이 반복되는 질환.",
    treatment: "항경련제로 발작 조절, 난치성은 수술·미주신경자극 고려.",
    symptoms: ["경련", "의식소실"],
  },

  // ── 가슴 ──
  {
    slug: "hypertension", name: "고혈압", bodyPart: "chest", category: "vascular",
    description: "동맥 혈압이 지속적으로 높은 상태로, 흔히 증상이 없는 만성 질환.",
    treatment: "저염식·운동·체중관리 등 생활요법과 혈압약 복용.",
    symptoms: ["두통", "어지럼"],
  },
  {
    slug: "angina", name: "협심증", bodyPart: "chest", category: "vascular",
    description: "심장 혈관이 좁아져 운동 시 가슴이 조이는 통증이 나타나는 질환.",
    treatment: "니트로글리세린, 항혈소판제, 필요 시 스텐트 시술.",
    symptoms: ["가슴통증", "호흡곤란"],
  },
  {
    slug: "myocardial-infarction", name: "심근경색", bodyPart: "chest", category: "vascular",
    description: "심장 혈관이 완전히 막혀 심근이 괴사하는 응급 질환.",
    treatment: "응급 관상동맥 재개통(스텐트), 항혈전제, 재활.",
    symptoms: ["가슴통증", "호흡곤란", "식은땀"],
  },
  {
    slug: "arrhythmia", name: "부정맥", bodyPart: "chest", category: "vascular",
    description: "심장 박동이 너무 빠르거나 느리거나 불규칙한 상태.",
    treatment: "항부정맥제, 전극도자절제술, 필요 시 인공심박동기.",
    symptoms: ["두근거림", "어지럼"],
  },
  {
    slug: "pneumonia", name: "폐렴", bodyPart: "chest", category: "infection",
    description: "세균·바이러스 등으로 폐포에 염증이 생기는 감염 질환.",
    treatment: "원인에 따른 항생제·항바이러스제, 산소·수액 등 보존치료.",
    symptoms: ["발열", "기침", "호흡곤란"],
  },
  {
    slug: "asthma", name: "천식", bodyPart: "chest", category: "inflammatory",
    description: "기도가 과민하게 좁아져 발작적으로 숨이 차는 만성 염증 질환.",
    treatment: "흡입 스테로이드·기관지확장제, 유발인자 회피.",
    symptoms: ["기침", "호흡곤란", "천명"],
  },
  {
    slug: "copd", name: "만성폐쇄성폐질환", bodyPart: "chest", category: "degenerative",
    description: "주로 흡연으로 기도와 폐포가 손상되어 숨이 차는 진행성 질환.",
    treatment: "금연이 핵심, 기관지확장제·재활, 중증은 산소요법.",
    symptoms: ["기침", "호흡곤란", "가래"],
  },

  // ── 복부 ──
  {
    slug: "gastritis", name: "위염", bodyPart: "abdomen", category: "inflammatory",
    description: "위 점막에 염증이 생긴 상태로 급성·만성으로 나뉜다.",
    treatment: "제산제·위산억제제, 헬리코박터 감염 시 제균, 자극음식 회피.",
    symptoms: ["상복부통증", "메스꺼움", "소화불량"],
  },
  {
    slug: "peptic-ulcer", name: "위궤양", bodyPart: "abdomen", category: "inflammatory",
    description: "위 점막이 깊게 헐어 결손이 생긴 상태.",
    treatment: "위산억제제(PPI), 헬리코박터 제균, 진통제 남용 중단.",
    symptoms: ["상복부통증", "속쓰림"],
  },
  {
    slug: "hepatitis", name: "간염", bodyPart: "abdomen", category: "infection",
    description: "바이러스 등으로 간세포에 염증이 생긴 질환.",
    treatment: "원인별 항바이러스제, 휴식·금주, B·A형은 예방접종.",
    symptoms: ["피로", "황달", "식욕부진"],
  },
  {
    slug: "ibs", name: "과민성대장증후군", bodyPart: "abdomen", category: "neuropsych",
    description: "구조 이상 없이 복통과 배변 습관 변화가 반복되는 기능성 장질환.",
    treatment: "식이조절·스트레스 관리, 증상별 약물.",
    symptoms: ["복통", "설사", "변비"],
  },
  {
    slug: "gallstone", name: "담석증", bodyPart: "abdomen", category: "metabolic",
    description: "쓸개나 담관에 돌이 생겨 통증·염증을 일으키는 질환.",
    treatment: "증상 있으면 담낭절제술, 일부는 약물·체외충격파.",
    symptoms: ["우상복부통증", "메스꺼움"],
  },
  {
    slug: "colorectal-cancer", name: "대장암", bodyPart: "abdomen", category: "tumor",
    description: "대장·직장 점막에서 생기는 악성 종양.",
    treatment: "수술 절제가 기본, 병기에 따라 항암·방사선치료, 조기발견엔 내시경 절제.",
    symptoms: ["혈변", "체중감소", "배변습관변화"],
  },

  // ── 관절 ──
  {
    slug: "osteoarthritis", name: "골관절염", bodyPart: "joint", category: "degenerative",
    description: "관절 연골이 닳아 통증과 변형이 생기는 퇴행성 관절 질환.",
    treatment: "체중관리·운동, 진통소염제, 진행 시 인공관절 수술.",
    symptoms: ["관절통", "뻣뻣함", "부종"],
  },
  {
    slug: "rheumatoid-arthritis", name: "류마티스관절염", bodyPart: "joint", category: "autoimmune",
    description: "면역 이상으로 여러 관절에 만성 염증이 생기는 자가면역 질환.",
    treatment: "항류마티스제(DMARD)·생물학적제제로 염증 억제, 조기치료 중요.",
    symptoms: ["관절통", "부종", "아침강직"],
  },
  {
    slug: "gout", name: "통풍", bodyPart: "joint", category: "metabolic",
    description: "요산 결정이 관절에 쌓여 갑작스런 통증 발작을 일으키는 대사 질환.",
    treatment: "급성기 소염제, 장기적으로 요산저하제·식이조절.",
    symptoms: ["관절통", "부종", "발적"],
  },
  {
    slug: "osteoporosis", name: "골다공증", bodyPart: "joint", category: "metabolic",
    description: "뼈의 밀도가 낮아져 쉽게 골절되는 대사성 골질환.",
    treatment: "칼슘·비타민D, 골흡수억제제, 낙상 예방.",
    symptoms: ["골절", "허리통증"],
  },

  // ── 내분비 ──
  {
    slug: "diabetes", name: "당뇨병", bodyPart: "endocrine", category: "metabolic",
    description: "인슐린 작용 이상으로 혈당이 만성적으로 높은 대사 질환.",
    treatment: "식이·운동, 경구혈당강하제·인슐린, 합병증 예방 관리.",
    symptoms: ["갈증", "다뇨", "피로"],
  },
  {
    slug: "hypothyroidism", name: "갑상선기능저하증", bodyPart: "endocrine", category: "metabolic",
    description: "갑상선호르몬이 부족해 대사가 느려지는 질환.",
    treatment: "갑상선호르몬(레보티록신) 보충, 정기 혈액검사.",
    symptoms: ["피로", "체중증가", "추위민감"],
  },
  {
    slug: "hyperthyroidism", name: "갑상선기능항진증", bodyPart: "endocrine", category: "metabolic",
    description: "갑상선호르몬이 과다해 대사가 항진되는 질환.",
    treatment: "항갑상선제, 방사성요오드, 일부는 수술.",
    symptoms: ["체중감소", "두근거림", "손떨림"],
  },
];

// 합병/연관 질환 (수동 관계 엣지)
const relations: { from: string; to: string; type: string; note?: string }[] = [
  { from: "hypertension", to: "stroke", type: "comorbidity", note: "고혈압은 뇌졸중의 주요 위험인자" },
  { from: "hypertension", to: "myocardial-infarction", type: "comorbidity", note: "고혈압은 심근경색 위험을 높임" },
  { from: "diabetes", to: "stroke", type: "comorbidity", note: "당뇨는 혈관 합병증으로 뇌졸중 위험 증가" },
  { from: "diabetes", to: "myocardial-infarction", type: "comorbidity", note: "당뇨는 관상동맥질환 위험 증가" },
  { from: "angina", to: "myocardial-infarction", type: "progression", note: "협심증이 진행하면 심근경색으로 이어질 수 있음" },
  { from: "gastritis", to: "peptic-ulcer", type: "progression", note: "만성 위염이 궤양으로 진행 가능" },
  { from: "hyperthyroidism", to: "arrhythmia", type: "comorbidity", note: "갑상선 항진은 부정맥을 유발할 수 있음" },
  { from: "rheumatoid-arthritis", to: "osteoporosis", type: "comorbidity", note: "만성 염증·스테로이드로 골다공증 위험 증가" },
];

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
