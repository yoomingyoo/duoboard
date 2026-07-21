import { isProjectPositionUnavailable, isProjectScopeUnavailable } from "@/lib/project-scope";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getNextProjectPosition(supabase: any): Promise<number | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("position")
    .eq("is_default", false)
    .order("position", { ascending: false })
    .limit(1);

  if (error) {
    if (isProjectPositionUnavailable(error)) {
      return null;
    }

    throw new Error(`프로젝트 순서를 확인하지 못했어: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{ position: number | null }>;
  const maxPosition = rows[0]?.position ?? -1;
  return maxPosition + 1;
}

export async function reorderProjectsRecord(orderedIds: string[]) {
  const ids = orderedIds.filter((id) => typeof id === "string" && id.trim().length > 0);
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    throw new Error("Supabase 환경이 없어서 프로젝트 순서를 바꿀 수 없어.");
  }

  if (ids.length === 0) {
    return;
  }

  const results = await Promise.all(
    ids.map((id: string, index: number) =>
      supabase.from("projects").update({ position: index }).eq("id", id).eq("is_default", false),
    ),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const failed = results.find((result: any) => result.error);

  if (failed?.error) {
    if (isProjectPositionUnavailable(failed.error)) {
      throw new Error("프로젝트 순서 변경은 DB migration 적용 후 사용할 수 있어.");
    }

    throw new Error(`프로젝트 순서를 바꾸지 못했어: ${failed.error.message}`);
  }
}

export async function getProjects(): Promise<{ projects: Project[]; source: ProjectSource }> {
  const supabase = getSupabaseClientOrNull();

  if (!supabase) {
    return { projects: [SAMPLE_PROJECT], source: "sample" };
  }

  let { data, error } = await supabase
    .from("projects")
    .select("id,name,slug,is_default")
    .order("is_default", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error && isProjectPositionUnavailable(error)) {
    ({ data, error } = await supabase
      .from("projects")
      .select("id,name,slug,is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }));
  }

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

  const insertPayload: Record<string, unknown> = { name, slug, is_default: false };
  const nextPosition = await getNextProjectPosition(supabase);

  if (nextPosition !== null) {
    insertPayload.position = nextPosition;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(insertPayload)
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

export async function deleteProjectRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = typeof input.projectId === "string" ? input.projectId.trim() : "";
  const supabase = getSupabaseClientOrNull();

  if (!projectId) {
    throw new Error("삭제할 프로젝트 ID가 없어.");
  }

  if (!supabase) {
    throw new Error("Supabase 환경이 없어서 프로젝트를 삭제할 수 없어.");
  }

  const { data: target, error: fetchError } = await supabase
    .from("projects")
    .select("id,is_default")
    .eq("id", projectId)
    .single();

  if (fetchError) {
    if (isProjectScopeUnavailable(fetchError)) {
      throw new Error("프로젝트 삭제는 DB migration 적용 후 사용할 수 있어.");
    }

    throw new Error(`삭제할 프로젝트를 찾지 못했어: ${fetchError.message}`);
  }

  if (target?.is_default) {
    throw new Error("기본 프로젝트는 삭제할 수 없어.");
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(`프로젝트를 삭제하지 못했어: ${error.message}`);
  }
}

export async function updateProjectNameRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  name: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = typeof input.projectId === "string" ? input.projectId.trim() : "";
  const name = normalizeProjectName(input.name);
  const supabase = getSupabaseClientOrNull();

  if (!projectId) {
    throw new Error("이름을 바꿀 프로젝트 ID가 없어.");
  }

  if (!supabase) {
    throw new Error("Supabase 환경이 없어서 프로젝트 이름을 바꿀 수 없어.");
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", projectId)
    .select("id,name,slug,is_default")
    .single();

  if (error) {
    if (isProjectScopeUnavailable(error)) {
      throw new Error("프로젝트 이름 수정은 DB migration 적용 후 사용할 수 있어.");
    }

    throw new Error(`프로젝트 이름을 바꾸지 못했어: ${error.message}`);
  }

  return mapProject(data);
}
