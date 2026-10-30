# 장기·관계 탐색과 고령층 투어 — 2026-09-12

## 사용자에게 달라진 점

- 신체의 뇌·폐·심장·간·위·장·콩팥·무릎을 눌러 관련 질병을 강조하고 목록으로 탐색한다. 작은 화면과 나머지 부위는 우측 상단 ‘장기 탐색’ 목록으로 접근한다.
- 장기 목록에서 질병을 선택하면 기존 상세·공유·관련 질병 흐름으로 이어진다. 필터로 숨긴 부위도 장기 목록에서 선택하면 표시한다.
- 관계선을 클릭하거나 Enter/Space로 선택하면 관계 종류·방향·해설·공통 증상·분류를 확인할 수 있다. 모바일에서는 질병 상세의 ‘연결선 설명 보기’ 목록도 제공한다.
- 관계선 터치 영역은 화면상 24px로 유지한다. 흐리게 표시한 비관련 선은 포인터 입력을 받지 않는다. 신체 오버레이의 빈 공간은 지도 클릭을 가로막지 않는다.
- 모바일 탐색 카메라는 상단 검색 버튼과 하단 시트를 제외한 영역에 관련 질병들을 맞춘다. 탐색 시트는 접기·펼치기와 Escape 닫기를 지원한다.
- 같은 질병 쌍의 여러 수동 관계와 각각의 해설을 보존한다. 기존에는 나중 해설이 대표 관계와 무관하게 덮어쓰였는데, 대표 관계와 대표 해설을 함께 선택하도록 수정했다. DB 관계 유형 자체는 바꾸지 않았다.

## 고령층 투어 3개 추가 — 총 6개

각 4단계이며, 질병이 반드시 순서대로 진행한다는 서술 대신 원인 비교와 이해를 중심으로 구성했다. 참고자료 링크, 완료 요약, 저장·이어보기·공유는 기존 투어와 같은 방식으로 작동한다.

1. **걸음이 느려지는 이유** (`walking-with-age`): 파킨슨병, 척추관협착증, 골관절염, 근감소증. 기존 ‘떨림의 정체’와 구분해 보행 변화에 초점을 맞췄다.
2. **낙상과 골절을 이해하기** (`bones-and-falls`): 골다공증, 척추압박골절, 고관절골절, 근감소증.
3. **나이가 들며 숨이 찰 때** (`breathing-with-age`): COPD, 폐렴, 심부전, 심방세동.

### 해설 참고자료

- [NIA 파킨슨병](https://www.nia.nih.gov/health/parkinsons-disease/parkinsons-disease-causes-symptoms-and-treatments): 연령과 위험, 운동 완만·보행·균형 변화.
- [NIAMS 척추관협착증](https://www.niams.nih.gov/health-topics/spinal-stenosis), [골관절염](https://www.niams.nih.gov/health-topics/osteoarthritis): 보행 시 통증과 기능 변화.
- [NIAMS 골다공증](https://www.niams.nih.gov/health-topics/osteoporosis), [추가 골절 예방](https://www.niams.nih.gov/health-topics/preventing-another-broken-bone), [NIA 낙상과 골절](https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention): 골절·근감소증·낙상에 대한 설명.
- [NHLBI COPD](https://www.nhlbi.nih.gov/health/copd/symptoms), [폐렴](https://www.nhlbi.nih.gov/health/pneumonia/symptoms), [심부전](https://www.nhlbi.nih.gov/health/heart-failure/symptoms), [심방세동](https://www.nhlbi.nih.gov/health/atrial-fibrillation/symptoms): 증상 비교. 각 링크는 해당 투어의 참고자료에도 제공한다.

## 빌드 문제 수정

개발에서는 표시되던 새 CSS가 프로덕션 산출물에서 빠지는 문제를 실제 캡처로 발견했다. 같은 소스를 PostCSS로 직접 처리하면 정상인데, 기존 Turbopack 파일 시스템 빌드 캐시를 재사용하면 새 CSS가 누락됐다. 설치된 Next.js 문서에 따라 `experimental.turbopackFileSystemCacheForBuild: false`로 설정한 뒤 새 CSS 포함과 실제 화면 복원을 확인했다. 빌드 캐시 가속을 사용하지 않는 비용이 있으며, 이후 캐시 문제 해결 여부를 확인한 뒤 재활성화할 수 있다.

## 화면

- [장기 목록](explore-index.jpg)
- [폐 질병 강조](explore-organ.jpg)
- [모바일 장기 목록](explore-mobile.jpg)
- [모바일 관계 설명](explore-edge.jpg)
- [파킨슨병으로 시작하는 투어](explore-tour.jpg)

로컬 미리보기: http://127.0.0.1:3101

원격 push·배포·DB 쓰기는 실행하지 않았다. 장기·관계 탐색 시트 선택은 임시 UI 상태이며, 기존 질병·투어 링크와 진행 기록은 유지한다.

개발 서버가 생성한 루트 `AGENTS.md`, `CLAUDE.md`는 자동 승인 검토가 삭제를 거절하여 그대로 남겼다. 기능 변경 커밋에는 포함하지 않는다.

## 최종 검증

- 단위 테스트 49개 통과: 복수 관계 해설 보존·대표 관계 일치 포함.
- 타입 검사·린트·프로덕션 빌드 통과.
- 최종 프로덕션 앱에서 브라우저 시나리오 30개 모두 통과(1.6분).
- 신규 8개 시나리오: 장기 직접 클릭·질병 이동, 모바일 장기 목록·필터·Escape, 관계선 키보드 선택, 모바일 연결 설명·카메라 여백, 신규 투어 3개 완료·새로고침 복원, 관계선 실제 포인터 클릭.
- 프로덕션 스타일 누락 재발 감시를 위해 장기 클릭 영역의 투명도도 검증한다.
- 데스크톱과 모바일 캡처 중 페이지 오류 없음. 모바일 문서 가로 넘침 없음. Chromium 및 모바일 에뮬레이션 기준이며 Safari 실기기는 미검증.
