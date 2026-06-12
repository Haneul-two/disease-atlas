// 일회성 스크립트 — slug 기준으로 Disease.medicalTerm 채워 넣기.
// 실행: npx tsx scripts/fill-medical-terms.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const terms: Record<string, string> = {
  // 뇌·신경
  "migraine": "Migraine",
  "stroke": "Stroke",
  "alzheimer": "Alzheimer's disease",
  "parkinson": "Parkinson's disease",
  "meningitis": "Meningitis",
  "epilepsy": "Epilepsy",
  "vascular-dementia": "Vascular dementia",
  "subarachnoid-hemorrhage": "Subarachnoid hemorrhage",
  "intracerebral-hemorrhage": "Intracerebral hemorrhage",
  "cerebral-infarction": "Cerebral infarction",
  "stroke-sequelae": "Post-stroke sequelae",
  "secondary-parkinsonism": "Secondary parkinsonism",
  "essential-tremor": "Essential tremor",
  "spinal-muscular-atrophy": "Spinal muscular atrophy",
  "multiple-sclerosis": "Multiple sclerosis",
  "nph": "Normal pressure hydrocephalus",

  // 가슴
  "hypertension": "Hypertension",
  "angina": "Angina pectoris",
  "myocardial-infarction": "Myocardial infarction",
  "arrhythmia": "Cardiac arrhythmia",
  "pneumonia": "Pneumonia",
  "asthma": "Asthma",
  "copd": "Chronic obstructive pulmonary disease (COPD)",
  "heart-failure": "Heart failure",
  "pulmonary-tuberculosis": "Pulmonary tuberculosis",
  "lung-cancer": "Lung cancer",
  "pulmonary-fibrosis": "Pulmonary fibrosis",
  "bronchiectasis": "Bronchiectasis",
  "atrial-fibrillation": "Atrial fibrillation",
  "valvular-heart-disease": "Valvular heart disease",
  "aortic-aneurysm": "Aortic aneurysm",
  "pulmonary-embolism": "Pulmonary embolism",

  // 복부
  "gastritis": "Gastritis",
  "peptic-ulcer": "Peptic ulcer disease",
  "hepatitis": "Hepatitis",
  "ibs": "Irritable bowel syndrome (IBS)",
  "gallstone": "Cholelithiasis",
  "colorectal-cancer": "Colorectal cancer",
  "stomach-cancer": "Gastric cancer",
  "liver-cirrhosis": "Liver cirrhosis",
  "pancreatitis": "Pancreatitis",
  "liver-cancer": "Hepatocellular carcinoma",
  "pancreatic-cancer": "Pancreatic cancer",
  "gerd": "Gastroesophageal reflux disease (GERD)",
  "chronic-kidney-disease": "Chronic kidney disease (CKD)",
  "kidney-stone": "Urolithiasis",
  "diverticulitis": "Diverticulitis",
  "ulcerative-colitis": "Ulcerative colitis",

  // 관절
  "osteoarthritis": "Osteoarthritis",
  "rheumatoid-arthritis": "Rheumatoid arthritis",
  "gout": "Gout",
  "osteoporosis": "Osteoporosis",
  "spinal-stenosis": "Spinal stenosis",
  "herniated-disc": "Lumbar disc herniation",
  "frozen-shoulder": "Adhesive capsulitis",
  "hip-fracture": "Hip fracture",
  "vertebral-compression-fracture": "Vertebral compression fracture",
  "rotator-cuff-tear": "Rotator cuff tear",
  "carpal-tunnel-syndrome": "Carpal tunnel syndrome",
  "plantar-fasciitis": "Plantar fasciitis",
  "ankylosing-spondylitis": "Ankylosing spondylitis",
  "sarcopenia": "Sarcopenia",
  "polymyalgia-rheumatica": "Polymyalgia rheumatica",
  "cervical-disc-herniation": "Cervical disc herniation",

  // 내분비
  "diabetes": "Diabetes mellitus",
  "hypothyroidism": "Hypothyroidism",
  "hyperthyroidism": "Hyperthyroidism",
  "dyslipidemia": "Dyslipidemia",
  "obesity": "Obesity",
  "thyroid-cancer": "Thyroid cancer",
  "thyroid-nodule": "Thyroid nodule",
  "hashimoto-thyroiditis": "Hashimoto's thyroiditis",
  "cushing-syndrome": "Cushing's syndrome",
  "adrenal-insufficiency": "Adrenal insufficiency",
  "acromegaly": "Acromegaly",
  "hyperparathyroidism": "Hyperparathyroidism",
  "metabolic-syndrome": "Metabolic syndrome",
  "hypoglycemia": "Hypoglycemia",
  "diabetes-insipidus": "Diabetes insipidus",
  "pcos": "Polycystic ovary syndrome (PCOS)",
};

async function main() {
  const existing = await prisma.disease.findMany({
    select: { slug: true, name: true, medicalTerm: true },
  });
  const existingSlugs = new Set(existing.map((d) => d.slug));

  const missing = Object.keys(terms).filter((s) => !existingSlugs.has(s));
  const unmapped = existing.filter((d) => !terms[d.slug]).map((d) => `${d.slug} (${d.name})`);

  if (missing.length) console.log(`매핑에 있지만 DB에 없는 slug: ${missing.join(", ")}`);
  if (unmapped.length) console.log(`DB에 있지만 매핑 없는 질병: ${unmapped.join(", ")}`);

  let updated = 0;
  let skipped = 0;
  for (const d of existing) {
    const term = terms[d.slug];
    if (!term) continue;
    if (d.medicalTerm === term) {
      skipped++;
      continue;
    }
    await prisma.disease.update({
      where: { slug: d.slug },
      data: { medicalTerm: term },
    });
    updated++;
  }
  console.log(`완료 — 업데이트: ${updated}건, 변경없음: ${skipped}건`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
