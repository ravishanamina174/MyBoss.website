import type { Metadata } from "next";
import {
  ListTodo,
  Users,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Overview",
};

const overviewItems = [
  {
    title: "Total tasks",
    value: "—",
    description: "Tasks in your business",
    icon: ListTodo,
  },
  {
    title: "Active staff",
    value: "—",
    description: "Active team members",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Overview
          </h2>

          <p className="text-sm text-muted-foreground sm:text-base">
            A clear view of your business activity.
          </p>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        {overviewItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Getting started */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">
            Getting started
          </h3>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Your business workspace is ready. Once your business and
          team are connected, important tasks and activity will
          appear here.
        </p>
      </section>
    </div>
  );
}