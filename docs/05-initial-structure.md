# 초기 구현 구조 제안

민규가 바로 개발을 시작할 수 있도록 정리한 초기 구조 제안이다.
확정 사항(`docs/02-mvp-scope.md`, `docs/current-status.md`)을 기준으로 한다.

---

## 0. 가장 중요한 전제: 데이터는 반드시 서버를 거친다

초대코드 방식으로 단순하게 운영하기로 했으므로, **이번 MVP에서는 브라우저가 Supabase에 직접 접근하지 않는다.**

- Supabase의 anon key 자체는 공개 가능한 키이지만, 이번 프로젝트는 정식 사용자 인증/RLS 구조 대신 초대코드 + 세션 기반으로 단순화하기로 했다.
- 따라서 브라우저가 직접 DB에 붙는 구조보다, 서버에서 세션을 검사한 뒤 Supabase에 접근하는 구조가 더 단순하고 안전하다.

### 채택 방식
1. 브라우저 → **우리 서버(서버 함수)** → Supabase 순서로만 데이터가 흐른다.
2. Supabase 접속 키(service role key)는 **서버 환경변수로만** 보관한다.
3. 서버는 요청마다 초대코드 세션 쿠키를 검증한 뒤에만 데이터를 처리한다.

이 구조에서는 Supabase RLS(행 수준 보안)를 별도로 설계할 필요가 없다 (전체 차단 후 서버만 접근).
보안이 확보되면서 구현도 더 단순해진다.

> **절대 하면 안 되는 것**: `VITE_` / `PUBLIC_` 같은 접두사가 붙은 환경변수에
> Supabase service role key나 초대코드를 넣는 것. 이 접두사는 "브라우저에 노출해도 됨"이라는 뜻이다.

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 프론트엔드 | Next.js + App Router | 최종 결정 사항. 문서/위키의 초기 구조 방향과도 일치 |
| 데이터 접근 | Next.js 서버 액션 또는 Route Handler | 위 0번 전제를 만족시키는 가장 단순한 방법 |
| DB | Supabase (Postgres) | 확정 사항 |
| 배포 | Vercel | 확정 사항 |
| 패키지 매니저 | npm 또는 pnpm | Next.js 기본 흐름에 맞춰 단순하게 시작 가능 |

**실시간 동기화는 MVP에 넣지 않는다.** 2인용 보드이므로 화면 새로고침으로 충분하며,
실시간 기능은 개발량 대비 이득이 작다.

---

## 2. 실질 기능은 2개다

문서상 핵심 기능은 3개(할 일 관리 / 회고 작성 / 보드 확인)이지만,
**"보드 확인"은 "할 일 관리"의 칸반 화면 그 자체**다. 별도 대시보드를 만들지 않는다.

따라서 실제로 구현할 화면은 아래 3개뿐이다.

1. 초대코드 입력 화면
2. 칸반 보드 화면 (= 할 일 관리 + 진행 상황 확인)
3. 주간 회고 화면 (작성 + 목록)

---

## 3. 폴더 구조 (실제 구현 기준)

```
duoboard/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 랜딩: 세션 있으면 /board로 리다이렉트
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── login/page.tsx              # 초대코드 입력 화면
│   │   ├── board/page.tsx              # 칸반 보드 (세션 가드 적용)
│   │   ├── retro/page.tsx              # 주간 회고 작성/목록 (세션 가드 적용)
│   │   └── api/
│   │       ├── tasks/route.ts          # 할 일 조회 API
│   │       └── retros/route.ts         # 회고 조회 API
│   ├── actions/
│   │   ├── auth.ts                     # 초대코드 검증 → 서명된 세션 쿠키 발급 (서버 액션)
│   │   └── tasks.ts                    # 할 일 추가/상태 변경 (서버 액션)
│   ├── components/
│   │   ├── auth/InviteCodeForm.tsx
│   │   ├── board/KanbanBoard.tsx
│   │   ├── board/KanbanColumn.tsx      # Todo / Doing / Done 컬럼
│   │   ├── board/TaskCard.tsx
│   │   ├── board/AddTaskForm.tsx
│   │   ├── retro/RetroForm.tsx
│   │   └── common/PageHeader.tsx
│   └── lib/
│       ├── auth/
│       │   ├── session.ts              # 세션 쿠키 서명/검증 (SESSION_SECRET)
│       │   ├── invite-code.ts          # 초대코드 검증 (INVITE_CODE)
│       │   ├── guard.ts                # 페이지용: 세션 없으면 /login으로 redirect
│       │   └── api-guard.ts            # API 라우트용: 세션 유효 여부만 반환
│       ├── supabase/server.ts          # 서버 전용 Supabase 클라이언트
│       ├── data.ts                     # Supabase 미설정 시 샘플 데이터로 폴백
│       ├── sample-data.ts              # 로컬 개발용 샘플 tasks/retros
│       └── tasks.ts                    # tasks 조회/추가/상태 변경 로직
├── supabase/
│   └── schema.sql                      # 테이블 정의 (실제 DDL)
└── README.md
```

`actions/`, `app/api/`, `lib/supabase/server.ts`는 서버에서만 실행되는 코드다.
`"use client"`가 붙은 컴포넌트에서는 이 파일들을 절대 import하지 않는다.
실수로 키가 노출되는 것을 구조적으로 막는 규칙이다.

Supabase 환경변수(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)가 없으면
`lib/data.ts`가 `lib/sample-data.ts`의 샘플 데이터로 자동 폴백하도록 되어 있어,
로컬에서 Supabase 세팅 전에도 화면 확인이 가능하다.

---

## 4. DB 테이블

### tasks (실제 `supabase/schema.sql` 기준)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | 고유 번호 |
| title | text | 할 일 제목 |
| status | text | `todo` / `doing` / `done` |
| assignee | text | `hyejin` / `mingyoo` |
| position | int | **같은 컬럼 안에서의 순서** (없으면 카드가 옮길 때마다 순서가 튄다) |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 (트리거로 자동 갱신) |

### retros
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | 고유 번호 |
| author | text | `hyejin` / `mingyoo` |
| week_of | date | 해당 주의 월요일 날짜 |
| good | text | 잘한 점 |
| bad | text | 아쉬운 점 |
| next_action | text | 다음 액션 |
| created_at | timestamptz | 작성 시각 |

- `retros`는 `(author, week_of)` 조합에 유니크 제약을 건다. 같은 주에 중복 작성 방지.
- RLS는 **전체 차단**으로 설정한다 (서버만 service role key로 접근).

---

## 5. 환경변수 (`.env.local`, 아직 리포에 예시 파일 없음)

```
# 서버 전용 — 절대 NEXT_PUBLIC_ 접두사 붙이지 말 것
INVITE_CODE=
SESSION_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

네 개 변수 모두 `src/lib/auth`, `src/lib/supabase/server.ts`에서 실제로 읽고 있다.
설정하지 않으면 `INVITE_CODE`는 개발용 기본값(`DUOBOARD-2026`)으로, Supabase 연결 정보는
`lib/data.ts`의 샘플 데이터 폴백으로 동작한다.

초대코드가 유출된 것 같으면 `INVITE_CODE` 값만 바꾸고 Vercel에 재배포하면 즉시 무효화된다.

---

## 6. 개발 순서

| 주차 | 내용 |
|---|---|
| 완료 | Supabase 계정 생성 및 프로젝트 생성 |
| 1주차 | Next.js 리포 세팅, `tasks`/`retros` 테이블 생성, RLS 전체 차단 |
| 1~2주차 | 초대코드 로그인 화면 + 세션 쿠키 |
| 2주차 | 칸반 보드 (할 일 추가 / 상태 변경 / 담당자 지정) → **여기까지가 "2주 내 목표"** |
| 3주차 | 주간 회고 작성/목록 |
| 4주차 | Vercel 배포, 실사용 테스트, 버그 수정 |

6~8주 목표 대비 여유가 남는다. 남는 기간은 실사용 후 개선에 쓴다.

---

## 7. 혜진이 할 일
- 이 문서를 민규에게 전달
- 화면이 나오는 대로 실제로 눌러보며 문구/UX 피드백
- 특히 **0번 전제(브라우저가 Supabase에 직접 접근하지 않는 구조)** 가 지켜지고 있는지
  민규에게 한 번 확인받기
