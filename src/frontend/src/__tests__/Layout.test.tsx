import { Role } from "@/backend";
import { Layout } from "@/components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createActorMock } from "./helpers";

const actorMock = createActorMock();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorMock, isFetching: false }),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useRouterState: () => "/",
}));

function renderLayout(role: Role) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Layout userRole={role} username="Pengguna">
        <div>konten</div>
      </Layout>
    </QueryClientProvider>,
  );
}

describe("Layout role-based navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorMock.getLogo.mockResolvedValue("");
  });

  it("shows every menu to an admin", () => {
    renderLayout(Role.admin);
    expect(screen.getByTestId("nav.link.dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.anggota")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.akun_coa")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.simpanan")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.pinjaman")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.akuntansi")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.laporan")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.pengaturan")).toBeInTheDocument();
  });

  it("hides admin-only menus from a kasir", () => {
    renderLayout(Role.kasir);
    expect(screen.getByTestId("nav.link.dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.anggota")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.simpanan")).toBeInTheDocument();
    expect(screen.queryByTestId("nav.link.akun_coa")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav.link.pengaturan")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav.link.laporan")).not.toBeInTheDocument();
  });

  it("shows reports to a supervisor but not admin-only menus", () => {
    renderLayout(Role.supervisor);
    expect(screen.getByTestId("nav.link.laporan")).toBeInTheDocument();
    expect(screen.queryByTestId("nav.link.akun_coa")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nav.link.pengaturan")).not.toBeInTheDocument();
  });
});
