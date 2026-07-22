export type BuildInfo = {
  commitSha: string | null;
  shortCommitSha: string;
  environment: string;
  isVercel: boolean;
};

function normalizeCommitSha(value?: string) {
  const sha = value?.trim();
  if (!sha) {
    return null;
  }
  return sha;
}

export function getBuildInfo(): BuildInfo {
  const commitSha = normalizeCommitSha(process.env.VERCEL_GIT_COMMIT_SHA) ?? normalizeCommitSha(process.env.GIT_COMMIT_SHA);
  const environment = process.env.VERCEL_ENV?.trim() || process.env.NODE_ENV || "unknown";

  return {
    commitSha,
    shortCommitSha: commitSha ? commitSha.slice(0, 7) : "local",
    environment,
    isVercel: Boolean(process.env.VERCEL),
  };
}
