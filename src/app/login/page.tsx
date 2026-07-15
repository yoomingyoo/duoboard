import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">/login</p>
          <h1 className="section-title">초대코드로 입장</h1>
        </div>
        <nav>
          <Link className="nav-pill" href="/">홈</Link>
          <Link className="nav-pill" href="/board">보드</Link>
          <Link className="nav-pill" href="/retro">회고</Link>
        </nav>
      </header>

      <section className="login-card">
        <p className="muted">
          실제 구현 단계에서는 여기서 초대코드를 검증하고 HttpOnly 세션 쿠키를 발급합니다.
        </p>
        <form className="login-form">
          <label>
            <span>초대코드</span>
            <input className="input" placeholder="예: DUOBOARD-2026" />
          </label>
          <button className="primary-button" type="button">
            입장하기 (다음 단계)
          </button>
        </form>
        <p className="help-text">링크에 초대코드가 직접 노출되지 않는 구조를 기준으로 설계합니다.</p>
      </section>
    </main>
  );
}
