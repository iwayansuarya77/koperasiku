import { Role } from "@/backend";
import { useLogo, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpenText,
  ChevronRight,
  Coins,
  FileBarChart,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  allowedRoles: Role[];
};

const ALL: Role[] = [Role.admin, Role.kasir, Role.supervisor];

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ALL },
  { to: "/members", label: "Anggota", icon: Users, allowedRoles: ALL },
  {
    to: "/coa",
    label: "Akun COA",
    icon: BookOpenText,
    allowedRoles: [Role.admin],
  },
  { to: "/savings", label: "Simpanan", icon: Wallet, allowedRoles: ALL },
  { to: "/loans", label: "Pinjaman", icon: HandCoins, allowedRoles: ALL },
  { to: "/accounting", label: "Akuntansi", icon: Coins, allowedRoles: ALL },
  {
    to: "/reports",
    label: "Laporan",
    icon: FileBarChart,
    allowedRoles: [Role.admin, Role.supervisor],
  },
  {
    to: "/settings",
    label: "Pengaturan",
    icon: Settings,
    allowedRoles: [Role.admin],
  },
  { to: "/users", label: "Pengguna", icon: Users, allowedRoles: [Role.admin] },
  {
    to: "/change-password",
    label: "Ganti Password",
    icon: KeyRound,
    allowedRoles: ALL,
  },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  kasir: "Kasir",
  supervisor: "Supervisor",
};

function LogoMark() {
  const { data: logo } = useLogo();
  if (logo) {
    return (
      <img
        src={logo}
        alt="Logo koperasi"
        className="h-9 w-9 rounded-md object-cover"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-display text-sm font-bold">
      K
    </span>
  );
}

function NavLinks({
  userRole,
  onNavigate,
}: {
  userRole: Role;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(userRole),
  );

  return (
    <nav className="flex flex-col gap-1" data-ocid="nav.section">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-ocid={`nav.link.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-smooth",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  userRole,
  username,
  onNavigate,
}: {
  userRole: Role;
  username: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <LogoMark />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold leading-tight">
            Koperasi
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            Sistem Terpadu
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks userRole={userRole} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="truncate text-sm font-medium">{username}</p>
        <span className="mt-1 inline-flex items-center rounded-full bg-sidebar-primary px-2.5 py-0.5 text-xs font-semibold text-sidebar-primary-foreground">
          {ROLE_LABEL[userRole]}
        </span>
      </div>
    </div>
  );
}

export function Layout({
  children,
  userRole,
  username,
}: {
  children: ReactNode;
  userRole: Role;
  username: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        void navigate({ to: "/login" });
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarBody userRole={userRole} username={username} />
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" data-ocid="nav.sheet">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] shadow-elevated">
            <SidebarBody
              userRole={userRole}
              username={username}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card px-4 shadow-subtle sm:px-6">
          <button
            type="button"
            aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
            data-ocid="nav.toggle"
            onClick={() => setDrawerOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-smooth hover:bg-muted lg:hidden"
          >
            {drawerOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <LogoMark />
            <span className="font-display text-sm font-semibold">Koperasi</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{username}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABEL[userRole]}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {username.charAt(0).toUpperCase()}
            </span>
            <button
              type="button"
              data-ocid="nav.logout_button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-smooth hover:bg-muted disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {logout.isPending ? "Keluar…" : "Keluar"}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="border-t border-border bg-card px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
