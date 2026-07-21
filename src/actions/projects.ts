"use server";

import { revalidatePath } from "next/cache";
import { createProjectRecord, deleteProjectRecord, reorderProjectsRecord, updateProjectNameRecord } from "@/lib/projects";

export type ProjectState = {
  error?: string;
  createdProjectName?: string;
  createdProjectSlug?: string;
  renamedProjectName?: string;
  deletedProjectId?: string;
};

export async function createProjectAction(_prevState: ProjectState, formData: FormData): Promise<ProjectState> {
  try {
    const project = await createProjectRecord({
      name: formData.get("name"),
    });

    revalidatePath("/board");
    revalidatePath("/retro");

    return {
      createdProjectName: project.name,
      createdProjectSlug: project.slug,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "프로젝트를 만들지 못했어.",
    };
  }
}

export async function deleteProjectAction(_prevState: ProjectState, formData: FormData): Promise<ProjectState> {
  try {
    const projectId = formData.get("projectId");
    await deleteProjectRecord({ projectId });

    revalidatePath("/board");
    revalidatePath("/retro");

    return {
      deletedProjectId: typeof projectId === "string" ? projectId : undefined,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "프로젝트를 삭제하지 못했어.",
    };
  }
}

export async function reorderProjectsAction(orderedIds: string[]): Promise<{ error?: string }> {
  try {
    await reorderProjectsRecord(orderedIds);

    revalidatePath("/board");
    revalidatePath("/retro");

    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "프로젝트 순서를 바꾸지 못했어.",
    };
  }
}

export async function renameProjectAction(_prevState: ProjectState, formData: FormData): Promise<ProjectState> {
  try {
    const project = await updateProjectNameRecord({
      projectId: formData.get("projectId"),
      name: formData.get("name"),
    });

    revalidatePath("/board");
    revalidatePath("/retro");

    return {
      renamedProjectName: project.name,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "프로젝트 이름을 바꾸지 못했어.",
    };
  }
}
