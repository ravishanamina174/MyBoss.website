import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = false,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </article>
  );
}