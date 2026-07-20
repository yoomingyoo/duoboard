import { NextResponse } from "next/server";
import { hasValidApiInviteSession } from "@/lib/auth/api-guard";
import { getRetros } from "@/lib/data";
import { resolveProjectId } from "@/lib/projects";

export async function GET(request: Request) {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = await resolveProjectId(searchParams.get("projectId"), searchParams.get("project"));
  const result = await getRetros(projectId);
  return NextResponse.json(result);
}
