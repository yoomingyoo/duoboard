import { updateTaskStatusAction } from "@/actions/tasks";
import type { Task, TaskStatus } from "@/lib/sample-data";

type TaskCardProps = {
  task: Task;
};

const assigneeLabel = {
  hyejin: "혜진",
  mingyoo: "민규",
};

const statusMeta: Array<{ label: string; value: TaskStatus }> = [
  { label: "Todo", value: "todo" },
  { label: "Doing", value: "doing" },
  { label: "Done", value: "done" },
];

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="task-card">
      <div className="task-card__meta">
        <span className="task-card__badge">{assigneeLabel[task.assignee]}</span>
      </div>
      <strong>{task.title}</strong>

      <form action={updateTaskStatusAction} className="task-status-form">
        <input name="taskId" type="hidden" value={task.id} />
        {statusMeta.map((status) => {
          const isCurrent = status.value === task.status;

          return (
            <button
              className={`status-chip status-chip--${status.value}${isCurrent ? " status-chip--active" : ""}`}
              disabled={isCurrent}
              key={status.value}
              name="status"
              type="submit"
              value={status.value}
            >
              {status.label}
            </button>
          );
        })}
      </form>
    </article>
  );
}
