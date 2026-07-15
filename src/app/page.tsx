import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySignedSessionValue } from "@/lib/auth/session";

export default async function Home() {
  const cookieStore = await cookies();
  const session = await verifySignedSessionValue(cookieStore.get(SESSION_COOKIE)?.value);

  if (session) {
    redirect("/board");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">duoboard MVP scaffold</p>
        <h1>초대코드 세션 + Supabase 연동 준비까지 연결한 첫 구현 단계야.</h1>
        <p className="lead">
          현재는 Next.js + Supabase + Vercel 구조를 기준으로 로그인, 보드, 회고 흐름을 열어두었고,
          Supabase 환경변수가 없으면 샘플 데이터로 fallback 하도록 구성했다.
        </p>
      </section>

      <section className="quick-links">
        <Link className="quick-link" href="/login">
          <strong>/login</strong>
          <span className="muted">초대코드 검증 및 세션 생성</span>
        </Link>
        <Link className="quick-link" href="/board">
          <strong>/board</strong>
          <span className="muted">세션 보호 + 보드 조회</span>
        </Link>
        <Link className="quick-link" href="/retro">
          <strong>/retro</strong>
          <span className="muted">세션 보호 + 회고 조회</span>
        </Link>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>이번 단계에서 한 것</h2>
          <ul>
            <li>초대코드 기반 로그인 서버 액션 추가</li>
            <li>서명된 HttpOnly 세션 쿠키 검증 로직 추가</li>
            <li>Supabase 없을 때 샘플 fallback, 있으면 서버 경유 조회 구조 추가</li>
          </ul>
        </article>
        <article className="info-card">
          <h2>바로 다음 단계</h2>
          <ul>
            <li>.env.local 작성</li>
            <li>schema.sql로 Supabase 테이블 생성</li>
            <li>GET API를 POST/PATCH까지 확장</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
