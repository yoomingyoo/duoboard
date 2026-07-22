# CLAUDE.md

이 파일은 Claude Code나 다른 AI 코딩 에이전트가 duoboard 프로젝트에서 작업할 때 먼저 참고하는 프로젝트 설명서다.

## 언어 규칙
- **항상 한국어로 답변한다.** 코드 주석, 커밋 메시지, 대화 모두 한국어를 기본으로 한다.
- 변수명/함수명 등 코드 자체는 영어 관례를 따르되, 설명은 한국어로 한다.

## 프로젝트 개요
- 이름: duoboard
- 목적: 혜진 + 민규 2인이 쓰는 할 일 관리 + 주간 회고 보드
- 참고 문서: `docs/current-status.md`, `docs/02-mvp-scope.md`, `docs/03-role-and-rules.md`, `docs/05-initial-structure.md`
- 이 리포는 혜진(비개발자, 기획/PM/QA)과 민규(개발 담당, 웹 개발은 처음)가 함께 만든다.
- 목표는 완벽한 구조보다 **실제로 배포 가능한 작은 MVP를 빠르게 만들고 직접 써보는 것**이다.

## 절대 원칙 (위반 금지)
브라우저가 Supabase에 직접 접근하지 않는다. 모든 데이터 요청은
**브라우저 → Next.js 서버 함수/API → Supabase** 순서로만 흐른다.

- Supabase service role key는 서버 환경변수로만 존재한다.
- `NEXT_PUBLIC_`, `VITE_`, `PUBLIC_` 같은 브라우저 노출 접두사가 붙은 환경변수에
  service role key나 초대코드(`INVITE_CODE`)를 절대 넣지 않는다.
- 이 구조가 깨지면 초대코드 기반 보안 자체가 무의미해진다.

## 확정된 결정 사항
| 항목 | 결정 |
|---|---|
| 참가자 | 혜진 + 민규 2명 (Hermes는 추후 API로 확장 가능하게만 설계, 현재 미포함) |
| 로그인 | 초대코드 입력 화면 → 성공 시 세션 쿠키 유지 (URL에 코드 노출 안 함) |
| 보드 상태 | Todo → Doing → Done |
| 담당자 | `hyejin`, `mingyoo` |
| 회고 단위 | 주간 (`author + week_of` 조합 유니크) |
| DB | Supabase (Postgres), RLS 전체 차단 후 서버만 접근 |
| 배포 | Vercel |
| 실시간 동기화 | 넣지 않음 (새로고침으로 충분) |

## 기술 스택 (현재 기준)
- 프레임워크: Next.js + App Router
- 스타일링: Tailwind가 아니라 **`src/app/globals.css` 중심의 커스텀 CSS**
- 데이터 접근: Next.js Route Handler / Server Action을 통해서만 Supabase 호출
- 패키지 매니저: npm

## 실제 폴더 구조 (현재 기준)
```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/page.tsx
│   ├── board/page.tsx
│   ├── retro/page.tsx
│   └── api/
│       ├── tasks/route.ts
│       └── retros/route.ts
├── actions/
│   ├── auth.ts
│   ├── tasks.ts
│   └── retros.ts
├── components/
│   ├── auth/InviteCodeForm.tsx
│   ├── board/
│   │   ├── AddTaskForm.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── TaskCard.tsx
│   ├── common/
│   │   ├── ChevronIcon.tsx
│   │   └── PageHeader.tsx
│   └── retro/RetroForm.tsx
└── lib/
    ├── auth/
    │   ├── api-guard.ts
    │   ├── guard.ts
    │   ├── invite-code.ts
    │   └── session.ts
    ├── supabase/server.ts
    ├── data.ts
    ├── sample-data.ts
    ├── tasks.ts
    └── retros.ts
```

## 현재 실제로 구현된 것
- 초대코드 로그인과 HttpOnly 세션
- 보호 페이지(`/board`, `/retro`)와 보호 API
- task 생성 / 수정 / 삭제 / 상태 변경
- retro 생성 / 수정 / 삭제
- Supabase 연결 및 sample fallback
- 임시 원격 URL을 통한 외부 체험판 확인

## DB 테이블
- `tasks`: id, title, status(todo/doing/done), assignee(hyejin/mingyoo), position, created_at, updated_at
- `retros`: id, author, week_of, good, bad, next_action, created_at (`author + week_of` 유니크)

## 협업 규칙 (docs/03-role-and-rules.md 참고)
- 큰 작업은 작은 단위로 나눠서 진행한다.
- 작업은 기능 브랜치에서 진행하고, 바로 main에 푸시하지 않는다.
- 완성된 작업은 PR로 올린다. 혜진이 디자인/기능을 확인하고 필요하면 직접 브랜치에 수정을 반영하며,
  기술적 판단과 merge 실행은 민규가 담당한다 (혜진은 비개발자라 merge를 직접 하지 않음).
- 작업 시작 전에 **반드시 `docs/current-status.md`를 먼저 읽고 현재 상태를 확인한다.**
- 더 멋진 것보다 더 빨리 출시 가능한 것을 우선한다.

## AI 코딩 에이전트 작업 시 유의사항
- 새 기능을 만들 때 위 "절대 원칙"을 항상 먼저 확인한다.
- 문서를 수정할 때는 실제 구현 상태보다 뒤로 되돌리지 말고, 현재 상태를 반영한다.
- 확정되지 않은 사항(프레임워크, 인증 흐름, 데이터 접근 방식 등)을 임의로 바꾸지 않는다.
- 가능하면 lint/build 또는 실제 동작 검증까지 마친 뒤 커밋한다.
- 커밋 메시지는 한국어 또는 짧은 영어로, 무엇을/왜 바꿨는지 알 수 있게 남긴다.
