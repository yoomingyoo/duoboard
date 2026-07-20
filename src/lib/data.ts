import { isProjectScopeUnavailable } from "@/lib/project-scope";
import type { Retro, Task } from "@/lib/sample-data";
import { sampleRetros, sampleTasks } from "@/lib/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mapTask(row: {
  id: string;
  title: string;
  assignee: "hyejin" | "mingyoo";
  status: "todo" | "doing" | "done";
}) {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    status: row.status,
  } satisfies Task;
}

function mapRetro(row: {
  id: string;
  author: "hyejin" | "mingyoo";
  week_of: string;
  good: string;
  bad: string;
  next_action: string;
}) {
  return {
    id: row.id,
    author: row.author,
    weekOf: row.week_of,
    good: row.good,
    bad: row.bad,
    nextAction: row.next_action,
  } satisfies Retro;
}

export async function getTasks(projectId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { tasks: sampleTasks, source: "sample" as const };
  }

  const scopedQuery = await supabase
    .from("tasks")
    .select("id,title,assignee,status,position")
    .eq("project_id", projectId)
    .order("status")
    .order("position");

  if (!scopedQuery.error) {
    return { tasks: scopedQuery.data.map(mapTask), source: "supabase" as const };
  }

  if (!isProjectScopeUnavailable(scopedQuery.error)) {
    console.error("Failed to load tasks from Supabase", scopedQuery.error);
    return { tasks: sampleTasks, source: "sample-fallback" as const };
  }

  const legacyQuery = await supabase
    .from("tasks")
    .select("id,title,assignee,status,position")
    .order("status")
    .order("position");

  if (legacyQuery.error) {
    console.error("Failed to load legacy tasks from Supabase", legacyQuery.error);
    return { tasks: sampleTasks, source: "sample-fallback" as const };
  }

  return { tasks: legacyQuery.data.map(mapTask), source: "legacy-supabase" as const };
}

export async function getRetros(projectId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { retros: sampleRetros, source: "sample" as const };
  }

  const scopedQuery = await supabase
    .from("retros")
    .select("id,author,week_of,good,bad,next_action")
    .eq("project_id", projectId)
    .order("week_of", { ascending: false })
    .order("created_at", { ascending: false });

  if (!scopedQuery.error) {
    return { retros: scopedQuery.data.map(mapRetro), source: "supabase" as const };
  }

  if (!isProjectScopeUnavailable(scopedQuery.error)) {
    console.error("Failed to load retros from Supabase", scopedQuery.error);
    return { retros: sampleRetros, source: "sample-fallback" as const };
  }

  const legacyQuery = await supabase
    .from("retros")
    .select("id,author,week_of,good,bad,next_action")
    .order("week_of", { ascending: false })
    .order("created_at", { ascending: false });

  if (legacyQuery.error) {
    console.error("Failed to load legacy retros from Supabase", legacyQuery.error);
    return { retros: sampleRetros, source: "sample-fallback" as const };
  }

  return { retros: legacyQuery.data.map(mapRetro), source: "legacy-supabase" as const };
}
