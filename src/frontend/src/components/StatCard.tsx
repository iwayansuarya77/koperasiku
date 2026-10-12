import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  isLoading,
  ocid,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
  ocid: string;
}) {
  return (
    <Card
      data-ocid={ocid}
      className="gap-0 rounded-lg border-border py-0 shadow-subtle"
    >
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : (
            <p className="mt-1 truncate text-figure text-2xl font-semibold text-foreground">
              {value}
            </p>
          )}
          {hint && !isLoading && (
            <p className={cn("mt-1 truncate text-xs text-muted-foreground")}>
              {hint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
