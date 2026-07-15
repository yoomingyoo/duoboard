import { NextResponse } from "next/server";
import { sampleRetros } from "@/lib/sample-data";

export async function GET() {
  return NextResponse.json({ retros: sampleRetros, source: "sample" });
}
