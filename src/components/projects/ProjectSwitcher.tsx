"use client";

import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
  createProjectAction,
  deleteProjectAction,
  renameProjectAction,
  reorderProjectsAction,
  type ProjectState,
} from "@/actions/projects";
import { GripIcon } from "@/components/common/GripIcon";
import type { Project, ProjectSource } from "@/lib/projects";

const initialState: ProjectState = {};

const PROJECT_COLORS = ["#9d8cd9", "#7fa8c2", "#7fc2a0", "#b3915f", "#8a96a3"];

function pickProjectColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PROJECT_COLORS[hash % PROJECT_COLORS.length];
}

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
  const [deleteState, deleteAction, deletePending] = useActionState(deleteProjectAction, initialState);
  const [isReorderPending, startReorderTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const canManageProjects = source === "supabase";

  const defaultProject = projects.find((project) => project.isDefault) ?? null;
  const sortableProjects = projects.filter((project) => !project.isDefault);
  const projectsById = new Map(projects.map((project) => [project.id, project]));

  const sortableProjectIds = sortableProjects.map((project) => project.id);
  const [orderedIds, setOptimisticOrderedIds] = useOptimistic(
    sortableProjectIds,
    (_current, nextOrder: string[]) => nextOrder,
  );

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const dragStartOrderRef = useRef<string[]>([]);
  const currentOrderRef = useRef<string[]>(sortableProjectIds);

  if (renameState.renamedProjectName && editingId !== null) {
    setEditingId(null);
  }

  useEffect(() => {
    currentOrderRef.current = orderedIds;
  }, [orderedIds]);

  useEffect(() => {
    function closeMenusOnOutsideClick(event: MouseEvent) {
      document.querySelectorAll("details.pill-menu[open]").forEach((menu) => {
        if (!menu.contains(event.target as Node)) {
          menu.removeAttribute("open");
        }
      });
    }

    document.addEventListener("click", closeMenusOnOutsideClick);
    return () => document.removeEventListener("click", closeMenusOnOutsideClick);
  }, []);

  function reorderAroundPointer(pointerY: number, draggedId: string) {
    const current = currentOrderRef.current;
    const others = current.filter((id) => id !== draggedId);
    let insertIndex = others.length;

    for (let i = 0; i < others.length; i += 1) {
      const el = rowRefs.current.get(others[i]);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (pointerY < midpoint) {
        insertIndex = i;
        break;
      }
    }

    const nextOrder = [...others.slice(0, insertIndex), draggedId, ...others.slice(insertIndex)];
    const unchanged = nextOrder.length === current.length && nextOrder.every((id, i) => id === current[i]);

    if (unchanged) {
      return;
    }

    currentOrderRef.current = nextOrder;
    startTransition(() => {
      setOptimisticOrderedIds(nextOrder);
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (!canManageProjects || isReorderPending) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartOrderRef.current = currentOrderRef.current;
    setDraggingId(id);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!draggingId) return;
    reorderAroundPointer(event.clientY, draggingId);
  }

  function handlePointerUp() {
    if (!draggingId) return;
    setDraggingId(null);

    const currentOrder = currentOrderRef.current;
    const previousOrder = dragStartOrderRef.current;
    const orderChanged =
      currentOrder.length !== previousOrder.length || currentOrder.some((id, i) => id !== previousOrder[i]);

    if (!orderChanged) {
      return;
    }

    setReorderError(null);

    startReorderTransition(async () => {
      const result: ProjectState = await reorderProjectsAction(currentOrder);
      if (result.error) {
        setReorderError(result.error);
        currentOrderRef.current = previousOrder;
        startTransition(() => {
          setOptimisticOrderedIds(previousOrder);
        });
      }
    });
  }

  const displayProjects = [
    ...(defaultProject ? [defaultProject] : []),
    ...orderedIds.map((id) => projectsById.get(id)).filter((project): project is Project => Boolean(project)),
  ];

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
          {displayProjects.map((project) => {
            const isCurrent = project.slug === currentProjectSlug;
            const pillStyle = { "--pill-color": pickProjectColor(project.id) } as CSSProperties;

            if (editingId === project.id) {
              return (
                <form action={renameAction} className="project-pill project-pill--editing" key={project.id} style={pillStyle}>
                  <div className="project-pill__edit-row">
                    <input name="projectId" type="hidden" value={project.id} />
                    <input
                      autoFocus
                      className="project-pill__edit-input"
                      defaultValue={project.name}
                      disabled={renamePending}
                      maxLength={50}
                      name="name"
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                    />
                    <div className="project-pill__edit-actions">
                      <button aria-label="이름 저장" className="pill-icon-button" disabled={renamePending} type="submit">
                        ✓
                      </button>
                      <button
                        aria-label="수정 취소"
                        className="pill-icon-button"
                        disabled={renamePending}
                        onClick={() => setEditingId(null)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {renameState.error ? <p className="error-text project-pill__edit-error">{renameState.error}</p> : null}
                </form>
              );
            }

            return (
              <div
                className={`project-pill-row${draggingId === project.id ? " project-pill-row--dragging" : ""}`}
                key={project.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(project.id, el);
                  else rowRefs.current.delete(project.id);
                }}
              >
                {!project.isDefault ? (
                  <button
                    aria-label={`${project.name} 순서 옮기기`}
                    className="project-drag-handle"
                    disabled={!canManageProjects || isReorderPending}
                    onPointerDown={(event) => handlePointerDown(event, project.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    type="button"
                  >
                    <GripIcon />
                  </button>
                ) : (
                  <span className="project-drag-handle project-drag-handle--placeholder" />
                )}

                <Link
                  className={`project-pill${isCurrent ? " project-pill--active" : ""}`}
                  href={`${currentPath}?project=${encodeURIComponent(project.slug)}`}
                  style={pillStyle}
                >
                  <span>{project.name}</span>
                  {project.isDefault ? <small>default</small> : null}
                </Link>

                <details className="pill-menu">
                  <summary aria-label={`${project.name} 메뉴`} className="pill-menu__trigger">
                    ⋯
                  </summary>
                  <div className="pill-menu__list">
                    <button
                      className="pill-menu__item"
                      disabled={!canManageProjects}
                      onClick={(event) => {
                        setEditingId(project.id);
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                      type="button"
                    >
                      수정
                    </button>
                    {!project.isDefault ? (
                      <form
                        action={deleteAction}
                        onSubmit={(event) => {
                          if (
                            !window.confirm(
                              `"${project.name}" 프로젝트를 삭제할까? 이 프로젝트의 할 일과 회고가 모두 함께 삭제되고 되돌릴 수 없어.`,
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input name="projectId" type="hidden" value={project.id} />
                        <button
                          className="pill-menu__item pill-menu__item--danger"
                          disabled={!canManageProjects || deletePending}
                          type="submit"
                        >
                          삭제
                        </button>
                      </form>
                    ) : null}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
        {deleteState.error ? <p className="error-text">{deleteState.error}</p> : null}
        {reorderError ? <p className="error-text">{reorderError}</p> : null}
        {isReorderPending ? <p className="help-text">프로젝트 순서를 저장하는 중...</p> : null}
      </div>

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
