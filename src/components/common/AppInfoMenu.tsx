"use client";

import { useEffect, useRef } from "react";
import { getBuildInfo } from "@/lib/build-info";
import type { ProjectSource } from "@/lib/projects";

type AppInfoMenuProps = {
  projectName?: string;
  projectSource?: ProjectSource;
};

export function AppInfoMenu({ projectName, projectSource }: AppInfoMenuProps) {
  const build = getBuildInfo();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsidePointerDown(event: PointerEvent) {
      const details = detailsRef.current;
      if (!details?.open) return;
      if (details.contains(event.target as Node)) return;
      details.removeAttribute("open");
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const details = detailsRef.current;
      if (!details?.open) return;
      details.removeAttribute("open");
    }

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details className="info-menu" ref={detailsRef}>
      <summary className="nav-pill info-menu__trigger">정보</summary>
      <div className="info-menu__panel">
        {projectName ? <span className="source-badge">project: {projectName}</span> : null}
        <span className="source-badge" title={build.commitSha ?? "local dev build"}>
          build: {build.shortCommitSha}
        </span>
        <span className="source-badge">environment: {build.environment}</span>
        {projectSource ? <span className="source-badge">mode: {projectSource}</span> : null}
      </div>
    </details>
  );
}
