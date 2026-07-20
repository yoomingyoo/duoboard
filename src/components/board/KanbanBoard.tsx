import type { Task } from "@/lib/sample-data";
import { AddTaskForm } from "./AddTaskForm";
import { KanbanColumn } from "./KanbanColumn";

type KanbanBoardProps = {
  tasks: Task[];
  projectId: string;
};

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  return (
    <div className="board-layout">
      <AddTaskForm projectId={projectId} />

      <div className="kanban-grid">
        <KanbanColumn projectId={projectId} title="Todo" status="todo" tasks={tasks} />
        <KanbanColumn projectId={projectId} title="Doing" status="doing" tasks={tasks} />
        <KanbanColumn projectId={projectId} title="Done" status="done" tasks={tasks} />
      </div>
    </div>
  );
}
