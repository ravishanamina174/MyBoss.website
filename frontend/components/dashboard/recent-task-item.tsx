import type { TaskResponse } from "@/types/api";

interface RecentTaskItemProps {
  task: TaskResponse;
}

const statusStyles = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-secondary text-muted-foreground",
};

const statusLabels = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RecentTaskItem({ task }: RecentTaskItemProps) {
  return (
    <article className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium">
          {task.title}
        </h4>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {task.dueAt
            ? `Due ${new Date(task.dueAt).toLocaleDateString()}`
            : `Created ${new Date(task.createdAt).toLocaleDateString()}`}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
          statusStyles[task.status]
        }`}
      >
        {statusLabels[task.status]}
      </span>
    </article>
  );
}