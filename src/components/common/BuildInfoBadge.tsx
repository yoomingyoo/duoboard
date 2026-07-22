import { getBuildInfo } from "@/lib/build-info";

export function BuildInfoBadge() {
  const build = getBuildInfo();

  return (
    <span className="source-badge" title={build.commitSha ?? "local dev build"}>
      build: {build.shortCommitSha} · {build.environment}
    </span>
  );
}
