import { MembersPage } from "@/pages/MembersPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createActorMock, makeMember } from "./helpers";

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
      <MembersPage />
    </QueryClientProvider>,
  );
}

describe("MembersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists members returned by the backend", async () => {
    actorMock.listMembers.mockResolvedValue([
      makeMember({ id: 0n, name: "Budi", memberNumber: "A-0001" }),
      makeMember({ id: 1n, name: "Siti", memberNumber: "A-0002" }),
    ]);
    renderPage();

    expect(await screen.findByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
  });

  it("filters the list by the search term", async () => {
    const user = userEvent.setup();
    actorMock.listMembers.mockResolvedValue([
      makeMember({ id: 0n, name: "Budi", memberNumber: "A-0001" }),
      makeMember({ id: 1n, name: "Siti", memberNumber: "A-0002" }),
    ]);
    renderPage();

    await screen.findByText("Budi");
    await user.type(screen.getByTestId("member.search_input"), "Siti");

    await waitFor(() => {
      expect(screen.queryByText("Budi")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Siti")).toBeInTheDocument();
  });

  it("shows the empty state when there are no members", async () => {
    actorMock.listMembers.mockResolvedValue([]);
    renderPage();
    expect(
      await screen.findByTestId("members.empty_state"),
    ).toBeInTheDocument();
  });

  it("creates a member through the form", async () => {
    const user = userEvent.setup();
    actorMock.listMembers.mockResolvedValue([]);
    actorMock.createMember.mockResolvedValue({ __kind__: "ok", ok: 0n });
    renderPage();

    await user.click(await screen.findByTestId("member.add_button"));
    await user.type(
      await screen.findByTestId("member.member_number.input"),
      "A-0003",
    );
    await user.type(screen.getByTestId("member.name.input"), "Andi");
    await user.click(screen.getByTestId("member.submit_button"));

    await waitFor(() => {
      expect(actorMock.createMember).toHaveBeenCalledWith(
        "A-0003",
        "Andi",
        "",
        "",
        "",
      );
    });
  });
});
