# 배포 가이드 — Vercel + Neon Postgres

이 브랜치(`feat/postgres`)는 DB를 SQLite → Neon Postgres로 전환한 상태다.
**Neon DB를 만들고 DATABASE_URL을 설정하기 전까지는 로컬 실행이 안 되므로**,
아래 절차를 마친 뒤 master에 머지한다.

## 1. Neon DB 만들기 (Vercel 마켓플레이스)

1. [vercel.com](https://vercel.com) 로그인 → 프로젝트 생성(GitHub 연동 또는 `vercel` CLI).
2. 프로젝트 → **Storage** 탭 → **Create Database** → **Neon Postgres** 선택(무료 플랜).
3. 생성하면 `DATABASE_URL` 환경변수가 프로젝트에 자동 주입된다.
   - 서버리스용 **풀링 엔드포인트**(호스트에 `-pooler` 포함)인지 확인.

## 2. 환경변수

Vercel 프로젝트 → Settings → Environment Variables:

| 이름 | 값 |
|---|---|
| `DATABASE_URL` | (Neon이 자동 주입) |
| `ADMIN_PASSWORD` | 강력한 비밀번호로 직접 설정 (`.env`의 기본값 사용 금지) |

로컬 개발용으로는 Neon 콘솔에서 **dev 브랜치**를 만들어 그 커넥션 스트링을
`.env`의 `DATABASE_URL`에 넣는다.

## 3. 스키마 적용 + 시드

로컬에서 prod(또는 dev 브랜치) URL을 `.env`에 넣고:

```bash
npm run db:deploy   # prisma migrate deploy — 테이블 생성
npm run db:seed     # 시드 (upsert 방식이라 재실행해도 안전)
```

## 4. 배포

- GitHub 연동: master에 머지 후 push → 자동 배포.
- CLI: `npm i -g vercel` → `vercel login` → `vercel --prod`.

빌드 시 `postinstall`에서 `prisma generate`가 자동 실행된다.

## 체크리스트

- [ ] Neon DB 생성, DATABASE_URL 확인 (풀링 엔드포인트)
- [ ] ADMIN_PASSWORD 프로덕션 값 설정
- [ ] `npm run db:deploy` + `npm run db:seed`
- [ ] feat/postgres → master 머지
- [ ] 배포 후 `/` 그래프 로드 + `/admin` 로그인 확인
