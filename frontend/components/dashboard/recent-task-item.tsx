import type { TaskResponse } from "@/types/api";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";

interface RecentTaskItemProps {
  task: TaskResponse;
}

export function RecentTaskItem({ task }: RecentTaskItemProps) {
  return (
    <article className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[13px] font-medium">{task.title}</h4>

        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {task.dueAt
            ? `Due ${new Date(task.dueAt).toLocaleDateString()}`
            : `Created ${new Date(task.createdAt).toLocaleDateString()}`}
        </p>
      </div>

      <TaskStatusBadge status={task.status} />
    </article>
  );
}
