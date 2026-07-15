import Link from "next/link";
import { InviteCodeForm } from "@/components/auth/InviteCodeForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySignedSessionValue } from "@/lib/auth/session";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await verifySignedSessionValue(cookieStore.get(SESSION_COOKIE)?.value);

  if (session) {
    redirect("/board");
  }

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
          초대코드를 확인하면 HttpOnly 세션 쿠키를 발급하고, 이후 보드와 회고 화면은 해당 세션이 있어야 접근할 수 있게 구성합니다.
        </p>
        <InviteCodeForm />
        <p className="help-text">링크에 초대코드가 직접 노출되지 않는 구조를 기준으로 설계했습니다.</p>
      </section>
    </main>
  );
}
