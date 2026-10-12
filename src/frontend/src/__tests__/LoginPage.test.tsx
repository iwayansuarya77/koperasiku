import { Role } from "@/backend";
import { LoginPage } from "@/pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createActorMock } from "./helpers";

const actorMock = createActorMock();

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorMock, isFetching: false }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage />
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorMock.getCallerRole.mockResolvedValue(null);
  });

  it("renders the login form without a blank screen", async () => {
    renderPage();
    expect(await screen.findByTestId("login.page")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama pengguna")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument();
  });

  it("logs in and navigates on valid credentials", async () => {
    const user = userEvent.setup();
    actorMock.login.mockResolvedValue({
      __kind__: "ok",
      ok: {
        id: 0n,
        username: "admin",
        role: Role.admin,
        isActive: true,
        createdAt: 0n,
      },
    });
    renderPage();

    await user.type(await screen.findByLabelText("Nama pengguna"), "admin");
    await user.type(screen.getByLabelText("Kata sandi"), "admin123");
    await user.click(screen.getByTestId("login.submit_button"));

    await waitFor(() => {
      expect(actorMock.login).toHaveBeenCalledWith("admin", "admin123");
    });
  });

  it("shows the backend error message when login fails", async () => {
    const user = userEvent.setup();
    actorMock.login.mockResolvedValue({
      __kind__: "err",
      err: "Kredensial salah",
    });
    renderPage();

    await user.type(await screen.findByLabelText("Nama pengguna"), "admin");
    await user.type(screen.getByLabelText("Kata sandi"), "salah");
    await user.click(screen.getByTestId("login.submit_button"));

    expect(await screen.findByTestId("login.error_state")).toHaveTextContent(
      "Kredensial salah",
    );
  });
});
