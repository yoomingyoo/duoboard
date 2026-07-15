import { NextResponse } from "next/server";
import { hasValidApiInviteSession } from "@/lib/auth/api-guard";
import { getTasks } from "@/lib/data";

export async function GET() {
  if (!(await hasValidApiInviteSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getTasks();
  return NextResponse.json(result);
}
