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
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-[5px] ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <p className="mt-4 text-[22px] font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
    </article>
  );
}
