import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">duoboard MVP scaffold</p>
        <h1>2인 회고/할 일 보드의 첫 화면 골격을 시작했습니다.</h1>
        <p className="lead">
          이 프로젝트는 작은 범위로 실제 출시 경험을 끝까지 가져가는 것이 목표입니다.
          현재는 Next.js + Supabase + Vercel 구조를 기준으로 로그인, 보드, 회고의 3개 흐름을 먼저 여는 단계입니다.
        </p>
      </section>

      <section className="quick-links">
        <Link className="quick-link" href="/login">
          <strong>/login</strong>
          <span className="muted">초대코드 입력 화면 초안</span>
        </Link>
        <Link className="quick-link" href="/board">
          <strong>/board</strong>
          <span className="muted">칸반형 보드 화면 초안</span>
        </Link>
        <Link className="quick-link" href="/retro">
          <strong>/retro</strong>
          <span className="muted">주간 회고 화면 초안</span>
        </Link>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>이번 단계에서 한 것</h2>
          <ul>
            <li>Next.js App Router 프로젝트 scaffold 생성</li>
            <li>핵심 라우트 3개(`/login`, `/board`, `/retro`) 준비</li>
            <li>샘플 데이터 기반 보드/회고 UI 초안 구성</li>
          </ul>
        </article>
        <article className="info-card">
          <h2>바로 다음 단계</h2>
          <ul>
            <li>초대코드 세션 구현</li>
            <li>Supabase schema 적용</li>
            <li>tasks / retros API 연결</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
