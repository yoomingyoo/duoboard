import { PageHeader } from "@/components/common/PageHeader";
import { RetroForm } from "@/components/retro/RetroForm";
import { requireInviteSession } from "@/lib/auth/guard";
import { getRetros } from "@/lib/data";

export default async function RetroPage() {
  await requireInviteSession();
  const { retros, source } = await getRetros();

  return (
    <main className="page-shell">
      <PageHeader pathLabel="/retro" title="주간 회고" />

      <p className="lead">
        이번 주 Good / Bad / Next Action을 남기고, 다음 액션을 다시 보드 작업으로 연결하는 흐름을 목표로 합니다.
      </p>

      <div className="page-toolbar">
        <span className="source-badge">data source: {source}</span>
      </div>

      <div style={{ height: 20 }} />
      <RetroForm retros={retros} />
    </main>
  );
}
