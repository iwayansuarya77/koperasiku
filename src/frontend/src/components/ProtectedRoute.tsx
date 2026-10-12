import type { Role } from "@/backend";
import { useCallerRole } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { data: userRole, isLoading } = useCallerRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!userRole) {
      void navigate({ to: "/login" });
      return;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      void navigate({ to: "/" });
    }
  }, [isLoading, userRole, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-ocid="page.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat sesi…</p>
        </div>
      </div>
    );
  }

  if (!userRole) return null;
  if (allowedRoles && !allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
}
