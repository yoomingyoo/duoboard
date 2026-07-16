import type { Task, TaskStatus } from "@/lib/sample-data";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
};

export function KanbanColumn({ title, status, tasks }: KanbanColumnProps) {
  const filtered = tasks.filter((task) => task.status === status);

  return (
    <section className={`kanban-column kanban-column--${status}`}>
      <header className="kanban-column__header">
        <h2>{title}</h2>
        <span>{filtered.length}</span>
      </header>
      <div className="kanban-column__body">
        {filtered.length === 0 ? (
          <div className="empty-state">아직 카드가 없어.</div>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}
