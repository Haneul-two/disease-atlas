# 투어 이어보기·URL 공유 구현

브랜치: `feat/tour-experience` · 2026-09-12

이전의 투어 안정화·경로·모바일 시트·완료 요약에 이어, 재방문과 공유 흐름을 추가했다.

## 사용자에게 달라진 점

- 현재 투어 단계와 완료 상태를 브라우저에 저장한다. 메뉴에서 이어보기, 처음부터, 완료 요약을 선택한다.
- 진행 중인 투어를 새로고침해도 URL의 같은 단계가 열린다.
- 질병 상세, 투어 단계, 완료 요약의 링크를 복사할 수 있다. 클립보드가 거부되면 읽기 전용 주소 입력으로 수동 복사를 제공한다.
- 질병 선택과 투어 단계 이동을 브라우저 뒤로·앞으로 가기로 다시 방문한다.
- 학습 기록은 이 브라우저에만 저장되며 메뉴에서 지울 수 있다. 다른 탭에서 바뀐 기록도 반영된다.
- 저장이 차단되어도 탐색과 링크는 동작하고, 저장 실패 안내를 표시한다.
- 모바일에서는 해설을 먼저 보여주고 공유 영역을 아래에 둔다. 다음 단계의 해설은 스크롤 처음부터 표시한다.

## URL과 저장 규칙

- 질병: `/?disease=hypertension`
- 투어: `/?tour=road-to-dementia&step=3` — URL의 단계는 1부터 시작한다.
- 완료: `/?tour=road-to-dementia&step=5&done=1`
- 유효한 투어가 있으면 질병 매개변수보다 우선한다. 잘못된 단계는 범위 안으로 보정하고 알 수 없는 질병·투어는 탐색 화면으로 복구한다.
- 공유 링크는 현재 선택에 필요한 매개변수만 포함한다. 기존 캠페인 매개변수 등은 복사하지 않는다.
- 로컬 저장 키: `disease-atlas:tour-progress:v1`. 투어별 현재 질병 slug, 완료 상태, 단계 목록, 갱신 시각을 저장한다.
- 저장 데이터가 손상됐거나 버전이 다르면 무시한다. 단계가 재배열되어도 질병 slug로 이어보고, 단계 구성이 바뀌면 완료 상태를 해제한다.
- 링크가 있으면 저장된 기록으로 덮어쓰지 않는다. 완료 후 복습은 완료 표시를 유지하고, ‘처음부터’는 해당 투어의 진행을 다시 시작한다.

## 검증

- 단위 테스트 총 46개 통과.
- 기존 7개와 신규 9개를 합쳐 브라우저 시나리오 16개 검증 통과.
- 신규 범위: 링크 새로고침·이어보기, 뒤로·앞으로, 완료·재시작·기록 삭제, 저장 차단, 클립보드 거부, 잘못된 URL, 탭 간 동기화, 모바일 화면 너비, 단계 변경 시 스크롤 초기화.
- 타입 검사·린트·최종 프로덕션 빌드 통과.
- Chromium 데스크톱과 모바일 에뮬레이션에서 확인했다. iOS Safari 실기기 및 계정 간 동기화는 지원·검증 범위 밖이다.

## 주요 파일

- `src/lib/atlas-navigation.ts`: URL 읽기·정규화·생성.
- `src/components/atlas/useAtlasNavigation.ts`: History API 구독과 이동.
- `src/lib/tour-progress.ts`: 저장 데이터 검증 및 단계 복원.
- `src/components/atlas/useTourProgress.ts`: 브라우저 저장, 실패 안내, 탭 간 동기화.
- `src/components/atlas/ShareLink.tsx`: 링크 복사와 수동 복사 대체 UI.
- `src/components/atlas/TourMenu.tsx`: 이어보기·처음부터·완료·기록 삭제.
- `tests/atlas-navigation.test.ts`, `tests/e2e/continuity*.spec.ts`: 신규 회귀 검증.

DB·관리자 데이터·의학 콘텐츠를 수정하지 않았으며 배포나 원격 push는 실행하지 않았다.

## 화면

- [모바일 이어보기 메뉴](continuity-menu.jpg)
- [복원한 투어 단계](continuity-tour.jpg)
- [링크 복사](continuity-share.jpg)

## 참고한 공식 문서

- [Next.js Native History API](https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api): 새로고침 없이 URL과 브라우저 이력을 갱신하는 방식. 설치된 Next.js 문서도 확인했다.
- [MDN Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText): 비동기 복사 성공·실패에 따라 안내와 수동 복사 대체 UI를 제공한다.

