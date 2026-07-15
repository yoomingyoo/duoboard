import Link from "next/link";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { PageHeader } from "@/components/common/PageHeader";
import { requireInviteSession } from "@/lib/auth/guard";
import { getTasks } from "@/lib/data";

export default async function BoardPage() {
  await requireInviteSession();
  const { tasks, source } = await getTasks();

  return (
    <main className="page-shell">
      <PageHeader pathLabel="/board" title="duoboard 작업 보드" />

      <p className="lead">
        첫 MVP에서는 카드 생성, 상태 변경, 담당자 구분까지를 우선 목표로 잡습니다.
        정교한 정렬/드래그앤드롭은 다음 단계로 미룹니다.
      </p>

      <div className="page-toolbar">
        <span className="source-badge">data source: {source}</span>
        <Link className="nav-pill" href="/retro">
          회고로 이동
        </Link>
      </div>

      <div style={{ height: 20 }} />
      <KanbanBoard tasks={tasks} />

      <div className="status-note">
        현재는 {source === "supabase" ? "Supabase에서" : "샘플 데이터로"} 보드를 불러오고 있어.
      </div>
    </main>
  );
}
