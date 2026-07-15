import Link from "next/link";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { sampleTasks } from "@/lib/sample-data";

export default function BoardPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">/board</p>
          <h1 className="section-title">duoboard 작업 보드</h1>
        </div>
        <nav>
          <Link className="nav-pill" href="/">홈</Link>
          <Link className="nav-pill" href="/login">로그인</Link>
          <Link className="nav-pill" href="/retro">회고</Link>
        </nav>
      </header>

      <p className="lead">
        첫 MVP에서는 카드 생성, 상태 변경, 담당자 구분까지를 우선 목표로 잡습니다.
        정교한 정렬/드래그앤드롭은 다음 단계로 미룹니다.
      </p>

      <div style={{ height: 20 }} />
      <KanbanBoard tasks={sampleTasks} />

      <div className="status-note">
        현재 화면은 정적 scaffold입니다. 다음 단계에서 Supabase 연동과 서버 경유 API를 붙입니다.
      </div>
    </main>
  );
}
