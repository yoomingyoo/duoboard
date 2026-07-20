import { isProjectScopeUnavailable } from "@/lib/project-scope";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
};

export const SAMPLE_PROJECT: Project = {
  id: "sample-project",
  name: "기본 프로젝트",
  slug: "default",
  isDefault: true,
};

function mapProject(row: {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
}) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isDefault: row.is_default,
  } satisfies Project;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClientOrNull(): any {
  return createSupabaseServerClient();
}

export async function getProjects() {
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    return { projects: [SAMPLE_PROJECT], source: "sample" as const };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,slug,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    if (isProjectScopeUnavailable(error)) {
      return { projects: [SAMPLE_PROJECT], source: "legacy-supabase" as const };
    }

    throw new Error(`프로젝트 목록을 불러오지 못했어: ${error.message}`);
  }

  return {
    projects: (data ?? []).map(mapProject),
    source: "supabase" as const,
  };
}

export async function resolveCurrentProject(projectSlug?: string | null) {
  const { projects, source } = await getProjects();

  if (projects.length === 0) {
    throw new Error("프로젝트가 하나도 없어. 먼저 기본 프로젝트를 만들어야 해.");
  }

  const currentProject =
    (projectSlug ? projects.find((project: Project) => project.slug === projectSlug) : null) ??
    projects.find((project: Project) => project.isDefault) ??
    projects[0];

  return { currentProject, projects, source };
}

export async function resolveProjectId(projectId?: string | null, projectSlug?: string | null) {
  if (projectId) {
    return projectId;
  }

  const { currentProject } = await resolveCurrentProject(projectSlug);
  return currentProject.id;
}
