import { NextResponse } from "next/server";
import { sampleTasks } from "@/lib/sample-data";

export async function GET() {
  return NextResponse.json({ tasks: sampleTasks, source: "sample" });
}
