import { isProjectScopeUnavailable } from "./project-scope";
import type { Retro } from "./sample-data";
import { createSupabaseServerClient } from "./supabase/server";

type RetroAuthor = Retro["author"];

const VALID_AUTHORS: RetroAuthor[] = ["hyejin", "mingyoo"];

function mapRetro(row: {
  id: string;
  author: RetroAuthor;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClientOrThrow(): any {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase server environment is not configured.");
  }

  return supabase;
}

function parseProjectId(value: FormDataEntryValue | string | null | undefined) {
  const projectId = typeof value === "string" ? value.trim() : "";

  if (!projectId) {
    throw new Error("프로젝트 ID가 없어.");
  }

  return projectId;
}

function parseAuthor(value: FormDataEntryValue | string | null | undefined): RetroAuthor {
  if (typeof value === "string" && VALID_AUTHORS.includes(value as RetroAuthor)) {
    return value as RetroAuthor;
  }

  throw new Error("작성자 값이 올바르지 않아.");
}

function parseWeekOf(value: FormDataEntryValue | string | null | undefined) {
  const weekOf = typeof value === "string" ? value.trim() : "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekOf)) {
    throw new Error("주차(월요일 날짜)를 올바르게 입력해줘.");
  }

  return weekOf;
}

function parseRequiredText(value: FormDataEntryValue | string | null | undefined, label: string) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${label}을(를) 입력해줘.`);
  }

  return text;
}

export async function createRetroRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  author: FormDataEntryValue | string | null | undefined;
  weekOf: FormDataEntryValue | string | null | undefined;
  good: FormDataEntryValue | string | null | undefined;
  bad: FormDataEntryValue | string | null | undefined;
  nextAction: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const author = parseAuthor(input.author);
  const weekOf = parseWeekOf(input.weekOf);
  const good = parseRequiredText(input.good, "잘한 점");
  const bad = parseRequiredText(input.bad, "아쉬운 점");
  const nextAction = parseRequiredText(input.nextAction, "다음 액션");

  const supabase = getSupabaseClientOrThrow();

  const scoped = await supabase
    .from("retros")
    .insert({
      project_id: projectId,
      author,
      week_of: weekOf,
      good,
      bad,
      next_action: nextAction,
    })
    .select("id,author,week_of,good,bad,next_action")
    .single();

  if (!scoped.error) {
    return mapRetro(scoped.data);
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    if (scoped.error.code === "23505") {
      throw new Error("이미 이 주차에 작성한 회고가 있어.");
    }

    throw new Error(`회고를 저장하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase
    .from("retros")
    .insert({
      author,
      week_of: weekOf,
      good,
      bad,
      next_action: nextAction,
    })
    .select("id,author,week_of,good,bad,next_action")
    .single();

  if (legacy.error) {
    if (legacy.error.code === "23505") {
      throw new Error("이미 이 주차에 작성한 회고가 있어.");
    }

    throw new Error(`회고를 저장하지 못했어: ${legacy.error.message}`);
  }

  return mapRetro(legacy.data);
}

function parseRetroId(value: FormDataEntryValue | string | null | undefined) {
  const retroId = typeof value === "string" ? value : "";

  if (!retroId) {
    throw new Error("회고 ID가 없어.");
  }

  return retroId;
}

export async function updateRetroRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  retroId: FormDataEntryValue | string | null | undefined;
  author: FormDataEntryValue | string | null | undefined;
  weekOf: FormDataEntryValue | string | null | undefined;
  good: FormDataEntryValue | string | null | undefined;
  bad: FormDataEntryValue | string | null | undefined;
  nextAction: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const retroId = parseRetroId(input.retroId);
  const author = parseAuthor(input.author);
  const weekOf = parseWeekOf(input.weekOf);
  const good = parseRequiredText(input.good, "잘한 점");
  const bad = parseRequiredText(input.bad, "아쉬운 점");
  const nextAction = parseRequiredText(input.nextAction, "다음 액션");

  const supabase = getSupabaseClientOrThrow();

  const scoped = await supabase
    .from("retros")
    .update({
      author,
      week_of: weekOf,
      good,
      bad,
      next_action: nextAction,
    })
    .eq("project_id", projectId)
    .eq("id", retroId)
    .select("id,author,week_of,good,bad,next_action")
    .single();

  if (!scoped.error) {
    return mapRetro(scoped.data);
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    if (scoped.error.code === "23505") {
      throw new Error("이미 이 주차에 작성한 회고가 있어.");
    }

    throw new Error(`회고를 수정하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase
    .from("retros")
    .update({
      author,
      week_of: weekOf,
      good,
      bad,
      next_action: nextAction,
    })
    .eq("id", retroId)
    .select("id,author,week_of,good,bad,next_action")
    .single();

  if (legacy.error) {
    if (legacy.error.code === "23505") {
      throw new Error("이미 이 주차에 작성한 회고가 있어.");
    }

    throw new Error(`회고를 수정하지 못했어: ${legacy.error.message}`);
  }

  return mapRetro(legacy.data);
}

export async function deleteRetroRecord(input: {
  projectId: FormDataEntryValue | string | null | undefined;
  retroId: FormDataEntryValue | string | null | undefined;
}) {
  const projectId = parseProjectId(input.projectId);
  const retroId = parseRetroId(input.retroId);
  const supabase = getSupabaseClientOrThrow();

  const scoped = await supabase.from("retros").delete().eq("project_id", projectId).eq("id", retroId);

  if (!scoped.error) {
    return;
  }

  if (!isProjectScopeUnavailable(scoped.error)) {
    throw new Error(`회고를 삭제하지 못했어: ${scoped.error.message}`);
  }

  const legacy = await supabase.from("retros").delete().eq("id", retroId);

  if (legacy.error) {
    throw new Error(`회고를 삭제하지 못했어: ${legacy.error.message}`);
  }
}
