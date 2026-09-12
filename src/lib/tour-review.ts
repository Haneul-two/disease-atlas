export type ReviewQuestion = {
  prompt: string;
  choices: [string, string];
  answer: number;
  explanation: string;
};

// Review the existing tour text; these questions do not evaluate the reader's health.
export const TOUR_REVIEW: Record<string, ReviewQuestion[]> = {
  "road-to-dementia": [
    { prompt: "이 투어의 단계는 무엇을 보여 주나요?", choices: ["모든 사람이 겪는 질병 진행 순서", "혈관 위험과 인지저하 원인의 비교"], answer: 1, explanation: "질환 간 관계를 비교하는 학습 순서입니다. 한 질환이 다음 질환을 뜻하지는 않습니다." },
    { prompt: "알츠하이머병과 혈관성 변화는 함께 나타날 수 있나요?", choices: ["함께 나타날 수 있어요", "언제나 완전히 분리되어 있어요"], answer: 0, explanation: "투어에서 살펴본 것처럼 여러 원인이 함께 있을 수 있어 원인을 구분하는 진료가 중요합니다." },
  ],
  "what-is-that-tremor": [
    { prompt: "손 떨림만으로 파킨슨병을 판단할 수 있나요?", choices: ["떨리면 파킨슨병이에요", "다른 증상과 원인도 함께 살펴야 해요"], answer: 1, explanation: "떨림은 여러 원인에서 나타나는 증상이며, 움직임·경직·약물·병력 등을 함께 살핍니다." },
    { prompt: "약물과 관련된 증상이 의심된다면?", choices: ["진료에서 복용 약과 조정 가능성을 검토해요", "복용 약을 임의로 중단해요"], answer: 0, explanation: "투어에서 안내한 대로 복용 약을 임의로 중단하지 않고 진료에서 검토합니다." },
  ],
  "heart-to-brain": [
    { prompt: "심장과 뇌를 함께 살펴보는 이유는?", choices: ["심장 질환 다음에는 반드시 뇌졸중이 생겨요", "공유하는 혈관 위험 요인이 있어요"], answer: 1, explanation: "공유하는 위험 요인을 이해하는 투어이며, 개인의 정해진 진행 경로를 보여 주지는 않습니다." },
    { prompt: "갑작스런 얼굴 처짐·팔 약화·말 어눌함이 보이면?", choices: ["즉시 응급 도움을 받아요", "다음 투어 단계까지 기다려요"], answer: 0, explanation: "투어에서 배운 뇌졸중 의심 신호입니다. 지체하지 않고 응급 도움을 받아야 합니다." },
  ],
  "walking-with-age": [
    { prompt: "걸음이 느려지면 파킨슨병이라고 단정할 수 있나요?", choices: ["네, 원인은 하나예요", "아니요, 척추·관절·근육도 살펴봐요"], answer: 1, explanation: "이 투어는 보행 변화의 여러 원인을 비교합니다. 여러 원인이 겹칠 수도 있습니다." },
    { prompt: "근감소증 단계에서 함께 살펴본 것은?", choices: ["근육의 힘과 일상 동작", "기억력만"], answer: 0, explanation: "걷기·계단 오르기·일어서기 같은 일상 기능과 근력의 관계를 살펴봤습니다." },
  ],
  "bones-and-falls": [
    { prompt: "골다공증은 골절 전까지 증상이 뚜렷하지 않을 수 있나요?", choices: ["그럴 수 있어요", "언제나 먼저 심한 통증이 있어요"], answer: 0, explanation: "투어의 첫 단계는 증상이 뚜렷하지 않을 수 있다는 점을 설명합니다." },
    { prompt: "낙상을 이해할 때 무엇을 함께 봐야 하나요?", choices: ["뼈만 살펴봐요", "뼈·근력·균형·생활환경을 함께 봐요"], answer: 1, explanation: "투어에서 뼈의 강도와 근육, 균형, 생활환경을 함께 살펴본 이유입니다." },
  ],
  "breathing-with-age": [
    { prompt: "숨참은 어느 쪽 질환과 관련될 수 있나요?", choices: ["폐뿐 아니라 심장 질환과도 관련돼요", "폐 질환에서만 나타나요"], answer: 0, explanation: "COPD·폐렴과 심부전·심방세동을 함께 비교한 이유입니다." },
    { prompt: "이 투어만으로 숨참의 원인을 확정할 수 있나요?", choices: ["네, 가장 비슷한 증상을 고르면 돼요", "아니요, 여러 원인이 함께 있을 수도 있어요"], answer: 1, explanation: "이 투어는 원인을 비교하는 학습 자료입니다. 증상만으로 진단하지 않습니다." },
  ],
};
