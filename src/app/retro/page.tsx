import { PageHeader } from "@/components/common/PageHeader";
import { ProjectSwitcher } from "@/components/projects/ProjectSwitcher";
import { RetroForm } from "@/components/retro/RetroForm";
import { requireInviteSession } from "@/lib/auth/guard";
import { getRetros } from "@/lib/data";
import { resolveCurrentProject } from "@/lib/projects";

type RetroPageProps = {
  searchParams?: Promise<{ project?: string }>;
};

export default async function RetroPage({ searchParams }: RetroPageProps) {
  await requireInviteSession();
  const params = searchParams ? await searchParams : undefined;
  const { currentProject, projects, source: projectSource } = await resolveCurrentProject(params?.project);
  const { retros, source } = await getRetros(currentProject.id);

  return (
    <main className="page-shell">
      <PageHeader currentProjectSlug={currentProject.slug} pathLabel="/retro" title="주간 회고" />

      <p className="lead">
        이번 주 Good / Bad / Next Action을 남기고, 다음 액션을 다시 보드 작업으로 연결하는 흐름을 목표로 합니다.
      </p>

      <div className="page-toolbar">
        <span className="source-badge">data source: {source}</span>
        <span className="source-badge">project source: {projectSource}</span>
        <span className="source-badge">project: {currentProject.name}</span>
      </div>

      <div style={{ height: 20 }} />
      <div className="retro-page-layout">
        <ProjectSwitcher
          currentPath="/retro"
          currentProjectSlug={currentProject.slug}
          projects={projects}
          source={projectSource}
        />
        <RetroForm projectId={currentProject.id} retros={retros} />
      </div>
    </main>
  );
}
