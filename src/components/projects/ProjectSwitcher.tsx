"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProjectAction, renameProjectAction, type ProjectState } from "@/actions/projects";
import type { Project, ProjectSource } from "@/lib/projects";

const initialState: ProjectState = {};

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
  const [createState, createAction, createPending] = useActionState(createProjectAction, initialState);
  const [renameState, renameAction, renamePending] = useActionState(renameProjectAction, initialState);
  const canManageProjects = source === "supabase";
  const currentProject = projects.find((project) => project.slug === currentProjectSlug) ?? projects[0];

  return (
    <section className="project-switcher">
      <div className="project-switcher__header">
        <div>
          <p className="eyebrow">projects</p>
          <h2>프로젝트 전환</h2>
        </div>
        <span className="source-badge">mode: {source}</span>
      </div>

      <div className="project-switcher__list-wrap">
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
      </div>

      <form action={renameAction} className="project-rename-form">
        <input name="projectId" type="hidden" value={currentProject?.id ?? ""} />
        <label>
          <span>현재 프로젝트 이름 수정</span>
          <input
            className="input"
            defaultValue={currentProject?.name ?? ""}
            disabled={!canManageProjects || renamePending}
            maxLength={50}
            name="name"
            placeholder="예: 가족 일정 정리"
          />
        </label>
        <p className="help-text">이름만 바꾸고 slug는 유지해서 기존 링크는 그대로 쓸 수 있어.</p>
        {renameState.error ? <p className="error-text">{renameState.error}</p> : null}
        {renameState.renamedProjectName ? (
          <p className="help-text">
            현재 프로젝트 이름을 <b>{renameState.renamedProjectName}</b> 으로 바꿨어.
          </p>
        ) : null}
        <button className="primary-button" disabled={!canManageProjects || renamePending} type="submit">
          {renamePending ? "이름 변경 중..." : "현재 프로젝트 이름 변경"}
        </button>
      </form>

      <form action={createAction} className="project-create-form">
        <label>
          <span>새 프로젝트 이름</span>
          <input
            className="input"
            disabled={!canManageProjects || createPending}
            maxLength={50}
            name="name"
            placeholder={canManageProjects ? "예: 가족 일정 정리" : "migration 적용 후 생성 가능"}
          />
        </label>
        {createState.error ? <p className="error-text">{createState.error}</p> : null}
        {createState.createdProjectSlug ? (
          <p className="help-text">
            <b>{createState.createdProjectName}</b> 프로젝트를 만들었어. {" "}
            <Link href={`${currentPath}?project=${encodeURIComponent(createState.createdProjectSlug)}`}>바로 이동</Link>
          </p>
        ) : null}
        {!canManageProjects ? (
          <p className="help-text">
            현재 live DB migration 전이라 프로젝트 생성/수정은 잠시 비활성화되어 있어.
          </p>
        ) : null}
        <button className="primary-button" disabled={!canManageProjects || createPending} type="submit">
          {createPending ? "생성 중..." : "프로젝트 만들기"}
        </button>
      </form>
    </section>
  );
}
