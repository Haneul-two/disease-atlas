# v1.2 설계 — 끊긴 별자리 잇기 (관계 밀도 확충 + 관계 타입·방향 시각화)

- 작성일: 2026-09-03
- 상태: 설계 승인 대기
- 선행: `2026-06-11-tour-content-expansion-design.md` (v1.1)
- 후속 예정: v1.3(URL·공유·SEO), v1.4(증상 역탐색·경로 찾기)

---

## 1. 배경 — 무엇이 문제인가

`prisma/seed-data.ts`의 질병·관계를 그래프로 놓고 연결성을 직접 계산한 결과:

| 항목 | 값 |
|---|---|
| 질병 | 80개 |
| 수동 관계(DiseaseRelation) | 49개 |
| **관계가 하나도 없는 질병(고립 노드)** | **38개 (47.5%)** |
| 연결 성분 | 46덩어리 |
| 최대 성분 크기 | 21 (고혈압·당뇨 중심 혈관질환 뭉치) |
| 차수 상위 | 고혈압 13, 당뇨 6, 뇌경색 6, 심근경색 4 |

즉 현재 아틀라스는 **"혈관질환 별자리 하나 + 흩어진 낱별 38개"**다.
기본 엣지 필터가 `합병·연관`(수동 관계)만 켜져 있으므로, 사용자가 폐렴·위암·백내장 같은
노드를 클릭하면 상세 패널의 "관련 질환" 섹션이 **비어 있는 채로** 보인다.
그래프 앱의 핵심 가치 절반이 UI가 아니라 **데이터 때문에** 죽어 있다.

### 부수 문제: 이미 가진 정보를 버리고 있다

`src/lib/atlas-data.ts`의 `getAtlasGraph()`가 관계를 `deriveEdges`에 넘길 때
`{ fromId, toId, note }`만 전달하고 **`type`을 버린다**.
DB에는 `progression`(위염→위궤양 등)이 저장돼 있지만 화면에서는 `comorbidity`와
완전히 동일하게 그려지고, 방향도 표현되지 않는다.

또한 `deriveEdges`는 `pairKey()`로 **무순서 병합**을 하며 `source = min(a,b)`로 고정하므로,
관계의 방향(from→to)이 구조적으로 소실된다.

---

## 2. 목표 (검증 가능)

| 지표 | 현재 | 목표 | 검증 수단 |
|---|---|---|---|
| 고립 노드 | 38 | **0** | `npm test` (신규 graph-health) |
| 연결 성분 | 46 | **≤ 3** (근거: 5절 규칙 3) | `npm test` |
| 수동 관계 | 49 | **≥ 120** | `npm test` |
| note 없는 관계 | (미검증) | **0** | `npm test` |
| 관계 타입이 화면에 반영 | ✗ | ✓ (4종 + 방향 화살표) | 시각 확인 |

---

## 3. 비목표 (이번에 하지 않는 것)

- **부위 확충**(눈·귀 / 피부 / 비뇨·생식 / 혈액) — 80개도 관계가 비어 있는 상태에서
  120개로 늘리면 고립 노드만 늘어난다. **먼저 채우고, 그다음 넓힌다.**
- **출처(reference) 필드 추가** — 스키마·admin·UI를 모두 건드린다. v1.3 이후 검토.
- **경로 찾기 UI** — v1.4. 단 v1.2가 만드는 "연결 성분 ≤ 3"이 그 전제조건이다.
- **URL/딥링크/SEO** — v1.3.
- 관계 자동 추론(공통 증상 기반 자동 생성) — 수동 큐레이션의 교육적 가치가 핵심이다.

---

## 4. 데이터 모델 — 관계 타입 4종 + 방향

**스키마 변경 없음.** `DiseaseRelation.type`은 이미 `String @default("comorbidity")`이므로
값 정의만 확정한다.

| type | 뜻 | 예시 | 방향 |
|---|---|---|---|
| `risk` | 위험인자 | 고혈압 → 뇌졸중 | 방향 있음 |
| `progression` | 진행 | 위염 → 위궤양 → 위암 | 방향 있음 |
| `complication` | 합병증 | 당뇨병 → 당뇨망막병증 | 방향 있음 |
| `comorbidity` | 동반 | 류마티스관절염 ↔ 골다공증 | 무방향 |

`src/lib/atlas-types.ts`에 추가:

```ts
export const RELATION_TYPES = ["risk", "progression", "complication", "comorbidity"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];
export const RELATION_LABELS: Record<RelationType, string> = {
  risk: "위험인자", progression: "진행", complication: "합병증", comorbidity: "동반",
};
export const DIRECTED_RELATIONS: RelationType[] = ["risk", "progression", "complication"];
```

`AtlasEdge`에 추가되는 필드:

```ts
relationType?: RelationType;   // 수동 관계일 때만
relationFrom?: string;         // 방향 있는 관계의 시작 노드 id
relationTo?: string;           // 방향 있는 관계의 끝 노드 id
```

병합 규칙: 같은 쌍에 여러 수동 관계가 있으면 **우선순위 progression > complication > risk > comorbidity**로
대표 하나를 고른다(스토리라인이 되는 진행 관계를 살리기 위해).

---

## 5. 관계 콘텐츠 작성 규칙

작성 방식은 **부위별 초안 생성 → 사용자 통째 검수**로 확정.

무작정 채우면 "같은 부위라서 이었다" 수준의 무의미한 선이 되므로 4가지 규칙을 지킨다.

1. **모든 관계에 `note` 한 줄 필수** — 왜 이어지는가를 한 문장으로. 테스트로 강제한다.
2. **고립 38개는 각각 교육적으로 가장 의미 있는 관계 1~3개만.** 양을 채우려고 억지 연결 금지.
3. **부위를 넘나드는 관계를 우선한다.** 같은 부위끼리만 이으면 클러스터가 통째로
   고립된 섬으로 남아, 연결 성분이 5개 부위 = 5덩어리로 수렴한다.
4. **허브 차수 상한 20.** 고혈압에 전부 붙이면 방사형으로 폭발한다.
   현재 고혈압 13 → 상한 20 안에서만 추가.

작업 순서(초안 생성 단위): 뇌·신경 → 가슴 → 복부 → 관절 → 내분비 →
마지막에 **부위 교차 관계**를 한 번 훑어 성분을 합친다.

---

## 6. 코드 변경 지점

| 파일 | 변경 |
|---|---|
| `prisma/seed-data.ts` | `relations` 배열 확충(49 → ~130). `RelationSeed`를 `{ from; to; type: RelationType; note: string }`으로 좁힘 — 기존 49개 전부 note를 갖고 있어 안전하게 필수화 가능(확인 완료) |
| `src/lib/atlas-types.ts` | `RelationType`·라벨·방향 상수 추가, `AtlasEdge`에 3필드 추가 |
| `src/lib/atlas-layout.ts` | `deriveEdges`의 `ManualRelation`에 `type` 추가, 병합 시 대표 타입·방향 보존 |
| `src/lib/atlas-data.ts` | `getAtlasGraph()`에서 관계 매핑 시 `type` 전달 (현재 버려지는 지점) |
| `src/components/atlas/AtlasFlow.tsx` | 방향 관계는 `source/target`을 관계 방향으로 세우고 `markerEnd` 부착. `progression`은 굵기·불투명도 강조 |
| `src/components/atlas/DetailPanel.tsx` | "관련 질환"을 타입별 그룹(위험인자/진행/합병증/동반)으로 렌더 + 방향 표기(`→` / `←`) |
| `tests/graph-health.test.ts` | 신설 (아래 8절) |
| `scripts/fix-relation-types.ts` | 신설 — 기존 49개 중 타입이 바뀌는 건의 1회성 정정 (9절) |

---

## 7. 시각 설계

- **방향 화살표**: `DIRECTED_RELATIONS`에 속하면 React Flow `markerEnd`(작은 삼각형, 엣지 색상 상속).
  무방향(`comorbidity`)은 마커 없음 — 지금과 동일.
- **`progression` 강조**: 진행 관계는 스토리라인(투어의 뼈대)이므로 평상시 불투명도를
  `relation` 기본 0.3 → **0.45**, 굵기 1 → **1.3**으로 올린다. 나머지 관계는 현행 유지.
- **상세 패널 그룹핑**: 관련 질환을 `위험인자 → / 진행 → / 합병증 → / 동반` 소제목으로 묶고,
  각 항목에 기존처럼 `note`를 붙인다. 방향은 현재 노드 기준으로 `→`(내가 원인) / `←`(내가 결과)로 표기.
- **범례**: 기존 엣지 타입 토글(합병·연관/공통증상/같은계통/같은부위)은 **그대로 둔다.**
  관계 4종은 그 안의 하위 구분이므로 토글을 늘리지 않는다(필터 과밀 방지).

### 리스크 — 엣지 밀도

관계 49 → 130이면 기본 표시 엣지가 **2.6배**가 된다. 별자리 미학이 실타래가 될 수 있다.
데이터를 실제로 넣은 뒤 육안 확인하고, 과밀하면 이 순서로 조절한다:
1. 허브(차수 10 이상) 노드에 닿는 엣지의 평상시 불투명도를 낮춘다
2. 그래도 과밀하면 기본 표시를 `progression` + `complication`만으로 좁히고
   `risk`·`comorbidity`는 노드 강조 시에만 점등

**이건 해보기 전에는 알 수 없으므로 설계에서 확정하지 않는다.**

---

## 8. 테스트 — `tests/graph-health.test.ts` (신설)

`prisma/seed-data.ts`를 직접 임포트해 순수 계산으로 검증한다(DB 불필요, 기존 테스트와 동일 방식).

1. **고립 노드가 0개다** — 모든 질병이 최소 1개의 수동 관계를 갖는다
2. **연결 성분이 3개 이하다** — 별자리가 조각나지 않았다.
   3인 이유: 부위 내부만 이으면 5개 부위 = 5덩어리로 수렴한다. 부위 교차 관계를 넣어
   그보다 확실히 적은 값을 요구해야 "섬으로 남지 않았다"는 것이 실제로 검증된다.
   1(완전 연결)을 요구하지 않는 이유는, 억지 연결을 만들어서라도 통과시키려는 압력을 피하기 위함이다.
3. **모든 관계에 note가 있다** (빈 문자열 불가)
4. **자기참조 관계가 없다** (`from !== to`)
5. **관계 type이 4종 중 하나다**
6. **어떤 질병의 차수도 20을 넘지 않는다** — 허브 폭발 감시
7. **관계 수가 120개 밑으로 줄지 않는다** — 회귀 방지

기존 `tests/seed-data.test.ts`의 관계 검증(from/to 유효성, 중복 없음)은 그대로 둔다.

---

## 9. 배포 / 마이그레이션 함정

`DiseaseRelation`의 유니크 키는 `@@unique([fromId, toId, type])`이고, 시드는 **upsert(비파괴)**다.
따라서 기존 49개 중 타입을 바꾸는 건(예: 고혈압→뇌졸중을 `comorbidity`에서 `risk`로)은
**새 행이 추가되고 옛 행이 유령으로 남는다.**

대응:
- `scripts/fix-relation-types.ts`를 두어 **타입이 바뀌는 건만** 명시적으로 UPDATE한다
  (전례: `scripts/fill-medical-terms.ts`).
- **전체 prune(시드에 없는 관계 삭제)은 하지 않는다** — `/admin`에서 수동 추가한 관계까지
  지울 위험이 있다.

배포 절차:
1. 로컬에서 `npm test` 통과 확인
2. prod DB에 타입 정정 스크립트 실행 → 시드 실행
   `DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"') npm run db:seed`
   (`db:seed`는 dotenv를 읽지 않으므로 수동 주입 필요 — v1.1에서 확인된 사항)
3. master 푸시 = Vercel 자동 배포
4. 배포 후 고립이 많던 노드(폐렴·위암·백내장 등) 몇 개를 눌러 관련 질환이 채워졌는지 확인

⚠️ `.env.local`이 prod Neon을 가리키므로 **로컬 dev도 prod DB에 붙는다.** 시드 실행 시 주의.

---

## 10. 이후 로드맵 (이번 스펙 범위 아님)

- **v1.3 (URL·공유)** — `/d/[slug]` 라우트 + `generateMetadata` + OG 카드 +
  그래프 상태(선택 노드·필터·투어) URL 동기화 + ISR 정적화.
  현재 공유 가능한 URL이 문자 그대로 0개이고 `page.tsx`는 `force-dynamic`이다.
- **v1.4 (탐색)** — 증상 다중 선택 → 해당 질병 점등(공유 증상 51종 데이터 이미 존재),
  두 질병 사이 경로 찾기(v1.2의 "성분 ≤ 3"이 전제), 계통 필터 추가.
