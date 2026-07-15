import Link from "next/link";
import { RetroForm } from "@/components/retro/RetroForm";
import { sampleRetros } from "@/lib/sample-data";

export default function RetroPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">/retro</p>
          <h1 className="section-title">주간 회고</h1>
        </div>
        <nav>
          <Link className="nav-pill" href="/">홈</Link>
          <Link className="nav-pill" href="/login">로그인</Link>
          <Link className="nav-pill" href="/board">보드</Link>
        </nav>
      </header>

      <p className="lead">
        이번 주 Good / Bad / Next Action을 남기고, 다음 액션을 다시 보드 작업으로 연결하는 흐름을 목표로 합니다.
      </p>

      <div style={{ height: 20 }} />
      <RetroForm retros={sampleRetros} />
    </main>
  );
}
