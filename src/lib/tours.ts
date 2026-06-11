// Disease Atlas — 퀵 투어 정의 (정적 큐레이션)
// 질병은 DB id 대신 slug로 참조한다(시드 간 안정적). 교육용 해설이며 의학적 조언이 아니다.

export type TourStep = {
  /** prisma/seed-data.ts 질병 slug */
  diseaseSlug: string;
  /** 이 스텝에서 보여줄 해설 (2~3문장, 교육용 어조) */
  narrative: string;
};

export type Tour = {
  slug: string;
  title: string;
  description: string;
  steps: TourStep[];
};

export const TOURS: Tour[] = [
  {
    slug: "road-to-dementia",
    title: "치매로 가는 길",
    description: "혈관 위험인자에서 인지저하까지 — 치매는 어디서 시작되나",
    steps: [
      {
        diseaseSlug: "hypertension",
        narrative:
          "이야기는 증상 없는 고혈압에서 시작됩니다. 높은 압력은 수십 년에 걸쳐 뇌의 작은 혈관들을 조용히 손상시킵니다. 그래서 고혈압 관리가 곧 치매 예방의 첫걸음입니다.",
      },
      {
        diseaseSlug: "cerebral-infarction",
        narrative:
          "손상된 혈관이 막히면 뇌경색이 됩니다. 큰 발작 없이 지나가는 작은 경색도 있는데, 이런 '조용한 뇌경색'이 반복되며 뇌 손상이 누적됩니다.",
      },
      {
        diseaseSlug: "vascular-dementia",
        narrative:
          "누적된 혈관 손상이 인지 기능을 갉아먹으면 혈관성치매입니다. 계단식으로 갑자기 나빠지는 경과가 특징이고, 혈관 위험인자 관리로 진행을 늦출 수 있습니다.",
      },
      {
        diseaseSlug: "alzheimer",
        narrative:
          "가장 흔한 치매는 알츠하이머병입니다. 혈관성치매와 함께 오는 '혼합형'도 많아 두 질환은 칼로 자르듯 나뉘지 않습니다. 서서히 진행되는 기억력 저하가 신호입니다.",
      },
      {
        diseaseSlug: "nph",
        narrative:
          "마지막은 희망적인 이야기 — 정상압수두증은 보행장애·인지저하·요실금이 함께 오지만, 수술로 호전될 수 있는 '가역성 치매'입니다. 그래서 치매 진단에서 꼭 감별해야 합니다.",
      },
    ],
  },
  {
    slug: "what-is-that-tremor",
    title: "떨림의 정체",
    description: "손이 떨린다고 다 파킨슨병이 아니다 — 떨림 질환 감별 여행",
    steps: [
      {
        diseaseSlug: "essential-tremor",
        narrative:
          "가장 흔한 떨림은 본태성진전입니다. 물건을 잡거나 글씨를 쓸 때, 즉 움직일 때 떨리는 게 특징입니다. 가족력이 흔하고 경과는 대체로 양성입니다.",
      },
      {
        diseaseSlug: "parkinson",
        narrative:
          "반대로 파킨슨병은 가만히 있을 때 떨립니다(안정 시 진전). 떨림보다 중요한 건 동작이 느려지고 몸이 굳는 것 — 도파민 신경세포가 줄어드는 퇴행성 질환입니다.",
      },
      {
        diseaseSlug: "secondary-parkinsonism",
        narrative:
          "파킨슨병과 똑같아 보여도 약물이나 뇌혈관 손상 때문에 생기는 이차성파킨슨증이 있습니다. 원인 약을 끊으면 좋아질 수 있어 반드시 감별해야 합니다.",
      },
      {
        diseaseSlug: "stroke-sequelae",
        narrative:
          "뇌졸중후유증도 떨림·경직·움직임 장애로 나타날 수 있습니다. 비슷한 증상이라도 원인이 다르면 치료가 완전히 달라진다는 것 — 그게 이 여행의 결론입니다.",
      },
    ],
  },
  {
    slug: "heart-to-brain",
    title: "심장에서 뇌까지",
    description: "혈관은 하나로 이어져 있다 — 고지혈증에서 뇌졸중까지 한 줄기 이야기",
    steps: [
      {
        diseaseSlug: "dyslipidemia",
        narrative:
          "출발점은 증상 없는 고지혈증입니다. 혈관 벽에 콜레스테롤이 쌓여 동맥경화가 진행되지만, 아무 느낌이 없어 건강검진에서야 발견되곤 합니다.",
      },
      {
        diseaseSlug: "hypertension",
        narrative:
          "고혈압이 더해지면 혈관 손상은 가속됩니다. 고지혈증과 고혈압은 함께 다니며 심장과 뇌, 양쪽 혈관을 동시에 위협하는 단짝입니다.",
      },
      {
        diseaseSlug: "angina",
        narrative:
          "심장 혈관이 좁아지면 협심증 — 계단을 오를 때 가슴이 조이고, 쉬면 풀립니다. 혈관이 보내는 마지막 경고장에 가깝습니다.",
      },
      {
        diseaseSlug: "myocardial-infarction",
        narrative:
          "경고를 지나치면 혈관이 완전히 막히는 심근경색이 됩니다. 식은땀과 함께 짓누르는 가슴통증이 20분 이상 — 골든타임 안에 막힌 혈관을 뚫어야 합니다.",
      },
      {
        diseaseSlug: "heart-failure",
        narrative:
          "심근경색으로 손상된 심장은 펌프 힘이 떨어져 심부전으로 이어질 수 있습니다. 숨이 차고 다리가 붓는 만성 질환으로, 평생 관리가 필요해집니다.",
      },
      {
        diseaseSlug: "stroke",
        narrative:
          "그리고 같은 혈관 이야기가 뇌에서 일어나면 뇌졸중입니다. 심장과 뇌는 한 혈관계로 이어져 있어, 위험인자 관리는 둘을 동시에 지키는 일입니다.",
      },
    ],
  },
];
