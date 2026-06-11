// Disease Atlas — 시드 데이터 (교육용 · 비의학적)
// seed.ts와 테스트가 함께 사용하므로 부수효과 없는 순수 데이터만 둔다.

export type DiseaseSeed = {
  slug: string;
  name: string;
  description: string;
  treatment: string;
  bodyPart: string;
  category: string | null;
  symptoms: string[];
};

export type RelationSeed = { from: string; to: string; type: string; note?: string };

export const bodyParts = [
  { slug: "brain", name: "뇌·신경", color: "#7aa2ff", layoutZone: "head", order: 1 },
  { slug: "chest", name: "가슴", color: "#e15b5b", layoutZone: "chest", order: 2 },
  { slug: "abdomen", name: "복부", color: "#e0a94f", layoutZone: "abdomen", order: 3 },
  { slug: "joint", name: "관절", color: "#56c596", layoutZone: "limbs", order: 4 },
  { slug: "endocrine", name: "내분비", color: "#b07ae0", layoutZone: "endocrine", order: 5 },
];

export const categories = [
  { slug: "infection", name: "감염성" },
  { slug: "autoimmune", name: "자가면역" },
  { slug: "tumor", name: "종양" },
  { slug: "metabolic", name: "대사·내분비" },
  { slug: "degenerative", name: "퇴행성" },
  { slug: "vascular", name: "혈관성" },
  { slug: "neuropsych", name: "정신·신경" },
  { slug: "inflammatory", name: "염증성" },
];

export const diseases: DiseaseSeed[] = [
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

  // ── 노인성 질병 보강 (뇌·신경: 뇌혈관·치매·운동질환) ──
  {
    slug: "vascular-dementia", name: "혈관성치매", bodyPart: "brain", category: "vascular",
    description: "뇌혈관 손상이 누적되어 인지 기능이 단계적으로 저하되는 치매.",
    treatment: "고혈압·당뇨 등 혈관 위험인자 관리가 핵심, 인지·재활 치료 병행.",
    symptoms: ["인지저하", "기억력저하", "보행장애"],
  },
  {
    slug: "subarachnoid-hemorrhage", name: "지주막하출혈", bodyPart: "brain", category: "vascular",
    description: "뇌동맥류 파열 등으로 지주막 아래 공간에 출혈이 생기는 응급 질환.",
    treatment: "응급 수술·코일색전술로 출혈을 막고 재출혈·혈관연축을 관리.",
    symptoms: ["벼락두통", "의식저하", "목경직"],
  },
  {
    slug: "intracerebral-hemorrhage", name: "뇌내출혈", bodyPart: "brain", category: "vascular",
    description: "뇌 실질 안의 혈관이 터져 출혈이 생기는 출혈성 뇌졸중.",
    treatment: "혈압 조절과 뇌압 관리, 큰 혈종은 수술. 이후 재활.",
    symptoms: ["편마비", "두통", "의식저하"],
  },
  {
    slug: "cerebral-infarction", name: "뇌경색증", bodyPart: "brain", category: "vascular",
    description: "뇌혈관이 막혀 혈류가 끊겨 뇌조직이 괴사하는 허혈성 뇌졸중.",
    treatment: "골든타임 내 혈전용해·혈전제거, 항혈소판제와 위험인자 관리.",
    symptoms: ["편마비", "언어장애", "어지럼"],
  },
  {
    slug: "stroke-sequelae", name: "뇌졸중후유증", bodyPart: "brain", category: "vascular",
    description: "뇌졸중 이후 남는 마비·언어·인지 장애 등 후유 상태(중풍후유증).",
    treatment: "재활치료가 중심, 재발 예방을 위한 위험인자 관리.",
    symptoms: ["편마비", "언어장애", "인지저하"],
  },
  {
    slug: "secondary-parkinsonism", name: "이차성파킨슨증", bodyPart: "brain", category: "degenerative",
    description: "약물·혈관 손상 등 원인이 있어 파킨슨병과 비슷한 증상이 나타나는 상태.",
    treatment: "원인 약물 중단·기저질환 치료, 필요 시 도파민 약물.",
    symptoms: ["떨림", "경직", "느린움직임"],
  },
  {
    slug: "essential-tremor", name: "본태성진전", bodyPart: "brain", category: "degenerative",
    description: "특별한 원인 없이 손 등이 규칙적으로 떨리는 가장 흔한 운동장애.",
    treatment: "베타차단제 등 약물, 심하면 뇌심부자극술을 고려.",
    symptoms: ["손떨림", "떨림"],
  },
  {
    slug: "spinal-muscular-atrophy", name: "척수성근위축증", bodyPart: "brain", category: "degenerative",
    description: "척수 운동신경세포가 변성되어 근육이 위축되고 약해지는 질환.",
    treatment: "유전자·약물 치료와 재활·호흡 보조 등 다학제 관리.",
    symptoms: ["근위축", "근력저하"],
  },
  {
    slug: "multiple-sclerosis", name: "다발경화증", bodyPart: "brain", category: "autoimmune",
    description: "중추신경 수초가 면역 공격으로 손상되어 재발·완화를 반복하는 자가면역 질환.",
    treatment: "급성기 스테로이드, 재발 예방 면역조절제, 증상별 재활.",
    symptoms: ["시력저하", "감각이상", "보행장애", "피로"],
  },
  {
    slug: "nph", name: "정상압수두증", bodyPart: "brain", category: "degenerative",
    description: "뇌척수액 순환 장애로 보행·인지·배뇨 장애가 나타나는, 호전 가능한 치매의 하나.",
    treatment: "뇌실복강 단락술로 호전될 수 있어 조기 진단이 중요.",
    symptoms: ["보행장애", "인지저하", "요실금"],
  },

  // ── 균형 보강: 가슴 ──
  {
    slug: "heart-failure", name: "심부전", bodyPart: "chest", category: "vascular",
    description: "심장의 펌프 기능이 떨어져 온몸에 혈액을 충분히 보내지 못하는 상태.",
    treatment: "원인질환 치료와 이뇨제·심장약, 염분·수분 제한 등 생활관리.",
    symptoms: ["호흡곤란", "부종", "피로"],
  },
  {
    slug: "pulmonary-tuberculosis", name: "폐결핵", bodyPart: "chest", category: "infection",
    description: "결핵균이 폐에 감염되어 만성 기침·미열을 일으키는 호흡기 감염병.",
    treatment: "표준 항결핵제를 6개월 이상 꾸준히 복용, 접촉자 관리.",
    symptoms: ["기침", "발열", "체중감소"],
  },

  // ── 균형 보강: 복부 ──
  {
    slug: "stomach-cancer", name: "위암", bodyPart: "abdomen", category: "tumor",
    description: "위 점막에서 생기는 악성 종양으로 조기에는 증상이 거의 없다.",
    treatment: "내시경·수술 절제가 기본, 병기에 따라 항암치료. 정기 검진이 중요.",
    symptoms: ["상복부통증", "체중감소", "소화불량"],
  },
  {
    slug: "liver-cirrhosis", name: "간경변증", bodyPart: "abdomen", category: "degenerative",
    description: "만성 간 손상이 누적되어 간이 굳고 기능이 떨어지는 진행성 질환.",
    treatment: "원인(간염·음주) 제거와 합병증 관리, 중증은 간이식 고려.",
    symptoms: ["황달", "복수", "피로"],
  },
  {
    slug: "pancreatitis", name: "췌장염", bodyPart: "abdomen", category: "inflammatory",
    description: "췌장에 염증이 생겨 심한 상복부 통증을 일으키는 질환.",
    treatment: "금식·수액·진통과 원인(담석·음주) 교정. 중증은 입원치료.",
    symptoms: ["상복부통증", "메스꺼움", "발열"],
  },

  // ── 균형 보강: 관절 ──
  {
    slug: "spinal-stenosis", name: "척추관협착증", bodyPart: "joint", category: "degenerative",
    description: "척추관이 좁아져 신경을 눌러 다리 저림과 보행 장애를 일으키는 퇴행성 질환.",
    treatment: "약물·운동·주사 치료, 심하면 감압 수술.",
    symptoms: ["허리통증", "다리저림", "보행장애"],
  },
  {
    slug: "herniated-disc", name: "추간판탈출증", bodyPart: "joint", category: "degenerative",
    description: "디스크가 튀어나와 신경을 눌러 통증·저림을 일으키는 흔한 척추 질환.",
    treatment: "안정·약물·물리치료, 호전이 없으면 신경차단·수술.",
    symptoms: ["허리통증", "다리저림"],
  },
  {
    slug: "frozen-shoulder", name: "오십견", bodyPart: "joint", category: "inflammatory",
    description: "어깨 관절막에 염증과 유착이 생겨 통증과 운동 제한이 오는 질환.",
    treatment: "스트레칭·물리치료가 핵심, 통증이 심하면 주사·약물.",
    symptoms: ["어깨통증", "운동제한"],
  },

  // ── 균형 보강: 내분비 ──
  {
    slug: "dyslipidemia", name: "고지혈증", bodyPart: "endocrine", category: "metabolic",
    description: "혈중 콜레스테롤·중성지방이 높아 동맥경화 위험을 키우는 대사 이상.",
    treatment: "식이·운동, 필요 시 스타틴 등 지질강하제.",
    symptoms: ["무증상", "황색종"],
  },
  {
    slug: "obesity", name: "비만", bodyPart: "endocrine", category: "metabolic",
    description: "체지방이 과도하게 축적되어 여러 만성질환 위험을 높이는 상태.",
    treatment: "식이·운동·행동요법, 필요 시 약물·수술.",
    symptoms: ["체중증가", "피로"],
  },
];

// 합병/연관 질환 (수동 관계 엣지)
export const relations: RelationSeed[] = [
  { from: "hypertension", to: "stroke", type: "comorbidity", note: "고혈압은 뇌졸중의 주요 위험인자" },
  { from: "hypertension", to: "myocardial-infarction", type: "comorbidity", note: "고혈압은 심근경색 위험을 높임" },
  { from: "diabetes", to: "stroke", type: "comorbidity", note: "당뇨는 혈관 합병증으로 뇌졸중 위험 증가" },
  { from: "diabetes", to: "myocardial-infarction", type: "comorbidity", note: "당뇨는 관상동맥질환 위험 증가" },
  { from: "angina", to: "myocardial-infarction", type: "progression", note: "협심증이 진행하면 심근경색으로 이어질 수 있음" },
  { from: "gastritis", to: "peptic-ulcer", type: "progression", note: "만성 위염이 궤양으로 진행 가능" },
  { from: "hyperthyroidism", to: "arrhythmia", type: "comorbidity", note: "갑상선 항진은 부정맥을 유발할 수 있음" },
  { from: "rheumatoid-arthritis", to: "osteoporosis", type: "comorbidity", note: "만성 염증·스테로이드로 골다공증 위험 증가" },

  // ── 노인성·뇌혈관 관계도 ──
  { from: "hypertension", to: "intracerebral-hemorrhage", type: "comorbidity", note: "고혈압은 뇌내출혈의 가장 큰 위험인자" },
  { from: "hypertension", to: "subarachnoid-hemorrhage", type: "comorbidity", note: "고혈압은 뇌동맥류 파열 위험을 높임" },
  { from: "hypertension", to: "cerebral-infarction", type: "comorbidity", note: "고혈압은 뇌경색의 주요 위험인자" },
  { from: "diabetes", to: "cerebral-infarction", type: "comorbidity", note: "당뇨는 뇌경색 위험을 높임" },
  { from: "dyslipidemia", to: "cerebral-infarction", type: "comorbidity", note: "이상지질혈증은 동맥경화로 뇌경색 위험 증가" },
  { from: "cerebral-infarction", to: "stroke-sequelae", type: "progression", note: "뇌경색 이후 후유증으로 진행" },
  { from: "intracerebral-hemorrhage", to: "stroke-sequelae", type: "progression", note: "뇌내출혈 이후 후유증으로 진행" },
  { from: "cerebral-infarction", to: "vascular-dementia", type: "progression", note: "반복된 뇌경색이 혈관성 치매로 이어질 수 있음" },
  { from: "stroke", to: "vascular-dementia", type: "comorbidity", note: "뇌졸중은 혈관성 치매의 주요 원인" },
  { from: "alzheimer", to: "vascular-dementia", type: "comorbidity", note: "알츠하이머와 혈관성 치매가 함께 오는 혼합형 치매" },
  { from: "parkinson", to: "essential-tremor", type: "comorbidity", note: "임상적으로 감별이 필요한 떨림 질환" },
  { from: "parkinson", to: "secondary-parkinsonism", type: "comorbidity", note: "증상이 비슷해 감별이 필요한 파킨슨증" },
  { from: "nph", to: "alzheimer", type: "comorbidity", note: "수술로 호전 가능한 가역성 치매로 감별 대상" },

  // ── 균형 보강 관계 ──
  { from: "myocardial-infarction", to: "heart-failure", type: "progression", note: "심근경색 손상이 심부전으로 진행할 수 있음" },
  { from: "hypertension", to: "heart-failure", type: "comorbidity", note: "고혈압은 심부전의 위험인자" },
  { from: "dyslipidemia", to: "angina", type: "comorbidity", note: "이상지질혈증은 관상동맥질환 위험 증가" },
  { from: "hepatitis", to: "liver-cirrhosis", type: "progression", note: "만성 간염이 간경변으로 진행" },
  { from: "gastritis", to: "stomach-cancer", type: "progression", note: "만성 위축성 위염은 위암 위험을 높임" },
  { from: "gallstone", to: "pancreatitis", type: "comorbidity", note: "담석이 췌장염을 유발할 수 있음(담석성 췌장염)" },
  { from: "spinal-stenosis", to: "herniated-disc", type: "comorbidity", note: "함께 나타나거나 감별이 필요한 척추 질환" },
  { from: "obesity", to: "diabetes", type: "comorbidity", note: "비만은 2형 당뇨의 주요 위험인자" },
  { from: "obesity", to: "hypertension", type: "comorbidity", note: "비만은 고혈압 위험을 높임" },
];
