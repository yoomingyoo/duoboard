export function isProjectScopeUnavailable(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error && typeof error.message === "string" ? error.message : "";

  return (
    message.includes("Could not find the table 'public.projects'") ||
    message.includes("column tasks.project_id does not exist") ||
    message.includes("column retros.project_id does not exist") ||
    message.includes("column project_id does not exist")
  );
}
