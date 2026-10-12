import { SavingsPage } from "@/pages/SavingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createActorMock,
  makeAccount,
  makeMember,
  makeSavingsType,
} from "./helpers";

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
      <SavingsPage />
    </QueryClientProvider>,
  );
}

describe("SavingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorMock.listMembers.mockResolvedValue([
      makeMember({ id: 0n, name: "Budi", memberNumber: "A-0001" }),
    ]);
    actorMock.listAccounts.mockResolvedValue([
      makeAccount({ code: "100", name: "Kas" }),
    ]);
    actorMock.listSavingsTypes.mockResolvedValue([
      makeSavingsType({ id: 1n, name: "Sukarela" }),
    ]);
  });

  it("renders the savings types table", async () => {
    renderPage();
    expect(await screen.findByText("Sukarela")).toBeInTheDocument();
    expect(screen.getByTestId("savings_types.table")).toBeInTheDocument();
  });

  it("shows the empty state when no savings types exist", async () => {
    actorMock.listSavingsTypes.mockResolvedValue([]);
    renderPage();
    expect(
      await screen.findByTestId("savings_types.empty_state"),
    ).toBeInTheDocument();
  });

  it("records a deposit with the chosen type and cash account", async () => {
    const user = userEvent.setup();
    actorMock.recordSavingsTransaction.mockResolvedValue({
      __kind__: "ok",
      ok: {
        id: 1n,
        memberId: 0n,
        savingsTypeId: 1n,
        cashAccountCode: "100",
        amount: 250000,
        isDeposit: true,
        transactionNumber: "TRX-0001",
        createdAt: 0n,
      },
    });
    renderPage();

    await user.click(
      await screen.findByTestId("savings_transaction.member_select"),
    );
    await user.click(await screen.findByRole("option", { name: /Budi/ }));

    await user.click(screen.getByTestId("savings_transaction.type_select"));
    await user.click(await screen.findByRole("option", { name: "Sukarela" }));

    await user.click(screen.getByTestId("savings_transaction.account_select"));
    await user.click(await screen.findByRole("option", { name: /Kas/ }));

    await user.type(
      screen.getByTestId("savings_transaction.amount_input"),
      "250000",
    );
    await user.click(screen.getByTestId("savings_transaction.submit_button"));

    await waitFor(() => {
      expect(actorMock.recordSavingsTransaction).toHaveBeenCalledWith(
        0n,
        1n,
        "100",
        250000,
        true,
      );
    });
  });

  it("creates a savings type from the form", async () => {
    const user = userEvent.setup();
    actorMock.createSavingsType.mockResolvedValue({ __kind__: "ok", ok: 2n });
    renderPage();

    await user.click(await screen.findByTestId("savings.add_type_button"));
    await user.type(
      await screen.findByTestId("savings_type.name_input"),
      "Deposito",
    );
    await user.type(screen.getByTestId("savings_type.rate_input"), "5");

    await user.click(screen.getByTestId("savings_type.account_select"));
    await user.click(await screen.findByRole("option", { name: /Kas/ }));

    await user.click(screen.getByTestId("savings_type.submit_button"));

    await waitFor(() => {
      expect(actorMock.createSavingsType).toHaveBeenCalledWith(
        "Deposito",
        5,
        "100",
      );
    });
  });
});
