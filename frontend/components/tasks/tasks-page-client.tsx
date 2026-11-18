
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Search,
  Plus,
  CalendarDays,
  UserRound,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  Ban,
} from "lucide-react";

import { api } from "@/lib/api/client";
import type {
  TaskResponse,
  TaskFilter,
  StaffResponse,
  CreateTaskRequest,
} from "@/types/api";

import { TaskStatusBadge } from "./task-status-badge";

type Props = {
  businessId: string;
  role: "OWNER" | "STAFF";
};

type TaskForm = {
  title: string;
  description: string;
  assignedToMembershipId: string;
  dueAt: string;
};

const initialForm: TaskForm = {
  title: "",
  description: "",
  assignedToMembershipId: "",
  dueAt: "",
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "No due date";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isOverdue(task: TaskResponse) {
  return (
    task.status === "PENDING" &&
    task.dueAt !== null &&
    new Date(task.dueAt).getTime() < Date.now()
  );
}


export default function TasksPageClient({
  businessId,
  role,
}: Props) {
  const { getToken } = useAuth();

  const isOwner = role === "OWNER";

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] =
    useState<TaskResponse | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<TaskResponse | null>(null);

  const [form, setForm] = useState<TaskForm>(initialForm);

  const loadData = useCallback(async () => {
  try {
    const token = await getToken();

      if (!token) {
        throw new Error("Authentication required.");
      }

      const [taskData, staffData] = await Promise.all([
        api.getTasks(token, businessId),
        isOwner
          ? api.getStaff(token, businessId)
          : Promise.resolve([]),
      ]);

      setTasks(taskData);
      setStaff(
        staffData.filter(
          (member) =>
            member.role === "STAFF" &&
            member.status === "ACTIVE"
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, businessId, isOwner]);

  useEffect(() => {
  void Promise.resolve().then(() => loadData());
}, [loadData]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        filter === "ALL" || task.status === filter;

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [tasks, search, filter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(
      (task) => task.status === "PENDING"
    ).length,
    completed: tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length,
    overdue: tasks.filter(isOverdue).length,
  }), [tasks]);

  const openCreateDialog = () => {
    setEditingTask(null);
    setForm(initialForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (task: TaskResponse) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description ?? "",
      assignedToMembershipId:
        task.assignedToMembershipId ?? "",
      dueAt: toLocalDateTime(task.dueAt),
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingTask(null);
    setForm(initialForm);
  };

  const saveTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) return;

    setSaving(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required.");
      }

      const payload: CreateTaskRequest = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        assignedToMembershipId:
          form.assignedToMembershipId || null,
        dueAt: form.dueAt
          ? new Date(form.dueAt).toISOString()
          : null,
      };

      if (editingTask) {
        const updated = await api.updateTask(
          token,
          businessId,
          editingTask.id,
          payload
        );

        setTasks((previous) =>
          previous.map((task) =>
            task.id === updated.id ? updated : task
          )
        );

        setNotice("Task updated successfully.");
      } else {
        const created = await api.createTask(
          token,
          businessId,
          payload
        );

        setTasks((previous) => [created, ...previous]);

        setNotice("Task created successfully.");
      }

      setDialogOpen(false);
      setEditingTask(null);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  const runTaskAction = async (
    task: TaskResponse,
    action: "complete" | "cancel" | "delete"
  ) => {
    const confirmationMessages = {
      complete: "Mark this task as completed?",
      cancel: "Cancel this task?",
      delete: "Remove this task from the active task list?",
    };

    if (!window.confirm(confirmationMessages[action])) {
      return;
    }

    setActionId(task.id);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required.");
      }

      if (action === "complete") {
        const updated = await api.completeTask(
          token,
          businessId,
          task.id
        );

        setTasks((previous) =>
          previous.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
        setSelectedTask((previous) =>
        previous?.id === updated.id ? updated : previous
        );

        setNotice("Task completed successfully.");
      }

      if (action === "cancel") {
        const updated = await api.cancelTask(
          token,
          businessId,
          task.id
        );

        setTasks((previous) =>
          previous.map((item) =>
            item.id === updated.id ? updated : item
          )
        );

        setSelectedTask((previous) =>
        previous?.id === updated.id ? updated : previous
        );
        setNotice("Task cancelled successfully.");
      }


      if (action === "delete") {
        await api.deleteTask(
          token,
          businessId,
          task.id
        );

        setTasks((previous) =>
          previous.filter((item) => item.id !== task.id)
        );

        setNotice("Task removed from the active task list.");
        setSelectedTask(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to perform this action."
      );
    } finally {
      setActionId(null);
    }
  };

  const selectedStaff = (membershipId: string | null) =>
    staff.find(
      (member) => member.membershipId === membershipId
    );

  const getStaffLabel = (membershipId: string | null) => {
    if (!membershipId) return "Unassigned";

    const member = selectedStaff(membershipId);

    return member?.fullName || member?.email || "Staff member";
  };

  const statsCards = [
    {
      label: "Total tasks",
      value: stats.total,
      icon: ClipboardList,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
    },
  ];

  return (
    <section className="workspace-page">

      {/* HEADER */}

      <div className="workspace-page-header">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {isOwner ? "Tasks" : "My Tasks"}
          </h1>

          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {isOwner
              ? "Create, assign and track your business tasks."
              : "View and manage the tasks assigned to you."}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openCreateDialog}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] bg-primary px-3 text-[13px] font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            <Plus size={14} />
            Create task
          </button>
        )}
      </div>

      {/* NOTIFICATIONS */}

      {error && !dialogOpen && (
        <div className="flex items-start gap-2 rounded-[5px] border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between rounded-[5px] border border-success/30 bg-success/5 px-3 py-2.5 text-[13px] text-success">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="workspace-stat-grid">
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="workspace-box workspace-metric"
            >
              <div className="flex items-center justify-between">
                <p className="workspace-metric-label">
                  {stat.label}
                </p>
                <span className="workspace-metric-icon"><Icon size={16} /></span>
              </div>

              <strong>{stat.value}</strong>
            </div>
          );
        })}
      </div>

      {/* SEARCH AND FILTER */}

      <div className="workspace-box workspace-toolbar flex-col !items-stretch sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search tasks"
            placeholder="Search tasks..."
            className="h-9 w-full rounded-[5px] border border-input bg-input-bg pl-10 pr-3 text-[13px] outline-none transition focus:border-primary"
          />
        </div>

        <select
          aria-label="Filter tasks by status"
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as TaskFilter)
          }
          className="h-9 rounded-[5px] border border-input bg-input-bg px-3 text-[13px] outline-none focus:border-primary"
        >
          <option value="ALL">All tasks</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* TASK LIST */}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={19} />
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="workspace-box workspace-empty">
          <div className="workspace-empty-icon">
            <ClipboardList
              size={18}
              className="text-muted-foreground"
            />
          </div>

          <h3 className="text-[14px] font-medium">
            {search || filter !== "ALL"
              ? "No matching tasks"
              : "No tasks yet"}
          </h3>

          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            {search || filter !== "ALL"
              ? "Try changing your search or filter."
              : isOwner
                ? "Create your first task to get your business moving."
                : "You don't have any assigned tasks yet."}
          </p>

          {isOwner && !search && filter === "ALL" && (
            <button
              onClick={openCreateDialog}
              className="mt-3 text-[13px] font-medium text-primary hover:underline"
            >
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className="rounded-lg border border-border bg-card p-3.5 transition hover:bg-surface-elevated/40 sm:p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-semibold">
                      {task.title}
                    </h3>

                    <TaskStatusBadge status={task.status} />

                    {task.editedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        Edited
                      </span>
                    )}

                    {isOverdue(task) && (
                      <span className="rounded-[4px] border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                        Overdue
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(task.dueAt)}
                    </span>

                    {isOwner && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={14} />
                        {getStaffLabel(task.assignedToMembershipId)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-2.5 text-[12px] font-medium hover:bg-secondary"
                  >
                    <Eye size={14} />
                    Details
                  </button>

                  {isOwner && task.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => openEditDialog(task)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-2.5 text-[12px] font-medium hover:bg-secondary"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          runTaskAction(task, "cancel")
                        }
                        disabled={actionId === task.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-border px-2.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
                      >
                        <Ban size={14} />
                        Cancel
                      </button>
                    </>
                  )}

                  {isOwner && (
                    <button
                      onClick={() =>
                        runTaskAction(task, "delete")
                      }
                      disabled={actionId === task.id}
                      aria-label="Delete task"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-border text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {actionId === task.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  )}

                  {!isOwner && task.status === "PENDING" && (
                    <button
                      onClick={() =>
                        runTaskAction(task, "complete")
                      }
                      disabled={actionId === task.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                    >
                      {actionId === task.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-popover p-5 shadow-xl sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  id="task-dialog-title"
                  className="text-[16px] font-semibold"
                >
                  {editingTask ? "Edit task" : "Create task"}
                </h2>

                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {editingTask
                    ? "Update the task information."
                    : "Add a new task for your team."}
                </p>
              </div>

              <button
                onClick={closeDialog}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-[5px] p-1.5 hover:bg-secondary"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-1.5 block text-[12px] font-medium"
                >
                  Task title *
                </label>

                <input
                  id="task-title"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Prepare weekly inventory"
                  className="h-9 w-full rounded-[5px] border border-input bg-input-bg px-3 text-[13px] outline-none focus:border-primary"
                />

                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {form.title.length}/200
                </p>
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-1.5 block text-[12px] font-medium"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Add additional task details..."
                  className="w-full resize-y rounded-[5px] border border-input bg-input-bg p-3 text-[13px] outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-1.5 block text-[12px] font-medium"
                >
                  Assign to
                </label>

                <select
                  id="task-assignee"
                  value={form.assignedToMembershipId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      assignedToMembershipId: event.target.value,
                    })
                  }
                  className="h-9 w-full rounded-[5px] border border-input bg-input-bg px-3 text-[13px] outline-none focus:border-primary"
                >
                  <option value="">Unassigned</option>

                  {staff.map((member) => (
                    <option
                      key={member.membershipId}
                      value={member.membershipId}
                    >
                      {member.fullName || member.email}
                    </option>
                  ))}
                </select>

                {staff.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    No active staff members available.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-1.5 block text-[12px] font-medium"
                >
                  Due date
                </label>

                <input
                  id="task-due-date"
                  type="datetime-local"
                  value={form.dueAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dueAt: event.target.value,
                    })
                  }
                  className="h-9 w-full rounded-[5px] border border-input bg-input-bg px-3 text-[13px] outline-none focus:border-primary"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={saving}
                  className="h-9 rounded-[5px] border border-border px-3 text-[13px] font-medium hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 size={15} className="animate-spin" />
                  )}

                  {editingTask ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK DETAILS DIALOG */}

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTask(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-details-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-popover p-5 shadow-xl sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <TaskStatusBadge status={selectedTask.status} />

                <h2
                  id="task-details-title"
                  className="mt-2.5 text-[18px] font-semibold"
                >
                  {selectedTask.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                aria-label="Close details"
                className="rounded-[5px] p-1.5 hover:bg-secondary"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Due date
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatDate(selectedTask.dueAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Assigned to
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {isOwner
                      ? getStaffLabel(selectedTask.assignedToMembershipId)
                      : "You"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Created
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatDate(selectedTask.createdAt)}
                  </p>
                </div>

                {selectedTask.completedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Completed
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(selectedTask.completedAt)}
                    </p>
                  </div>
                )}

                {selectedTask.editedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Last edited
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(selectedTask.editedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {isOwner && selectedTask.status === "PENDING" && (
                <button
                  onClick={() => {
                    const task = selectedTask;
                    setSelectedTask(null);
                    openEditDialog(task);
                  }}
                  className="inline-flex h-8 items-center gap-2 rounded-[5px] border border-border px-3 text-[13px] hover:bg-secondary"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}

              {!isOwner && selectedTask.status === "PENDING" && (
                <button
                  onClick={() =>
                    runTaskAction(selectedTask, "complete")
                  }
                  disabled={actionId === selectedTask.id}
                  className="inline-flex h-8 items-center gap-2 rounded-[5px] bg-primary px-3 text-[13px] text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  <Check size={15} />
                  Complete task
                </button>
              )}

              <button
                onClick={() => setSelectedTask(null)}
                className="h-8 rounded-[5px] border border-border px-3 text-[13px] hover:bg-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
