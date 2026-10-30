# 투어 경험 업그레이드 구현

브랜치: `feat/tour-experience`

## 변경한 사용자 흐름

- 투어가 현재 단계의 선택·강조를 관리한다. 모바일 터치 후 남은 hover가 다른 질병을 강조하지 않는다.
- 투어 중에는 일반 필터 대신 학습 경로 안내가 나온다. 종료하면 이전 필터·선택·지도 위치를 복원한다.
- 번호가 붙은 질병과 점선으로 학습 순서를 보여준다. 실제 질병 관계의 화살표와 구분하며 점선의 의미를 안내한다.
- 단계 목차로 직접 이동하고 이전·다음 버튼 또는 방향키로 순서대로 탐색한다.
- 투어와 일반 질병 상세에 공통 모바일 하단 시트를 사용한다. 접기·펼치기 버튼, 스크롤 본문, 고정 하단 버튼을 제공한다.
- 카메라는 시트가 차지하는 공간을 제외한 영역에 현재 학습 대상을 맞춘다. 화면 크기와 시트 높이가 바뀌면 다시 계산한다.
- 마지막 단계는 완료 요약으로 이어진다. 핵심 내용 3개, 질병별 복습, 다시 둘러보기, 다음 투어를 제공한다.
- 모션 감소 설정에서는 카메라 이동과 CSS 모션을 생략한다.

## 구현 구조

- `src/lib/tour-session.ts`: DB에 실제 존재하는 단계 해석, 인덱스 보정, 학습 경로.
- `src/components/atlas/AtlasFlow.tsx`: 탐색 상태와 투어 상태를 분리하고 그래프에 연결.
- `src/components/atlas/usePanelCamera.ts`, `src/lib/atlas-camera.ts`: 실제 노드 크기와 패널 크기를 사용한 화면 배치.
- `src/components/atlas/AtlasSheet.tsx`: 투어와 질병 상세가 공유하는 반응형 패널.
- `src/components/atlas/TourCard.tsx`: 단계 목차, 키보드 이동, 완료·복습 흐름.
- `src/lib/tours.ts`: 기존 3개 투어에 완료 요약 추가. 기존 질병 해설은 유지.

DB 스키마 변경이나 시드 실행은 필요 없다. 진행 영구 저장·계정·URL 공유·새 투어 콘텐츠는 이번 묶음에 포함하지 않았다.

## 검증

- 수정 전 모바일 강조 오류와 필터로 현재 질병을 숨기는 오류를 브라우저 테스트에서 재현했다.
- 단위 테스트 42개 통과.
- 브라우저 시나리오 7개 검증 통과: 모바일 강조, 필터 충돌, 종료 복원, 단계·경로·완료·복습, 모바일 투어 시트, 질병 상세 시트, 가로 화면·키보드·다음 투어.
- 타입 검사, 린트, 최종 프로덕션 빌드 통과.
- Chromium에서 1280×900, 390×844, 375×812, 844×390 화면을 확인했다. iOS Safari 실기기는 미검증.
- 완료 화면은 세션 내 상태이며 새로고침하면 초기 탐색으로 돌아간다.

## 로컬 실행과 브라우저 테스트

기존 `.env`의 유효한 DB 연결이 필요하다. 아래 브라우저 테스트는 `/admin` 쓰기 작업을 하지 않는다.

```powershell
npm.cmd ci
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
```

다른 터미널에서:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

테스트 서버 주소는 `PLAYWRIGHT_BASE_URL`, 기존 Chromium 실행 파일은 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 환경변수로 지정할 수 있다. 브라우저 테스트는 실행 중인 서버를 사용한다.

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

## 구현 화면

- [데스크톱 투어](tour-desktop-after.jpg)
- [모바일 투어](tour-mobile-after.jpg)
- [모바일 완료 요약](tour-complete-after.jpg)
