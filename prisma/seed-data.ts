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

  // ── v1.1 확충: 가슴 ──
  {
    slug: "lung-cancer", name: "폐암", bodyPart: "chest", category: "tumor",
    description: "폐에 발생하는 악성 종양으로 진행될 때까지 증상이 뚜렷하지 않은 경우가 많은 질환.",
    treatment: "병기에 따라 수술·항암·방사선치료, 표적치료제·면역항암제.",
    symptoms: ["기침", "혈담", "체중감소"],
  },
  {
    slug: "pulmonary-fibrosis", name: "폐섬유화증", bodyPart: "chest", category: "degenerative",
    description: "폐 조직이 섬유화되어 딱딱해지고 호흡 기능이 서서히 저하되는 진행성 질환.",
    treatment: "항섬유화제로 진행 억제, 산소요법, 중증은 폐이식 고려.",
    symptoms: ["호흡곤란", "기침"],
  },
  {
    slug: "bronchiectasis", name: "기관지확장증", bodyPart: "chest", category: "inflammatory",
    description: "기관지 벽이 손상되어 비정상적으로 확장되고 만성 감염이 반복되는 질환.",
    treatment: "호흡재활·체위배액으로 가래 제거, 급성 악화 시 항생제.",
    symptoms: ["기침", "가래", "혈담"],
  },
  {
    slug: "atrial-fibrillation", name: "심방세동", bodyPart: "chest", category: "vascular",
    description: "심방이 무질서하게 떨려 맥이 불규칙해지고 혈전·뇌경색 위험을 높이는 부정맥.",
    treatment: "항응고제로 뇌경색 예방, 맥박수 조절 약물, 필요 시 전극도자절제술.",
    symptoms: ["두근거림", "어지럼", "호흡곤란"],
  },
  {
    slug: "valvular-heart-disease", name: "심장판막질환", bodyPart: "chest", category: "degenerative",
    description: "심장 판막이 좁아지거나 역류하여 심장 기능이 저하되는 질환.",
    treatment: "약물로 증상 조절, 진행 시 판막 성형·치환술.",
    symptoms: ["호흡곤란", "두근거림", "부종"],
  },
  {
    slug: "aortic-aneurysm", name: "대동맥류", bodyPart: "chest", category: "vascular",
    description: "대동맥 벽이 약해져 비정상적으로 부풀어 오르는 상태로 파열 시 생명을 위협하는 질환.",
    treatment: "작으면 정기 영상 감시, 크거나 빠르게 커지면 수술·스텐트 삽입.",
    symptoms: ["가슴통증"],
  },
  {
    slug: "pulmonary-embolism", name: "폐색전증", bodyPart: "chest", category: "vascular",
    description: "혈전이 폐동맥을 막아 갑작스러운 호흡곤란과 흉통을 일으키는 응급 질환.",
    treatment: "항응고제·혈전용해제 즉시 투여, 대량색전 시 카테터·수술 치료.",
    symptoms: ["호흡곤란", "가슴통증", "의식저하"],
  },

  // ── v1.1 확충: 복부 ──
  {
    slug: "liver-cancer", name: "간암", bodyPart: "abdomen", category: "tumor",
    description: "간세포에서 발생하는 악성 종양으로 간경변·만성 간염이 주요 위험인자인 질환.",
    treatment: "절제·간이식·고주파소작술, 진행암은 표적치료제.",
    symptoms: ["우상복부통증", "체중감소", "황달"],
  },
  {
    slug: "pancreatic-cancer", name: "췌장암", bodyPart: "abdomen", category: "tumor",
    description: "췌장에 생기는 악성 종양으로 조기 발견이 어렵고 예후가 불량한 질환.",
    treatment: "절제 가능하면 수술, 이후 항암치료, 절제 불가 시 항암·방사선.",
    symptoms: ["상복부통증", "체중감소", "황달"],
  },
  {
    slug: "gerd", name: "역류성식도염", bodyPart: "abdomen", category: "inflammatory",
    description: "위산이 식도로 역류하여 점막에 염증을 일으키는 흔한 소화기 질환.",
    treatment: "위산억제제(PPI), 식후 눕기 자제·체중관리 등 생활개선.",
    symptoms: ["속쓰림", "가슴통증", "소화불량"],
  },
  {
    slug: "chronic-kidney-disease", name: "만성콩팥병", bodyPart: "abdomen", category: "degenerative",
    description: "신장 기능이 서서히 저하되어 노폐물이 쌓이는 진행성 만성 질환.",
    treatment: "원인질환(고혈압·당뇨) 관리, 단백질 제한 식이, 말기는 투석·이식.",
    symptoms: ["부종", "다뇨"],
  },
  {
    slug: "kidney-stone", name: "요로결석", bodyPart: "abdomen", category: "metabolic",
    description: "소변 내 결정 물질이 뭉쳐 요로에 돌이 생겨 심한 통증을 일으키는 질환.",
    treatment: "수분 섭취·진통제, 자연 배출 어려우면 체외충격파·수술.",
    symptoms: ["옆구리통증", "혈뇨", "메스꺼움"],
  },
  {
    slug: "diverticulitis", name: "게실염", bodyPart: "abdomen", category: "inflammatory",
    description: "대장 벽에 생긴 게실에 염증·감염이 발생하는 질환.",
    treatment: "항생제·식이 조절, 반복·합병 시 수술.",
    symptoms: ["복통", "발열", "변비"],
  },
  {
    slug: "ulcerative-colitis", name: "궤양성대장염", bodyPart: "abdomen", category: "autoimmune",
    description: "대장 점막에 만성 염증과 궤양이 반복되는 자가면역성 염증성 장질환.",
    treatment: "항염증제·면역억제제, 중증·난치 시 생물학적제제·수술.",
    symptoms: ["혈변", "설사", "복통"],
  },

  // ── v1.1 확충: 관절 ──
  {
    slug: "hip-fracture", name: "고관절골절", bodyPart: "joint", category: null,
    description: "넘어지거나 충격으로 고관절 주변 뼈가 부러지는 노인에서 흔한 골절.",
    treatment: "수술적 고정·인공관절치환, 이후 재활과 골다공증 치료.",
    symptoms: ["골절", "보행장애", "관절통"],
  },
  {
    slug: "vertebral-compression-fracture", name: "척추압박골절", bodyPart: "joint", category: null,
    description: "골다공증 등으로 약해진 척추뼈가 압박에 의해 주저앉는 골절.",
    treatment: "통증 조절·보조기, 심하면 척추 성형술, 골다공증 치료 병행.",
    symptoms: ["허리통증", "골절"],
  },
  {
    slug: "rotator-cuff-tear", name: "회전근개파열", bodyPart: "joint", category: "degenerative",
    description: "어깨 회전근개 힘줄이 손상·파열되어 통증과 근력 저하가 생기는 질환.",
    treatment: "물리치료·약물, 완전 파열은 관절경 수술로 봉합.",
    symptoms: ["어깨통증", "운동제한", "근력저하"],
  },
  {
    slug: "carpal-tunnel-syndrome", name: "손목터널증후군", bodyPart: "joint", category: null,
    description: "손목 안의 정중신경이 눌려 손 저림과 감각 이상을 일으키는 질환.",
    treatment: "보조기·스테로이드 주사, 호전 없으면 수술적 감압.",
    symptoms: ["손저림", "감각이상", "손떨림"],
  },
  {
    slug: "plantar-fasciitis", name: "족저근막염", bodyPart: "joint", category: "inflammatory",
    description: "발바닥 근막에 만성 염증이 생겨 아침 첫 걸음에 발뒤꿈치 통증이 심한 질환.",
    treatment: "스트레칭·쿠션 깔창, 체외충격파, 필요 시 주사치료.",
    symptoms: ["발뒤꿈치통증"],
  },
  {
    slug: "ankylosing-spondylitis", name: "강직성척추염", bodyPart: "joint", category: "autoimmune",
    description: "척추와 골반 관절에 만성 염증이 생겨 서서히 굳어가는 자가면역 질환.",
    treatment: "NSAIDs·물리치료, 반응 없으면 생물학적제제(TNF억제제).",
    symptoms: ["허리통증", "아침강직"],
  },
  {
    slug: "sarcopenia", name: "근감소증", bodyPart: "joint", category: "degenerative",
    description: "노화로 근육량과 근력이 줄어 낙상·신체 기능 저하로 이어지는 질환.",
    treatment: "저항성 운동과 단백질 섭취가 핵심, 동반 질환 관리.",
    symptoms: ["근력저하", "보행장애"],
  },
  {
    slug: "polymyalgia-rheumatica", name: "류마티스다발근통", bodyPart: "joint", category: "inflammatory",
    description: "어깨·골반 주변 근육에 통증과 조조강직이 나타나는 노인성 염증 질환.",
    treatment: "소량 스테로이드에 반응이 빠르고, 수개월~수년 유지 후 감량.",
    symptoms: ["근육통", "아침강직", "발열"],
  },
  {
    slug: "cervical-disc-herniation", name: "경추간판탈출증", bodyPart: "joint", category: "degenerative",
    description: "목 디스크가 탈출하여 신경을 눌러 목과 팔의 통증·저림을 일으키는 질환.",
    treatment: "안정·약물·물리치료, 호전 없으면 경막외 주사·수술.",
    symptoms: ["목통증", "손저림", "감각이상"],
  },

  // ── v1.1 확충: 내분비 ──
  {
    slug: "thyroid-cancer", name: "갑상선암", bodyPart: "endocrine", category: "tumor",
    description: "갑상선에 발생하는 악성 종양으로 유두암이 가장 흔하며 예후가 비교적 양호한 질환.",
    treatment: "수술로 갑상선 절제, 이후 방사성요오드·호르몬억제요법.",
    symptoms: ["목멍울", "목소리변화"],
  },
  {
    slug: "thyroid-nodule", name: "갑상선결절", bodyPart: "endocrine", category: null,
    description: "갑상선에 생기는 혹으로 대부분 양성이나 일부는 암 여부 확인이 필요한 상태.",
    treatment: "초음파·세침흡인검사로 추적 관찰, 악성이면 수술.",
    symptoms: ["목멍울"],
  },
  {
    slug: "hashimoto-thyroiditis", name: "하시모토갑상선염", bodyPart: "endocrine", category: "autoimmune",
    description: "자가면역 반응으로 갑상선이 서서히 파괴되어 기능저하로 이어지는 만성 갑상선염.",
    treatment: "기능저하 발생 시 갑상선호르몬 보충, 정기 혈액검사.",
    symptoms: ["체중증가", "목멍울", "추위민감"],
  },
  {
    slug: "cushing-syndrome", name: "쿠싱증후군", bodyPart: "endocrine", category: "metabolic",
    description: "코르티솔이 과다하여 복부비만·고혈압·피부 변화 등이 나타나는 내분비 질환.",
    treatment: "원인에 따라 수술·방사선·약물로 코르티솔을 낮춤.",
    symptoms: ["체중증가", "부종"],
  },
  {
    slug: "adrenal-insufficiency", name: "부신기능저하증", bodyPart: "endocrine", category: "metabolic",
    description: "부신에서 코르티솔이 충분히 생성되지 않아 만성 피로와 저혈압이 나타나는 질환.",
    treatment: "코르티솔 보충(하이드로코르티손), 스트레스 시 용량 증량.",
    symptoms: ["피로", "식욕부진", "어지럼"],
  },
  {
    slug: "acromegaly", name: "말단비대증", bodyPart: "endocrine", category: "metabolic",
    description: "성장호르몬 과다 분비로 손발이 커지고 안면·관절 변화가 생기는 내분비 종양 질환.",
    treatment: "뇌하수체 선종 수술, 보완적으로 약물·방사선 치료.",
    symptoms: ["손발비대", "두통", "관절통"],
  },
  {
    slug: "hyperparathyroidism", name: "부갑상선기능항진증", bodyPart: "endocrine", category: "metabolic",
    description: "부갑상선호르몬 과다로 혈중 칼슘이 높아져 뼈·신장·소화기 이상을 일으키는 질환.",
    treatment: "증상 있거나 기준 초과 시 수술, 경증은 추적 관찰.",
    symptoms: ["골절", "변비"],
  },
  {
    slug: "metabolic-syndrome", name: "대사증후군", bodyPart: "endocrine", category: "metabolic",
    description: "복부비만·고혈압·고혈당·이상지질혈증이 함께 나타나 심혈관 위험을 높이는 상태.",
    treatment: "생활습관 교정(식이·운동)이 핵심, 각 구성 요소별 약물 치료.",
    symptoms: ["체중증가"],
  },
  {
    slug: "hypoglycemia", name: "저혈당증", bodyPart: "endocrine", category: "metabolic",
    description: "혈당이 지나치게 낮아져 뇌와 신체 기능이 저하되는 상태.",
    treatment: "즉시 포도당·단당류 섭취, 심하면 글루카곤 주사·포도당 정맥 투여.",
    symptoms: ["식은땀", "어지럼", "의식소실"],
  },
  {
    slug: "diabetes-insipidus", name: "요붕증", bodyPart: "endocrine", category: "metabolic",
    description: "항이뇨호르몬 부족 또는 신장 반응 저하로 매우 많은 소변이 생성되는 질환.",
    treatment: "중추성은 데스모프레신 보충, 신성은 원인 교정·저염식.",
    symptoms: ["다뇨", "갈증"],
  },
  {
    slug: "pcos", name: "다낭성난소증후군", bodyPart: "endocrine", category: "metabolic",
    description: "안드로겐 과다와 배란 장애로 생리불순·다낭성 난소가 나타나는 내분비 질환.",
    treatment: "생활습관 교정, 호르몬 조절 약물, 임신 원하면 배란 유도.",
    symptoms: ["생리불순", "체중증가"],
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

  // ── v1.1 확충 관계 ──
  { from: "atrial-fibrillation", to: "cerebral-infarction", type: "comorbidity", note: "심방세동 혈전이 뇌경색의 주요 원인" },
  { from: "hypertension", to: "atrial-fibrillation", type: "comorbidity", note: "고혈압은 심방세동 위험을 높임" },
  { from: "hyperthyroidism", to: "atrial-fibrillation", type: "comorbidity", note: "갑상선 항진은 심방세동을 유발할 수 있음" },
  { from: "hypertension", to: "chronic-kidney-disease", type: "comorbidity", note: "고혈압은 만성콩팥병의 주요 원인" },
  { from: "diabetes", to: "chronic-kidney-disease", type: "progression", note: "당뇨병성 신증으로 진행할 수 있음" },
  { from: "hypertension", to: "aortic-aneurysm", type: "comorbidity", note: "고혈압은 대동맥류 위험인자" },
  { from: "osteoporosis", to: "hip-fracture", type: "progression", note: "골다공증은 고관절골절의 주요 원인" },
  { from: "osteoporosis", to: "vertebral-compression-fracture", type: "progression", note: "약해진 척추뼈가 주저앉아 압박골절 발생" },
  { from: "sarcopenia", to: "hip-fracture", type: "comorbidity", note: "근감소로 낙상·골절 위험 증가" },
  { from: "metabolic-syndrome", to: "diabetes", type: "progression", note: "대사증후군은 2형 당뇨로 진행 위험" },
  { from: "metabolic-syndrome", to: "dyslipidemia", type: "comorbidity", note: "이상지질혈증은 대사증후군 구성 요소" },
  { from: "obesity", to: "metabolic-syndrome", type: "comorbidity", note: "복부비만은 대사증후군의 핵심 요소" },
  { from: "liver-cirrhosis", to: "liver-cancer", type: "progression", note: "간경변은 간암의 주요 위험인자" },
  { from: "hepatitis", to: "liver-cancer", type: "progression", note: "만성 B·C형 간염은 간암으로 진행 가능" },
  { from: "pancreatitis", to: "pancreatic-cancer", type: "comorbidity", note: "만성 췌장염은 췌장암 위험을 높임" },
  { from: "hashimoto-thyroiditis", to: "hypothyroidism", type: "progression", note: "하시모토갑상선염은 기능저하증의 흔한 원인" },
  { from: "metabolic-syndrome", to: "hypertension", type: "comorbidity", note: "고혈압은 대사증후군 구성 요소" },
];
