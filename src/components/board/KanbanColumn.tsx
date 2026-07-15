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
    <section className="kanban-column">
      <header className="kanban-column__header">
        <h2>{title}</h2>
        <span>{filtered.length}</span>
      </header>
      <div className="kanban-column__body">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
