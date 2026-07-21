import { KanbanBoard } from "@/components/board/KanbanBoard";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectSwitcher } from "@/components/projects/ProjectSwitcher";
import { requireInviteSession } from "@/lib/auth/guard";
import { getTasks } from "@/lib/data";
import { resolveCurrentProject } from "@/lib/projects";

type BoardPageProps = {
  searchParams?: Promise<{ project?: string }>;
};

export default async function BoardPage({ searchParams }: BoardPageProps) {
  await requireInviteSession();
  const params = searchParams ? await searchParams : undefined;
  const { currentProject, projects, source: projectSource } = await resolveCurrentProject(params?.project);
  const { tasks, source } = await getTasks(currentProject.id);

  return (
    <main className="page-shell">
      <PageHeader
        currentProjectSlug={currentProject.slug}
        pathLabel="/board"
        title="duoboard 작업 보드"
      />

      <p className="lead">
        첫 MVP에서는 카드 생성과 상태 변경이 실제 데이터에 반영되는 흐름을 먼저 완성하고,
        정교한 정렬/드래그앤드롭은 다음 단계로 미룹니다.
      </p>

      <div className="page-toolbar">
        <span className="source-badge">data source: {source}</span>
        <span className="source-badge">project source: {projectSource}</span>
        <span className="source-badge">project: {currentProject.name}</span>
      </div>

      <div style={{ height: 20 }} />
      <div className="board-layout board-layout--with-projects">
        <ProjectSwitcher
          currentPath="/board"
          currentProjectSlug={currentProject.slug}
          projects={projects}
          source={projectSource}
        />
        <KanbanBoard projectId={currentProject.id} tasks={tasks} />
      </div>

      <div className="status-note">
        현재는 {source === "supabase" ? "Supabase에서" : "fallback 포함 경로로"} 보드를 불러오고 있어.
        프로젝트 전환 UI는 먼저 붙였고, live migration이 적용되면 여러 프로젝트가 실제로 분리된다.
      </div>
    </main>
  );
}
