"use server";

import { revalidatePath } from "next/cache";
import {
  createTaskRecord,
  deleteTaskRecord,
  updateTaskDetailsRecord,
  updateTaskStatusRecord,
} from "../lib/tasks";

export async function createTaskAction(formData: FormData) {
  await createTaskRecord({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    assignee: formData.get("assignee"),
  });

  revalidatePath("/board");
}

export async function updateTaskStatusAction(formData: FormData) {
  await updateTaskStatusRecord({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  revalidatePath("/board");
}

export async function updateTaskAction(formData: FormData) {
  await updateTaskDetailsRecord({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    title: formData.get("title"),
    assignee: formData.get("assignee"),
  });

  revalidatePath("/board");
}

export async function deleteTaskAction(formData: FormData) {
  await deleteTaskRecord({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
  });

  revalidatePath("/board");
}
