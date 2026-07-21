"use server";

import { revalidatePath } from "next/cache";
import { createProjectRecord } from "@/lib/projects";

export type ProjectCreateState = {
  error?: string;
  createdProjectName?: string;
  createdProjectSlug?: string;
};

export async function createProjectAction(
  _prevState: ProjectCreateState,
  formData: FormData,
): Promise<ProjectCreateState> {
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
