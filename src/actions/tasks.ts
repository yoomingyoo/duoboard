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
    title: formData.get("title"),
    assignee: formData.get("assignee"),
  });

  revalidatePath("/board");
}

export async function updateTaskStatusAction(formData: FormData) {
  await updateTaskStatusRecord({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  revalidatePath("/board");
}

export async function updateTaskAction(formData: FormData) {
  await updateTaskDetailsRecord({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
    assignee: formData.get("assignee"),
  });

  revalidatePath("/board");
}

export async function deleteTaskAction(formData: FormData) {
  await deleteTaskRecord({
    taskId: formData.get("taskId"),
  });

  revalidatePath("/board");
}
