import { zonePositions } from "./atlas-layout";

type Point = { x: number; y: number };
type Landmark = Point & { label: string; zone: string; spread: Point; systemic?: boolean };

// Atlas/world coordinates, shared by the layout and SVG selection guide.
// These are schematic organ references, not lesion locations or laterality.
export const ANATOMY_LANDMARKS: Record<string, Landmark> = {
  brain: { x: 470, y: 180, label: "뇌·중추신경", zone: "head", spread: { x: 470, y: 175 } },
  heart: { x: 490, y: 535, label: "심장·혈관", zone: "chest", spread: { x: 640, y: 515 } },
  lung: { x: 405, y: 480, label: "폐·기도", zone: "chest", spread: { x: 310, y: 485 } },
  liver: { x: 430, y: 662, label: "간·담낭", zone: "abdomen", spread: { x: 310, y: 670 } },
  stomach: { x: 515, y: 708, label: "위·식도", zone: "abdomen", spread: { x: 650, y: 690 } },
  pancreas: { x: 485, y: 740, label: "췌장", zone: "abdomen", spread: { x: 630, y: 795 } },
  bowel: { x: 470, y: 827, label: "장", zone: "abdomen", spread: { x: 460, y: 890 } },
  kidney: { x: 365, y: 750, label: "콩팥·요로", zone: "abdomen", spread: { x: 280, y: 805 } },
  shoulder: { x: 352, y: 382, label: "어깨", zone: "limbs", spread: { x: 255, y: 350 } },
  neck: { x: 470, y: 326, label: "경추", zone: "limbs", spread: { x: 590, y: 325 } },
  spine: { x: 470, y: 760, label: "척추", zone: "limbs", spread: { x: 670, y: 990 } },
  wrist: { x: 264, y: 755, label: "손목", zone: "limbs", spread: { x: 160, y: 755 } },
  hip: { x: 405, y: 935, label: "고관절", zone: "limbs", spread: { x: 320, y: 985 } },
  knee: { x: 408, y: 1240, label: "관절·뼈·근육", zone: "limbs", spread: { x: 390, y: 1160 } },
  foot: { x: 388, y: 1370, label: "발", zone: "limbs", spread: { x: 385, y: 1340 } },
  thyroid: { x: 470, y: 340, label: "갑상선·부갑상선", zone: "endocrine", spread: { x: 865, y: 320 } },
  adrenal: { x: 550, y: 713, label: "부신", zone: "endocrine", spread: { x: 925, y: 730 } },
  pituitary: { x: 470, y: 228, label: "시상하부·뇌하수체 계통", zone: "endocrine", spread: { x: 890, y: 170 } },
  systemic: { x: 960, y: 560, label: "전신·대사 계통", zone: "endocrine", spread: { x: 960, y: 550 }, systemic: true },
  pelvic: { x: 470, y: 930, label: "골반·생식 계통", zone: "endocrine", spread: { x: 950, y: 890 } },
};

const GROUPS: Record<string, string[]> = {
  brain: ["migraine", "stroke", "alzheimer", "parkinson", "meningitis", "epilepsy", "vascular-dementia", "subarachnoid-hemorrhage", "intracerebral-hemorrhage", "cerebral-infarction", "stroke-sequelae", "secondary-parkinsonism", "essential-tremor", "multiple-sclerosis", "nph"],
  heart: ["hypertension", "angina", "myocardial-infarction", "arrhythmia", "heart-failure", "atrial-fibrillation", "valvular-heart-disease", "aortic-aneurysm"],
  lung: ["pneumonia", "asthma", "copd", "pulmonary-tuberculosis", "lung-cancer", "pulmonary-fibrosis", "bronchiectasis", "pulmonary-embolism"],
  liver: ["hepatitis", "gallstone", "liver-cirrhosis", "liver-cancer"],
  stomach: ["gastritis", "peptic-ulcer", "stomach-cancer", "gerd"],
  pancreas: ["pancreatitis", "pancreatic-cancer"],
  bowel: ["ibs", "colorectal-cancer", "diverticulitis", "ulcerative-colitis"],
  kidney: ["chronic-kidney-disease", "kidney-stone"],
  shoulder: ["frozen-shoulder", "rotator-cuff-tear", "polymyalgia-rheumatica"],
  neck: ["cervical-disc-herniation"],
  spine: ["spinal-stenosis", "herniated-disc", "vertebral-compression-fracture", "ankylosing-spondylitis", "spinal-muscular-atrophy"],
  wrist: ["carpal-tunnel-syndrome", "rheumatoid-arthritis"],
  hip: ["hip-fracture"],
  knee: ["osteoarthritis", "osteoporosis", "sarcopenia"],
  foot: ["plantar-fasciitis", "gout"],
  thyroid: ["hypothyroidism", "hyperthyroidism", "thyroid-cancer", "thyroid-nodule", "hashimoto-thyroiditis", "hyperparathyroidism"],
  adrenal: ["cushing-syndrome", "adrenal-insufficiency"],
  pituitary: ["acromegaly", "diabetes-insipidus"],
  systemic: ["diabetes", "dyslipidemia", "obesity", "metabolic-syndrome", "hypoglycemia"],
  pelvic: ["pcos"],
};
const LANDMARK_BY_SLUG = new Map(Object.entries(GROUPS).flatMap(([key, slugs]) => slugs.map(slug => [slug, key] as const)));
export function diseaseLandmarkKey(slug: string) {
  return LANDMARK_BY_SLUG.get(slug);
}
export function diseaseLandmark(slug: string) {
  const key = LANDMARK_BY_SLUG.get(slug);
  return key ? ANATOMY_LANDMARKS[key] : undefined;
}

/** Stable by slug, independent of DB name ordering. Reserve label space globally. */
export function anatomicalPositions(diseases: { slug: string; layoutZone: string }[]): Map<string, Point> {
  const result = new Map<string, Point>();
  const occupied: Point[] = [];
  for (const disease of [...diseases].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const landmark = diseaseLandmark(disease.slug);
    const center = landmark?.spread ?? zonePositions(disease.layoutZone, 1)[0];
    const candidates: (Point & { cost: number })[] = [];
    for (let row = -12; row <= 12; row++) {
      for (let col = -8; col <= 8; col++) {
        const x = center.x + col * 116 + (Math.abs(row) % 2) * 35;
        const y = center.y + row * 52;
        if (y < 70 || x < 100) continue;
        candidates.push({ x, y, cost: (x-center.x)**2 + (y-center.y)**2 * 2.2 });
      }
    }
    candidates.sort((a,b) => a.cost-b.cost || a.y-b.y || a.x-b.x);
    const point = candidates.find(p => occupied.every(q => Math.abs(p.x-q.x) >= 112 || Math.abs(p.y-q.y) >= 48))!;
    occupied.push(point);
    // DiseaseNode has a fixed 104px width; its star is centered at x+52, y+9.
    result.set(disease.slug, { x: point.x - 52, y: point.y - 9 });
  }
  return result;
}
