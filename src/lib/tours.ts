import { SENIOR_TOURS } from "./senior-tours";

export type TourStep = {
  diseaseSlug: string;
  narrative: string;
};

export type Tour = {
  slug: string;
  audience?: string;
  sources?: { title: string; url: string }[];
  title: string;
  description: string;
  summary: string[];
  steps: TourStep[];
};

export const TOURS: Tour[] = [
  {
    slug: "road-to-dementia",
    audience: "인지 건강",
    title: "치매로 가는 길",
    description: "혈관 위험과 서로 다른 인지저하 원인을 비교해 보는 투어",
    summary: [
      "이 순서는 개인에게 일어나는 진행 경로가 아니라, 혈관 위험과 인지저하 원인의 관계를 비교하는 지도입니다.",
      "고혈압·뇌경색·혈관성 인지저하와 알츠하이머병은 서로 영향을 줄 수 있지만, 한 질환이 다음 질환을 뜻하지는 않습니다.",
      "기억·언어·일상 기능의 변화가 있으면 원인을 구분하는 진료가 중요합니다.",
    ],
    sources: [
      { title: "NIA — 혈관성 치매", url: "https://www.nia.nih.gov/health/vascular-dementia" },
      { title: "NIA — 알츠하이머병 이해하기", url: "https://www.nia.nih.gov/health/alzheimers-and-dementia/what-alzheimers-disease" },
      { title: "NINDS — 뇌졸중의 징후와 증상", url: "https://www.ninds.nih.gov/health-information/stroke/signs-and-symptoms" },
    ],
    steps: [
      { diseaseSlug: "hypertension", narrative: "고혈압은 증상이 없어도 혈관에 부담을 줄 수 있는 위험 요인입니다. 혈압을 관리한다고 해서 모든 인지저하를 막는 것은 아니지만, 뇌혈관 건강을 지키는 중요한 한 축입니다." },
      { diseaseSlug: "cerebral-infarction", narrative: "뇌경색은 뇌혈류가 막혀 생기는 응급 질환입니다. 얼굴·팔의 갑작스런 마비나 말 어눌함이 보이면 바로 응급 도움을 받아야 하며, 작은 혈관 손상도 장기적으로 인지 기능에 영향을 줄 수 있습니다." },
      { diseaseSlug: "vascular-dementia", narrative: "혈관성 인지저하는 뇌혈류를 방해하는 여러 상태와 관련해 기억·사고·행동이 달라지는 질환군입니다. 변화 양상은 사람마다 다르며, 위험 요인을 함께 관리하는 것이 중요합니다." },
      { diseaseSlug: "alzheimer", narrative: "알츠하이머병은 기억과 사고 기능을 서서히 손상시키는 가장 흔한 치매 원인입니다. 알츠하이머병과 혈관성 변화가 함께 있는 경우도 있어, 이 단계는 앞 단계의 필연적 다음 순서가 아니라 비교 지점입니다." },
      { diseaseSlug: "nph", narrative: "정상압수두증은 보행 변화·인지 변화·배뇨 증상이 함께 나타날 수 있는 원인 중 하나입니다. 치료 가능성을 평가할 수 있으므로, 증상만으로 단정하지 말고 전문 진료에서 다른 원인과 구분해야 합니다." },
    ],
  },
  {
    slug: "what-is-that-tremor",
    audience: "운동 증상",
    title: "떨림의 정체",
    description: "손 떨림과 파킨슨증을 구분해 보는 비교 투어",
    summary: [
      "떨림은 하나의 질환명이 아니라 여러 원인에서 나타나는 증상입니다.",
      "언제 떨리는지, 움직임이 느려졌는지, 복용 약과 뇌혈관 병력이 있는지를 함께 살핍니다.",
      "갑자기 생긴 한쪽 약화·말 어눌함은 떨림 평가보다 응급 평가가 먼저입니다.",
    ],
    sources: [
      { title: "NIA — 파킨슨병", url: "https://www.nia.nih.gov/health/parkinsons-disease/what-parkinsons-disease" },
      { title: "MedlinePlus — 본태성 떨림", url: "https://medlineplus.gov/essentialtremor.html" },
      { title: "NINDS — 뇌졸중의 징후와 증상", url: "https://www.ninds.nih.gov/health-information/stroke/signs-and-symptoms" },
    ],
    steps: [
      { diseaseSlug: "essential-tremor", narrative: "본태성 떨림은 컵을 들거나 글씨를 쓸 때처럼 동작을 할 때 두드러지는 경우가 많습니다. 양상과 가족력은 단서가 될 수 있지만, 진단은 증상·진찰·다른 원인 배제를 함께 봅니다." },
      { diseaseSlug: "parkinson", narrative: "파킨슨병에서는 쉬는 동안의 떨림이 나타날 수 있고, 움직임이 느려짐·근육 경직·보행 변화가 동반되기도 합니다. 떨림이 없는 파킨슨병도 있으므로 한 가지 특징만으로 판단할 수 없습니다." },
      { diseaseSlug: "secondary-parkinsonism", narrative: "일부 약물, 뇌혈관 손상 등은 파킨슨병과 비슷한 느린 움직임과 경직을 만들 수 있습니다. 복용 약은 임의로 중단하지 말고, 진료에서 원인과 조정 가능성을 검토해야 합니다." },
      { diseaseSlug: "stroke-sequelae", narrative: "뇌졸중 뒤 남은 근력·감각·운동 조절 변화가 손의 떨림이나 불편함처럼 느껴질 수 있습니다. 새로 생긴 갑작스런 한쪽 약화, 얼굴 처짐, 말 어눌함은 즉시 응급 평가가 필요한 신호입니다." },
    ],
  },
  {
    slug: "heart-to-brain",
    audience: "심뇌혈관 건강",
    title: "심장에서 뇌까지",
    description: "공유하는 심뇌혈관 위험 요인과 응급 신호를 살펴보는 투어",
    summary: [
      "이 투어는 한 질환이 반드시 다음 질환으로 이어진다는 경로가 아니라, 함께 관리할 위험 요인을 보여 줍니다.",
      "고지혈증·고혈압은 심장과 뇌의 혈관 건강에 모두 관련될 수 있습니다.",
      "새롭거나 심한 가슴 통증, 호흡곤란, 뇌졸중 의심 증상은 지체하지 말고 응급 도움을 받아야 합니다.",
    ],
    sources: [
      { title: "NHLBI — 고혈압", url: "https://www.nhlbi.nih.gov/health/high-blood-pressure" },
      { title: "NHLBI — 심장마비 증상", url: "https://www.nhlbi.nih.gov/health/heart-attack/symptoms" },
      { title: "NINDS — 뇌졸중 개요", url: "https://www.ninds.nih.gov/health-information/stroke/stroke-overview" },
    ],
    steps: [
      { diseaseSlug: "dyslipidemia", narrative: "이상지질혈증은 혈중 지질 수치가 높거나 불균형한 상태를 말합니다. 증상이 없는 경우가 많아 검사와 개인별 위험도 평가를 통해 관리 계획을 세웁니다." },
      { diseaseSlug: "hypertension", narrative: "고혈압은 심장과 뇌혈관에 모두 부담을 줄 수 있는 위험 요인입니다. 이상지질혈증과 함께 있을 수 있지만, 각각의 수치와 생활·약물 관리는 개인별로 따로 결정합니다." },
      { diseaseSlug: "angina", narrative: "협심증은 심장 근육에 가는 혈류가 부족할 때 가슴 불편감이나 압박감으로 나타날 수 있습니다. 증상은 사람마다 다르므로 새롭거나 악화되는 가슴 증상은 ‘경고의 순서’로 해석하지 말고 진료에서 평가해야 합니다." },
      { diseaseSlug: "myocardial-infarction", narrative: "심근경색은 심장 혈류가 막혀 생기는 응급 질환입니다. 새롭거나 심한 가슴 압박감·통증, 식은땀, 호흡곤란 등이 있으면 기다리지 말고 지역 응급의료체계에 도움을 요청해야 합니다." },
      { diseaseSlug: "heart-failure", narrative: "심부전은 심장이 필요한 만큼 혈액을 보내기 어려운 상태이며 심근경색 외에도 여러 원인이 있습니다. 숨참·부종·피로 같은 증상은 정도와 원인에 따라 달라져 지속적인 진료와 관리가 필요할 수 있습니다." },
      { diseaseSlug: "stroke", narrative: "뇌졸중은 심장 질환과 같은 위험 요인을 공유할 수 있지만, 심장 질환의 정해진 다음 단계는 아닙니다. 얼굴 처짐, 한쪽 팔 약화, 말 어눌함이 갑자기 나타나면 즉시 응급 도움을 받아야 합니다." },
    ],
  },
  ...SENIOR_TOURS,
];
