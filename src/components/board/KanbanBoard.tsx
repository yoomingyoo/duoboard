import type { Task } from "@/lib/sample-data";
import { KanbanColumn } from "./KanbanColumn";

type KanbanBoardProps = {
  tasks: Task[];
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="kanban-grid">
      <KanbanColumn title="Todo" status="todo" tasks={tasks} />
      <KanbanColumn title="Doing" status="doing" tasks={tasks} />
      <KanbanColumn title="Done" status="done" tasks={tasks} />
    </div>
  );
}
