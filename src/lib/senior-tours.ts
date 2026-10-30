import type { Tour } from "./tours";

// Older-adult learning paths compare conditions; steps are not a disease progression.
export const SENIOR_TOURS: Tour[] = [
  {
    slug: "walking-with-age",
    title: "걸음이 느려지는 이유",
    description: "파킨슨병부터 관절·근육까지 — 고령층의 보행 변화를 비교하는 여행",
    audience: "고령층 건강",
    summary: ["파킨슨병에서는 떨림 외에도 동작과 균형의 변화를 살펴봐요.", "보행 어려움은 척추·관절·근육에서도 시작될 수 있어요.", "이 경로는 여러 원인을 비교하는 순서이며, 한 질병이 다음 질병으로 바뀐다는 뜻은 아니에요."],
    sources: [
      { title: "NIA · 파킨슨병", url: "https://www.nia.nih.gov/health/parkinsons-disease/parkinsons-disease-causes-symptoms-and-treatments" },
      { title: "NIAMS · 척추관협착증", url: "https://www.niams.nih.gov/health-topics/spinal-stenosis" },
      { title: "NIAMS · 골관절염", url: "https://www.niams.nih.gov/health-topics/osteoarthritis" },
      { title: "NIA · 고령층의 낙상과 근감소증", url: "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention" },
    ],
    steps: [
      { diseaseSlug: "parkinson", narrative: "파킨슨병은 나이가 들수록 위험이 높아지는 뇌 질환입니다. 떨림뿐 아니라 움직임이 느려지거나 보폭이 작아지고 균형을 잡기 어려워질 수 있어요. 하지만 걸음이 느려졌다는 사실만으로 파킨슨병을 판단할 수는 없습니다." },
      { diseaseSlug: "spinal-stenosis", narrative: "이번에는 척추로 시선을 옮겨 봅니다. 척추관협착증은 신경이 지나는 공간이 좁아지는 질환으로, 허리 부위에 생기면 서거나 걸을 때 다리 통증·저림이 심해질 수 있어요. 앞 단계와는 다른 보행 어려움의 원인을 비교하는 것입니다." },
      { diseaseSlug: "osteoarthritis", narrative: "관절의 통증과 뻣뻣함도 움직임을 줄일 수 있습니다. 골관절염은 나이가 들수록 흔해지며 무릎이나 고관절 등에 생기면 걷기나 의자에서 일어나기가 어려워질 수 있어요. 뇌뿐 아니라 관절의 변화도 함께 살펴보는 이유입니다." },
      { diseaseSlug: "sarcopenia", narrative: "마지막은 근육의 힘과 기능이 줄어드는 근감소증입니다. 걷기·계단 오르기·일어서기가 힘들어질 수 있고 낙상 위험과도 관련됩니다. 보행 변화는 여러 원인이 겹칠 수 있으므로, 일상에 영향을 주는 변화는 진료에서 함께 확인하는 것이 좋습니다." },
    ],
  },
  {
    slug: "bones-and-falls",
    title: "낙상과 골절을 이해하기",
    description: "골다공증·척추·고관절·근육 — 노년의 이동 능력을 함께 살펴봐요",
    audience: "고령층 건강",
    summary: ["골다공증은 골절 전까지 뚜렷한 증상이 없을 수 있어요.", "척추와 고관절 골절이 일상생활에 미치는 영향을 살펴봤어요.", "뼈의 강도와 근력·균형을 함께 보는 것이 중요해요. 낙상이나 골절이 필연적인 것은 아니에요."],
    sources: [
      { title: "NIAMS · 골다공증", url: "https://www.niams.nih.gov/health-topics/osteoporosis" },
      { title: "NIAMS · 추가 골절 예방", url: "https://www.niams.nih.gov/health-topics/preventing-another-broken-bone" },
      { title: "NIA · 고령층의 낙상과 골절", url: "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention" },
    ],
    steps: [
      { diseaseSlug: "osteoporosis", narrative: "골다공증은 뼈의 강도가 낮아져 골절 위험이 커지는 질환입니다. 고령층에서 중요하게 살펴보지만, 골절이 생기기 전에는 뚜렷한 증상이 없을 수 있어요. 이 투어는 골다공증이 반드시 골절로 이어진다는 이야기가 아닙니다." },
      { diseaseSlug: "vertebral-compression-fracture", narrative: "척추뼈가 눌려 주저앉는 압박골절은 골다공증과 관련될 수 있습니다. 허리 통증이나 키 감소·굽은 자세로 드러나기도 하지만 증상을 잘 느끼지 못하는 경우도 있어요. 뼈가 약해졌을 때 살펴볼 부위 중 하나입니다." },
      { diseaseSlug: "hip-fracture", narrative: "고관절 부위 골절은 고령층의 이동과 독립적인 생활에 큰 영향을 줄 수 있습니다. 낙상과 뼈의 약화가 함께 작용할 수 있어, 골절 이후에는 회복뿐 아니라 추가 골절 위험도 살펴봅니다. 앞의 척추 골절이 이 골절로 바뀐다는 뜻은 아닙니다." },
      { diseaseSlug: "sarcopenia", narrative: "뼈만큼 근육도 중요합니다. 근감소증에 따른 근력·기능 저하와 균형 문제는 낙상 위험에 영향을 줄 수 있어요. 노년의 이동 능력을 이해하려면 뼈의 강도와 근육, 균형, 생활환경을 함께 바라봐야 합니다." },
    ],
  },
  {
    slug: "breathing-with-age",
    title: "나이가 들며 숨이 찰 때",
    description: "폐와 심장을 함께 살펴보는 고령층 호흡곤란 이해 여행",
    audience: "고령층 건강",
    summary: ["숨참은 폐뿐 아니라 심장 질환에서도 나타날 수 있어요.", "고령층의 폐렴은 전형적인 고열·기침과 다르게 나타날 수 있어요.", "증상만으로 원인을 확정할 수 없고 여러 질환이 함께 있을 수도 있어요."],
    sources: [
      { title: "NHLBI · COPD 증상", url: "https://www.nhlbi.nih.gov/health/copd/symptoms" },
      { title: "NHLBI · 폐렴 증상", url: "https://www.nhlbi.nih.gov/health/pneumonia/symptoms" },
      { title: "NHLBI · 심부전 증상", url: "https://www.nhlbi.nih.gov/health/heart-failure/symptoms" },
      { title: "NHLBI · 심방세동 증상", url: "https://www.nhlbi.nih.gov/health/atrial-fibrillation/symptoms" },
    ],
    steps: [
      { diseaseSlug: "copd", narrative: "숨참을 단순히 나이 탓으로만 넘기지 않기 위해 폐부터 살펴봅니다. 만성폐쇄성폐질환(COPD)은 활동할 때의 숨참, 오래가는 기침이나 가래 등으로 나타날 수 있어요. 같은 증상이 다른 질환에서도 생길 수 있으므로 증상만으로 진단하지 않습니다." },
      { diseaseSlug: "pneumonia", narrative: "폐렴은 폐의 감염으로 숨참이나 기침을 일으킬 수 있습니다. 고령층에서는 뚜렷한 고열 대신 기운 저하나 갑작스러운 혼란이 나타나는 등 전형적이지 않을 수 있어요. COPD가 반드시 폐렴으로 진행한다는 뜻은 아니며, 서로 다른 원인을 비교하는 단계입니다." },
      { diseaseSlug: "heart-failure", narrative: "이번에는 심장으로 이동합니다. 심부전에서도 활동할 때 숨이 차거나 누웠을 때 호흡이 불편하고, 다리가 붓는 등의 증상이 나타날 수 있어요. 숨참을 이해할 때 폐와 심장을 함께 살펴보는 이유입니다." },
      { diseaseSlug: "atrial-fibrillation", narrative: "심장 박동이 불규칙해지는 심방세동은 피로·두근거림·숨참을 일으킬 수 있지만 증상이 없기도 합니다. 이 여정의 질환들은 함께 나타날 수도 있으며, 순서대로 발생하는 것은 아닙니다. 갑자기 심하게 숨이 차거나 가슴 통증·실신이 동반되면 즉시 응급 도움을 받아야 합니다." },
    ],
  },
];
