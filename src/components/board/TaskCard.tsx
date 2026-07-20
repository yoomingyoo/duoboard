import { deleteTaskAction, updateTaskAction, updateTaskStatusAction } from "@/actions/tasks";
import { ChevronIcon } from "@/components/common/ChevronIcon";
import type { Task, TaskStatus } from "@/lib/sample-data";

type TaskCardProps = {
  task: Task;
  projectId: string;
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

export function TaskCard({ task, projectId }: TaskCardProps) {
  return (
    <article className="task-card">
      <div className="task-card__meta">
        <span className={`task-card__badge task-card__badge--${task.assignee}`}>
          {assigneeLabel[task.assignee]}
        </span>
      </div>
      <strong>{task.title}</strong>

      <form action={updateTaskStatusAction} className="task-status-form">
        <input name="projectId" type="hidden" value={projectId} />
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

      <div className="item-actions">
        <details className="inline-disclosure">
          <summary className="inline-toggle">
            <ChevronIcon />
            수정
          </summary>
          <form action={updateTaskAction} className="inline-edit-body">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="taskId" type="hidden" value={task.id} />
            <label>
              <span>할 일 제목</span>
              <input className="input" defaultValue={task.title} maxLength={120} name="title" required />
            </label>
            <label>
              <span>담당자</span>
              <select className="input" defaultValue={task.assignee} name="assignee">
                <option value="mingyoo">민규</option>
                <option value="hyejin">혜진</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              수정 저장
            </button>
          </form>
        </details>

        <form action={deleteTaskAction}>
          <input name="projectId" type="hidden" value={projectId} />
          <input name="taskId" type="hidden" value={task.id} />
          <button className="text-button text-button--danger" type="submit">
            삭제
          </button>
        </form>
      </div>
    </article>
  );
}
