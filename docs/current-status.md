# Current Status

이 문서는 **동료 개발자 또는 동료 AI 에이전트가 현재 프로젝트 상태를 빠르게 파악하기 위한 handoff 문서**다.
긴 문서를 모두 읽기 전에 이 문서를 먼저 보면 현재 맥락을 빠르게 이해할 수 있다.

## 프로젝트 목적
동료 개발자 2인이 함께 작은 제품을 실제로 출시해보며,
아이템 선정 → MVP 정의 → 개발 → 배포 → 피드백 반영까지의 전체 협업 사이클을 경험하는 것이 목적이다.

- 수익화가 1차 목표는 아님
- 실제 출시 경험과 협업 경험이 우선
- 범위를 작게 잡고 끝까지 가는 것이 중요

## 현재 확정된 사항
### 1. 프로젝트 아이템
- **duoboard**
- 설명: 2인 회고/할 일 보드

### 2. 제품 형태
- **웹 앱 우선**

### 3. 제품 한 줄 설명
- 둘이 함께 할 일을 관리하고, 짧은 회고를 남기며, 진행 상황을 가볍게 공유할 수 있는 초경량 협업 보드

### 4. 현재 MVP 핵심 방향
- 할 일 관리
- 회고 작성
- 한 화면에서 진행 상황 확인

## 왜 이 아이템을 골랐는가
- 둘이 직접 사용자이므로 피드백이 빠르다.
- 프로젝트를 진행하면서 실제로 바로 써볼 수 있다.
- 기능 범위를 작게 잡기 쉽다.
- 첫 출시 프로젝트로 적합할 만큼 구현 복잡도를 통제하기 쉽다.

## 현재 문서 구조
- `README.md`
  - 프로젝트 목적, 현재 단계, 운영 방식, 다음 할 일
- `docs/00-goal.md`
  - 프로젝트 목표와 성공 기준
- `docs/01-ideas.md`
  - 선택된 아이템(2인 회고/할 일 보드)의 배경, 문제, 핵심 기능, 성공 기준
- `docs/02-mvp-scope.md`
  - MVP 범위, 제외 범위, 확정된 결정 사항
- `docs/03-role-and-rules.md`
  - 역할 분담 및 협업 규칙
- `docs/04-release-checklist.md`
  - 출시 준비 체크리스트
- `docs/05-initial-structure.md`
  - 초기 구현 구조 제안 (기술 스택, 폴더 구조, DB 테이블, 개발 순서)
- `CLAUDE.md`
  - AI 코딩 에이전트용 프로젝트 운영 규칙과 실제 구조 요약

## 현재 단계 요약
현재는 **초대코드 로그인 + 보드 CRUD + 회고 CRUD + Supabase 연결 + Vercel 배포까지 완료된 첫 MVP 실사용 단계**다.
Production / Preview 배포와 외부 접근 검증까지 끝냈고, 이제 남은 핵심은 **실사용 피드백 반영 + 프로젝트 분리 기반 확장 + 작은 UX 개선**이다.

실제 개발 착수 기준으로 이미 완료된 항목:
- 역할 분담 완료 (혜진: 기획/PM/QA, 민규: 개발)
- 화면 흐름 초안 작성
- 초기 구현 구조 정리
- Supabase 계정/프로젝트 생성 완료
- Next.js App Router scaffold 생성 완료
- 초대코드 로그인 + HttpOnly 세션 구현 완료
- 보호 페이지(`/board`, `/retro`) 및 보호 API 구현 완료
- Supabase server-only 연결 및 `tasks`, `retros` 테이블 확인 완료
- task 생성 / 수정 / 삭제 / 상태 변경 구현 완료
- retro 생성 / 수정 / 삭제 구현 완료
- 임시 원격 URL(Pinggy)로 외부 접속 검증 완료
- Vercel production 배포 및 공개 URL 검증 완료
- Vercel preview 배포 및 공개 preview 접근 검증 완료
- `projects` / `project_id` 기반 다중 프로젝트 확장용 코드 구조 반영 완료
- migration 전 live DB와의 하위 호환(legacy single-project fallback) 동작 검증 완료

## 현재 확정된 결정
- 플랫폼: 웹 앱
- 참가자: 혜진 + 민규, 2명 (Hermes는 추후 API로 확장 가능하게만 설계, 지금은 미포함)
- 로그인: 초대코드 입력 화면 → 성공 시 세션 유지 (링크에 코드 노출 안 함)
- 보드 형태: 칸반형 (Todo / Doing / Done)
- 회고 단위: 주간
- 프레임워크: Next.js + App Router
- 스타일링: `src/app/globals.css` 중심의 커스텀 CSS
- 백엔드/DB: Supabase
- 배포 채널: Vercel
- 목표: 작은 범위로 빠르게 배포하고 실제로 써보며 개선

## 지금 실제로 동작하는 것
- `/login`
  - 초대코드 입력 후 세션 발급
- `/board`
  - 세션 확인 후 진입
  - 현재 데이터 source 표시 (`sample`, `supabase`, `sample-fallback`, `legacy-supabase`)
  - task 생성 / 수정 / 삭제
  - Todo / Doing / Done 상태 변경
  - 내부적으로 `projectId` 전달 경로 반영 완료
- `/retro`
  - 세션 확인 후 진입
  - 회고 조회
  - 회고 생성 / 수정 / 삭제
  - 내부적으로 `projectId` 전달 경로 반영 완료
- `/api/tasks`
  - GET 보호 API 동작 확인
  - POST / PATCH 기반 task 반영 경로 구현 완료
  - `projectId` / `project` 파라미터 수용 및 legacy fallback 반영 완료
- `/api/retros`
  - GET 보호 API 동작 확인
  - `projectId` / `project` 파라미터 수용 및 legacy fallback 반영 완료
- Supabase live DB
  - `tasks_assignee_check` 제약 수정 후 `mingyoo`, `hyejin` 모두 정상 반영 확인
  - 아직 `projects` 테이블과 `tasks.project_id`, `retros.project_id`는 live에 migration 적용 전

## 최근 중요 이슈 / 주의점
- 이전 PR에서 `docs/current-status.md`와 `CLAUDE.md`가 실제 구현 상태보다 예전 단계로 되돌아가는 문서 퇴행이 있었음.
- 따라서 **작업 시작 전에 `docs/current-status.md`를 먼저 확인하는 것**을 기본 협업 규칙으로 둔다.
- 브라우저가 Supabase에 직접 접근하지 않고, 반드시 **브라우저 → 서버 함수/API → Supabase** 흐름을 유지해야 한다.
- Supabase repo의 `schema.sql`만 믿지 말고, 실제 hosted 프로젝트의 live constraint도 함께 확인해야 한다.
- 현재 repo에는 `projects` / `project_id` 기반 schema가 반영되어 있지만, hosted Supabase live DB에는 아직 migration을 적용하지 않았다.
- 그래서 현재 코드는 live DB에서 우선 **legacy single-project fallback**으로 동작하고, migration 이후 자동으로 project-scoped 모드로 전환되도록 구성했다.
- Vercel preview는 현재 공개 접근 가능 상태이며, 앱 자체 초대코드 로그인만 거치면 된다.
- Vercel 프로젝트의 Git 배포 설정은 켜져 있으므로 main 갱신 시 자동 배포가 기본 동작이지만, 예전 커밋 상태 로컬 워킹트리에서 실행한 수동 CLI 배포가 preview / production alias를 덮어쓸 수 있다.
- 따라서 배포 이슈를 막기 위해 **production은 기본적으로 GitHub main 기준 자동 배포를 사용하고**, 수동 `vercel deploy` / `vercel deploy --prod`는 긴급 재배포나 확인이 꼭 필요할 때만 사용한다.
- 수동 배포가 필요하면 항상 먼저 `git fetch` + `git pull --ff-only origin main`으로 최신 상태를 맞추고, 배포 후에는 실제 URL 로그인 화면/보드 화면까지 확인한다.

## 이 프로젝트에서 중요하게 보는 점
- 기능을 많이 넣는 것보다 실제로 끝까지 출시하는 것
- 무거운 협업 툴이 아니라 가벼운 2인용 도구로 시작하는 것
- 우리가 직접 사용자로서 써보며 빠르게 개선할 수 있는 구조
- 문서와 실제 코드 상태가 어긋나지 않게 유지하는 것

## 동료 AI가 이해해야 하는 핵심 맥락
1. 이 프로젝트는 아이디어 탐색보다 **출시 경험 확보**가 목적이다.
2. 범위를 작게 유지하는 것이 매우 중요하다.
3. 현재 아이템은 이미 **2인 회고/할 일 보드**로 확정되어 있다.
4. 지금 필요한 것은 새로운 아이디어 제안보다 **실제 동작하는 MVP를 작게 완성하고 배포하는 것**에 가깝다.
5. 보안 방향은 **브라우저에서 Supabase 직결 대신 서버 경유**다.
6. 문서 정리는 부수 작업이 아니라 handoff 품질에 직접 영향을 주는 핵심 작업이다.

## 다음에 기대하는 액션
### 완료
- [x] 역할 분담안 제안 → `docs/03-role-and-rules.md`에 반영
- [x] 기술 스택 초안 제안 → Supabase + Vercel + 웹앱으로 확정
- [x] 프레임워크 최종 결정 → Next.js + App Router로 확정
- [x] 실제 구현 시작용 초기 구조 제안 → `docs/05-initial-structure.md`에 반영
- [x] MVP 핵심 기능 줄이기 → 실질 기능 2개(칸반 보드 / 주간 회고)
- [x] 개발 일정 초안 → `docs/05-initial-structure.md`의 개발 순서(4주 + 여유)
- [x] Supabase 연결 및 테이블 확인
- [x] 로그인/세션/보호 페이지 구현
- [x] task CRUD + 상태 변경 구현
- [x] retro CRUD 구현
- [x] 임시 원격 URL로 외부 접속 검증
- [x] Vercel production 배포 및 로그인/보드 진입 검증
- [x] Vercel preview 배포 및 공개 접근 검증

### 남은 것
- [ ] 동료와 preview 기준 원격 검수 후 UX 피드백 반영
- [ ] Supabase live DB에 `projects` / `project_id` migration 실제 적용
- [ ] 프로젝트 선택 UI / 프로젝트 생성 UI 설계 및 구현
- [ ] 동료에게 프로젝트 선택/전환/생성 UI 작업 범위 전달
- [ ] 필요 시 현재 문서 구조를 실제 구현 상태 기준으로 추가 정리

## 참고
가장 먼저 읽어야 할 문서 우선순위:
1. `docs/current-status.md`
2. `README.md`
3. `docs/02-mvp-scope.md`
4. `docs/01-ideas.md`
