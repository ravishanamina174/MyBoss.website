import type { TaskStatus } from "@/types/api";

const styles: Record<TaskStatus, string> = {
  PENDING: "text-warning",
  COMPLETED: "text-success",
  CANCELLED: "text-muted-foreground",
};

const dots: Record<TaskStatus, string> = {
  PENDING: "bg-warning",
  COMPLETED: "bg-success",
  CANCELLED: "bg-muted-foreground",
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
      className={`inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}
