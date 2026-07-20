import { isProjectScopeUnavailable } from "./project-scope";
import type { Task, TaskStatus } from "./sample-data";
import { createSupabaseServerClient } from "./supabase/server";

type TaskAssignee = Task["assignee"];

const VALID_STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const VALID_ASSIGNEES: TaskAssignee[] = ["hyejin", "mingyoo"];

function mapTask(row: {
  id: string;
  title: string;
  assignee: TaskAssignee;
  status: TaskStatus;
}) {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    status: row.status,
  } satisfies Task;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClientOrThrow(): any {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  return supabase;
}

function parseTaskTitle(value: FormDataEntryValue | string | null | undefined) {
  const title = typeof value === "string" ? value.trim() : "";

  if (!title) {
    throw new Error("할 일 제목을 입력해줘.");
  }

  if (title.length > 120) {
    throw new Error("할 일 제목은 120자 이하로 입력해줘.");
  }

  return title;
}

function parseTaskAssignee(value: FormDataEntryValue | string | null | undefined): TaskAssignee {
  if (typeof value === "string" && VALID_ASSIGNEES.includes(value as TaskAssignee)) {
    return value as TaskAssignee;
  }

  throw new Error("담당자 값이 올바르지 않아.");
}

function parseTaskStatus(value: FormDataEntryValue | string | null | undefined): TaskStatus {
  if (typeof value === "string" && VALID_STATUSES.includes(value as TaskStatus)) {
    return value as TaskStatus;
  }

  throw new Error("상태 값이 올바르지 않아.");
}

function parseProjectId(value: FormDataEntryValue | string | null | undefined) {
  const projectId = typeof value === "string" ? value.trim() : "";

  if (!projectId) {
    throw new Error("프로젝트 ID가 없어.");
  }

  return projectId;
}

async function getNextPosition(projectId: string, status: TaskStatus) {
  const supabase = getSupabaseClientOrThrow();
  const scoped = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", projectId)
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1);

  if (!scoped.error) {
    const rows = (scoped.data ?? []) as Array<{ position: number }>;
    return rows.length > 0 ? rows[0].position + 1 : 0;
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    throw new Error(`다음 위치를 계산하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase
    .from("tasks")
    .select("position")
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1);

  if (legacy.error) {
    throw new Error(`다음 위치를 계산하지 못했어: ${legacy.error.message}`);
  }

  const rows = (legacy.data ?? []) as Array<{ position: number }>;
  return rows.length > 0 ? rows[0].position + 1 : 0;
}

export async function createTaskRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  title: FormDataEntryValue | string | null | undefined;
  assignee: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const title = parseTaskTitle(input.title);
  const assignee = parseTaskAssignee(input.assignee);
  const position = await getNextPosition(projectId, "todo");
  const supabase = getSupabaseClientOrThrow();

  const scoped = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      assignee,
      status: "todo",
      position,
    })
    .select("id,title,assignee,status")
    .single();

  if (!scoped.error) {
    return mapTask(scoped.data);
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    throw new Error(`할 일을 저장하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase
    .from("tasks")
    .insert({
      title,
      assignee,
      status: "todo",
      position,
    })
    .select("id,title,assignee,status")
    .single();

  if (legacy.error) {
    throw new Error(`할 일을 저장하지 못했어: ${legacy.error.message}`);
  }

  return mapTask(legacy.data);
}

export async function updateTaskDetailsRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  taskId: FormDataEntryValue | string | null | undefined;
  title: FormDataEntryValue | string | null | undefined;
  assignee: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const taskId = typeof input.taskId === "string" ? input.taskId : "";

  if (!taskId) {
    throw new Error("수정할 작업 ID가 없어.");
  }

  const title = parseTaskTitle(input.title);
  const assignee = parseTaskAssignee(input.assignee);
  const supabase = getSupabaseClientOrThrow();

  const scoped = await supabase
    .from("tasks")
    .update({ title, assignee })
    .eq("project_id", projectId)
    .eq("id", taskId)
    .select("id,title,assignee,status")
    .single();

  if (!scoped.error) {
    return mapTask(scoped.data);
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    throw new Error(`작업을 수정하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase
    .from("tasks")
    .update({ title, assignee })
    .eq("id", taskId)
    .select("id,title,assignee,status")
    .single();

  if (legacy.error) {
    throw new Error(`작업을 수정하지 못했어: ${legacy.error.message}`);
  }

  return mapTask(legacy.data);
}

export async function deleteTaskRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  taskId: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const taskId = typeof input.taskId === "string" ? input.taskId : "";

  if (!taskId) {
    throw new Error("삭제할 작업 ID가 없어.");
  }

  const supabase = getSupabaseClientOrThrow();
  const scoped = await supabase.from("tasks").delete().eq("project_id", projectId).eq("id", taskId);

  if (!scoped.error) {
    return;
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    throw new Error(`작업을 삭제하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase.from("tasks").delete().eq("id", taskId);

  if (legacy.error) {
    throw new Error(`작업을 삭제하지 못했어: ${legacy.error.message}`);
  }
}

export async function updateTaskStatusRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  taskId: FormDataEntryValue | string | null | undefined;
  status: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const taskId = typeof input.taskId === "string" ? input.taskId : "";
  const status = parseTaskStatus(input.status);

  if (!taskId) {
    throw new Error("변경할 작업 ID가 없어.");
  }

  const supabase = getSupabaseClientOrThrow();
  const scopedCurrent = await supabase
    .from("tasks")
    .select("id,title,assignee,status")
    .eq("project_id", projectId)
    .eq("id", taskId)
    .single();

  let currentTask = scopedCurrent.data;
  let legacyMode = false;

  if (scopedCurrent.error || !currentTask) {
    if (!isProjectScopeUnavailable(scopedCurrent.error)) {
      throw new Error(`작업을 찾지 못했어: ${scopedCurrent.error?.message ?? taskId}`);
    }

    legacyMode = true;
    const legacyCurrent = await supabase.from("tasks").select("id,title,assignee,status").eq("id", taskId).single();

    if (legacyCurrent.error || !legacyCurrent.data) {
      throw new Error(`작업을 찾지 못했어: ${legacyCurrent.error?.message ?? taskId}`);
    }

    currentTask = legacyCurrent.data;
  }

  if (currentTask.status === status) {
    return mapTask(currentTask);
  }

  const position = await getNextPosition(projectId, status);
  const scopedUpdate = await supabase
    .from("tasks")
    .update({ status, position })
    .eq("project_id", projectId)
    .eq("id", taskId)
    .select("id,title,assignee,status")
    .single();

  if (!legacyMode && !scopedUpdate.error) {
    return mapTask(scopedUpdate.data);
  }

  if (!legacyMode && !isProjectScopeUnavailable(scopedUpdate.error)) {
    throw new Error(`상태를 바꾸지 못했어: ${scopedUpdate.error.message}`);
  }

  const legacyUpdate = await supabase
    .from("tasks")
    .update({ status, position })
    .eq("id", taskId)
    .select("id,title,assignee,status")
    .single();

  if (legacyUpdate.error) {
    throw new Error(`상태를 바꾸지 못했어: ${legacyUpdate.error.message}`);
  }

  return mapTask(legacyUpdate.data);
}
