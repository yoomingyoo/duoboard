import { NextResponse } from "next/server";
import { hasValidApiInviteSession } from "@/lib/auth/api-guard";
import { getTasks } from "@/lib/data";
import { createTaskRecord, updateTaskStatusRecord } from "@/lib/tasks";

export async function GET() {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getTasks();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { assignee?: string; title?: string };
    const task = await createTaskRecord({
      title: body.title,
      assignee: body.assignee,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to create task" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { status?: string; taskId?: string };
    const task = await updateTaskStatusRecord({
      taskId: body.taskId,
      status: body.status,
    });

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to update task" },
      { status: 400 }
    );
  }
}
