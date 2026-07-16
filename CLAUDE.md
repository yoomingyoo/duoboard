# CLAUDE.md

이 파일은 Claude Code가 duoboard 프로젝트에서 작업할 때 항상 참고하는 프로젝트 설명서다.

## 언어 규칙
- **항상 한국어로 답변한다.** 코드 주석, 커밋 메시지, 대화 모두 한국어를 기본으로 한다.
- 변수명/함수명 등 코드 자체는 영어 관례를 따르되, 설명은 한국어로 한다.

## 프로젝트 개요
- 이름: duoboard
- 목적: 혜진 + 민규 2인이 쓰는 할 일 관리 + 주간 회고 보드
- 참고 문서: `docs/current-status.md`, `docs/02-mvp-scope.md`, `docs/03-role-and-rules.md`, `docs/05-initial-structure.md`
- 이 리포는 혜진(비개발자, 기획/PM/QA)과 민규(개발 담당, 웹 개발은 처음)가 함께 만든다.
  민규가 웹 프레임워크 경험이 없으므로, 자료가 많고 AI 코딩 도구 지원이 두터운 선택을 우선한다.

## 절대 원칙 (위반 금지)
브라우저가 Supabase에 직접 접근하지 않는다. 모든 데이터 요청은
**브라우저 → 서버 함수 → Supabase** 순서로만 흐른다.

- Supabase service role key는 서버 환경변수로만 존재한다.
- `VITE_` / `PUBLIC_` 같은 브라우저 노출 접두사가 붙은 환경변수에
  service role key나 초대코드(INVITE_CODE)를 절대 넣지 않는다.
- 이 구조가 깨지면 초대코드 기반 보안 자체가 무의미해진다.

## 확정된 결정 사항
| 항목 | 결정 |
|---|---|
| 참가자 | 혜진 + 민규 2명 (Hermes는 추후 API로 확장 가능하게만 설계, 현재 미포함) |
| 로그인 | 초대코드 입력 화면 → 성공 시 세션 쿠키 유지 (URL에 코드 노출 안 함) |
| 보드 상태 | Todo → Doing → Done |
| 담당자 | 나(hyejin) / 민규(mingyoo) |
| 회고 단위 | 주간 (author + week_of 조합 유니크) |
| DB | Supabase (Postgres), RLS 전체 차단 후 서버만 접근 |
| 배포 | Vercel |
| 실시간 동기화 | 넣지 않음 (새로고침으로 충분) |

## 기술 스택 (확정)
- 프론트엔드: Next.js + Tailwind
  - 민규가 웹 개발이 처음이라, TanStack Start보다 자료/커뮤니티가 훨씬 많고
    Claude Code 등 AI 코딩 도구 지원도 더 두터운 Next.js로 확정함.
- 데이터 접근: Next.js 서버 함수(Route Handler / Server Action)를 통해서만 Supabase 호출
- 패키지 매니저: npm (Next.js 기본)

## 폴더 구조
```
src/
├── routes/
│   ├── login.tsx           # 초대코드 입력 화면
│   ├── index.tsx           # 칸반 보드 (메인)
│   └── retro.tsx           # 주간 회고 작성/목록
├── server/
│   ├── auth.ts             # 초대코드 검증, 세션 쿠키 발급/확인
│   ├── tasks.ts            # 할 일 조회/추가/수정/이동
│   └── retros.ts           # 회고 조회/작성
├── components/
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   └── RetroForm.tsx
└── lib/
    └── supabase.server.ts  # 서버 전용 클라이언트
```

## DB 테이블
- `tasks`: id, title, status(todo/doing/done), assignee(hyejin/mingyoo), position(정렬 순서), created_at, updated_at
- `retros`: id, author, week_of, good, bad, next_action, created_at (author+week_of 유니크)

## 협업 규칙 (docs/03-role-and-rules.md 참고)
- 큰 작업은 작은 단위로 나눠서 진행한다.
- 작업은 기능 브랜치에서 진행하고, 바로 main에 푸시하지 않는다.
- 완성된 작업은 PR로 올리고, 혜진이 실제로 확인한 뒤에 합친다.
  "완료"라는 말만으로 병합하지 않는다.
- 더 멋진 것보다 더 빨리 출시 가능한 것을 우선한다.

## Claude Code 작업 시 유의사항
- 새 기능을 만들 때 위 "절대 원칙"을 항상 먼저 확인한다.
- 확정되지 않은 사항(프레임워크 등)을 임의로 바꾸지 않고, 먼저 물어본다.
- 커밋 메시지는 한국어로, 무엇을/왜 바꿨는지 짧게 남긴다.