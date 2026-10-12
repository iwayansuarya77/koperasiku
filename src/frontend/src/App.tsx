import { Role } from "@/backend";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCallerRole } from "@/hooks/use-auth";
import { AccountingPage } from "@/pages/AccountingPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { CoaPage } from "@/pages/CoaPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoansPage } from "@/pages/LoansPage";
import { LoginPage } from "@/pages/LoginPage";
import { MembersPage } from "@/pages/MembersPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SavingsPage } from "@/pages/SavingsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UsersPage } from "@/pages/UsersPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const ALL: Role[] = [Role.admin, Role.kasir, Role.supervisor];

function Shell() {
  const { data: userRole } = useCallerRole();
  const username = "Pengguna";

  if (!userRole) {
    return <Outlet />;
  }

  return (
    <Layout userRole={userRole} username={username}>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: Shell });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/members",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <MembersPage />
    </ProtectedRoute>
  ),
});

const coaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/coa",
  component: () => (
    <ProtectedRoute allowedRoles={[Role.admin]}>
      <CoaPage />
    </ProtectedRoute>
  ),
});

const savingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/savings",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <SavingsPage />
    </ProtectedRoute>
  ),
});

const loansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loans",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <LoansPage />
    </ProtectedRoute>
  ),
});

const accountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounting",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <AccountingPage />
    </ProtectedRoute>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: () => (
    <ProtectedRoute allowedRoles={[Role.admin, Role.supervisor]}>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <ProtectedRoute allowedRoles={[Role.admin]}>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const changePasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/change-password",
  component: () => (
    <ProtectedRoute allowedRoles={ALL}>
      <ChangePasswordPage />
    </ProtectedRoute>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: () => (
    <ProtectedRoute allowedRoles={[Role.admin]}>
      <UsersPage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  membersRoute,
  coaRoute,
  savingsRoute,
  loansRoute,
  accountingRoute,
  reportsRoute,
  settingsRoute,
  changePasswordRoute,
  usersRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
