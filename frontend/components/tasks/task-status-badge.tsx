
import type { TaskStatus } from "@/types/api";

const styles: Record<TaskStatus, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CANCELLED:
    "bg-muted text-muted-foreground",
};

const labels: Record<TaskStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function TaskStatusBadge({
  status,
}: {
  status: TaskStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
