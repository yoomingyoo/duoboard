import { NextResponse } from "next/server";
import { hasValidApiInviteSession } from "@/lib/auth/api-guard";
import { getTasks } from "@/lib/data";
import { resolveProjectId } from "@/lib/projects";
import { createTaskRecord, updateTaskStatusRecord } from "@/lib/tasks";

export async function GET(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = await resolveProjectId(searchParams.get("projectId"), searchParams.get("project"));
  const result = await getTasks(projectId);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { assignee?: string; title?: string; projectId?: string };
    const projectId = await resolveProjectId(body.projectId);
    const task = await createTaskRecord({
      projectId,
      title: body.title,
      assignee: body.assignee,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to create task" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { status?: string; taskId?: string; projectId?: string };
    const projectId = await resolveProjectId(body.projectId);
    const task = await updateTaskStatusRecord({
      projectId,
      taskId: body.taskId,
      status: body.status,
    });

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to update task" },
      { status: 400 },
    );
  }
}
