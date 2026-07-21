import { AddTaskForm } from "@/components/board/AddTaskForm";
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

      <div className="page-toolbar">
        <span className="source-badge">data source: {source}</span>
        <span className="source-badge">project source: {projectSource}</span>
        <span className="source-badge">project: {currentProject.name}</span>
      </div>

      <div style={{ height: 20 }} />
      <div className="board-layout board-layout--with-projects">
        <div className="board-sidebar">
          <ProjectSwitcher
            currentPath="/board"
            currentProjectSlug={currentProject.slug}
            projects={projects}
            source={projectSource}
          />
          <AddTaskForm projectId={currentProject.id} />
        </div>
        <KanbanBoard projectId={currentProject.id} tasks={tasks} />
      </div>
    </main>
  );
}
