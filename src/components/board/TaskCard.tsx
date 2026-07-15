import type { Task } from "@/lib/sample-data";

type TaskCardProps = {
  task: Task;
};

const assigneeLabel = {
  hyejin: "혜진",
  mingyoo: "민규",
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <div className="task-card__meta">
        <span className="task-card__badge">{assigneeLabel[task.assignee]}</span>
      </div>
      <strong>{task.title}</strong>
    </article>
  );
}
