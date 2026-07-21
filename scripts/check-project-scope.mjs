#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const [key, ...rest] = rawLine.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").trim();
    }
  }
}

const envPath = path.join(process.cwd(), ".env.local");
loadDotEnv(envPath);

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

async function request(endpoint, init = {}) {
  const response = await fetch(`${supabaseUrl}${endpoint}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function main() {
  const projectList = await request("/rest/v1/projects?select=id,slug,name,is_default&order=is_default.desc,created_at.asc");
  const taskList = await request("/rest/v1/tasks?select=id,project_id,title,status&limit=5");
  const retroList = await request("/rest/v1/retros?select=id,project_id,author,week_of&limit=5");

  const result = {
    migrated: false,
    checks: {
      projects: projectList,
      tasks: taskList,
      retros: retroList,
    },
  };

  const projectsOk = projectList.ok && Array.isArray(projectList.body);
  const tasksOk = taskList.ok && Array.isArray(taskList.body);
  const retrosOk = retroList.ok && Array.isArray(retroList.body);
  const hasDefaultProject =
    projectsOk &&
    projectList.body.some(
      (project) => project?.slug === "default" && project?.is_default === true,
    );
  const tasksHaveProjectId =
    tasksOk && taskList.body.every((task) => typeof task?.project_id === "string" && task.project_id.length > 0);
  const retrosHaveProjectId =
    retrosOk && retroList.body.every((retro) => typeof retro?.project_id === "string" && retro.project_id.length > 0);

  result.migrated = Boolean(projectsOk && tasksOk && retrosOk && hasDefaultProject && tasksHaveProjectId && retrosHaveProjectId);

  console.log(JSON.stringify(result, null, 2));

  if (!result.migrated) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
