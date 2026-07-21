"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProjectAction, type ProjectCreateState } from "@/actions/projects";
import type { Project, ProjectSource } from "@/lib/projects";

const initialState: ProjectCreateState = {};

type ProjectSwitcherProps = {
  currentPath: "/board" | "/retro";
  currentProjectSlug: string;
  projects: Project[];
  source: ProjectSource;
};

export function ProjectSwitcher({
  currentPath,
  currentProjectSlug,
  projects,
  source,
}: ProjectSwitcherProps) {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);
  const canCreate = source === "supabase";

  return (
    <section className="project-switcher">
      <div className="project-switcher__header">
        <div>
          <p className="eyebrow">projects</p>
          <h2>프로젝트 전환</h2>
        </div>
        <span className="source-badge">mode: {source}</span>
      </div>

      <div className="project-switcher__list">
        {projects.map((project) => {
          const isCurrent = project.slug === currentProjectSlug;

          return (
            <Link
              className={`project-pill${isCurrent ? " project-pill--active" : ""}`}
              href={`${currentPath}?project=${encodeURIComponent(project.slug)}`}
              key={project.id}
            >
              <span>{project.name}</span>
              {project.isDefault ? <small>default</small> : null}
            </Link>
          );
        })}
      </div>

      <form action={formAction} className="project-create-form">
        <label>
          <span>새 프로젝트 이름</span>
          <input
            className="input"
            disabled={!canCreate || pending}
            maxLength={50}
            name="name"
            placeholder={canCreate ? "예: 가족 일정 정리" : "migration 적용 후 생성 가능"}
          />
        </label>
        {state.error ? <p className="error-text">{state.error}</p> : null}
        {state.createdProjectSlug ? (
          <p className="help-text">
            <b>{state.createdProjectName}</b> 프로젝트를 만들었어. {" "}
            <Link href={`${currentPath}?project=${encodeURIComponent(state.createdProjectSlug)}`}>바로 이동</Link>
          </p>
        ) : null}
        {!canCreate ? (
          <p className="help-text">
            현재 live DB migration 전이라 새 프로젝트 생성은 잠시 비활성화되어 있어.
          </p>
        ) : null}
        <button className="primary-button" disabled={!canCreate || pending} type="submit">
          {pending ? "생성 중..." : "프로젝트 만들기"}
        </button>
      </form>
    </section>
  );
}
