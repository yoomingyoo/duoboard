# 출시 체크리스트

## 출시 전
- [x] 아이템 확정
- [x] MVP 범위 확정
- [x] 개발 일정 확정
- [x] 기본 README/소개 문구 작성
- [ ] 테스트 시나리오 점검
- [x] 배포 채널 결정 (Vercel)

## 출시 준비
- [x] 앱/서비스 이름 확정 (duoboard)
- [x] 아이콘/간단한 비주얼 준비
- [x] 소개 문구 작성
- [x] 스크린샷 준비
- [x] 개인정보/이용 관련 최소 문구 검토

## 출시 후
- [ ] preview 기준 원격 검수 진행
- [ ] production 기준 공유 대상 정리
- [ ] 버그/피드백 수집
- [ ] 1차 수정 배포
- [ ] 짧은 회고 작성

## 배포 운영 메모
- [x] main 갱신 시 Vercel production 자동 배포를 기본 경로로 사용
- [x] 수동 `vercel deploy` / `vercel deploy --prod` 전에는 반드시 `fetch/pull`로 최신 main 동기화 확인
- [x] 수동 배포 후에는 실제 preview / production URL에서 로그인 후 UI까지 확인
