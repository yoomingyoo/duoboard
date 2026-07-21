import { isProjectScopeUnavailable } from "@/lib/project-scope";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
};

export type ProjectSource = "sample" | "legacy-supabase" | "supabase";

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

function normalizeProjectName(value: FormDataEntryValue | string | null | undefined) {
  const name = typeof value === "string" ? value.trim() : "";

  if (!name) {
    throw new Error("프로젝트 이름을 입력해줘.");
  }

  if (name.length > 50) {
    throw new Error("프로젝트 이름은 50자 이하로 입력해줘.");
  }

  return name;
}

function makeBaseSlug(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `project-${Date.now().toString(36)}`;
}

async function createUniqueSlug(name: string) {
  const baseSlug = makeBaseSlug(name);
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    return baseSlug;
  }

  const { data, error } = await supabase.from("projects").select("slug");

  if (error) {
    if (isProjectScopeUnavailable(error)) {
      throw new Error("프로젝트 생성은 DB migration 적용 후 사용할 수 있어.");
    }

    throw new Error(`기존 프로젝트를 확인하지 못했어: ${error.message}`);
  }

  const used = new Set((data ?? []).map((project: { slug: string }) => project.slug));
  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (used.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function getProjects(): Promise<{ projects: Project[]; source: ProjectSource }> {
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    return { projects: [SAMPLE_PROJECT], source: "sample" };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,slug,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    if (isProjectScopeUnavailable(error)) {
      return { projects: [SAMPLE_PROJECT], source: "legacy-supabase" };
    }

    throw new Error(`프로젝트 목록을 불러오지 못했어: ${error.message}`);
  }

  return {
    projects: (data ?? []).map(mapProject),
    source: "supabase",
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

export async function createProjectRecord(input: {
  name: FormDataEntryValue | string | null | undefined;
}) {
  const name = normalizeProjectName(input.name);
  const slug = await createUniqueSlug(name);
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    throw new Error("Supabase 환경이 없어서 프로젝트를 만들 수 없어.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      slug,
      is_default: false,
    })
    .select("id,name,slug,is_default")
    .single();

  if (error) {
    if (isProjectScopeUnavailable(error)) {
      throw new Error("프로젝트 생성은 DB migration 적용 후 사용할 수 있어.");
    }

    throw new Error(`프로젝트를 만들지 못했어: ${error.message}`);
  }

  return mapProject(data);
}
