import { LoanMethod } from "@/backend";
import {
  AmortizationTable,
  buildSchedule,
} from "@/components/AmortizationTable";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("buildSchedule", () => {
  it("produces one row per term month for anuitas", () => {
    const rows = buildSchedule({
      principal: 1_200_000,
      interestRate: 12,
      method: LoanMethod.anuitas,
      termMonths: 12,
    });
    expect(rows).toHaveLength(12);
    // Anuitas: the installment is constant across the term.
    const first = rows[0].installment;
    for (const row of rows) {
      expect(row.installment).toBeCloseTo(first, 6);
    }
    expect(rows[rows.length - 1].remaining).toBeCloseTo(0, 6);
  });

  it("produces a constant principal portion for menurun", () => {
    const rows = buildSchedule({
      principal: 1_200_000,
      interestRate: 12,
      method: LoanMethod.menurun,
      termMonths: 12,
    });
    expect(rows).toHaveLength(12);
    for (const row of rows) {
      expect(row.principal).toBeCloseTo(100_000, 6);
    }
    // Declining balance: interest falls month over month.
    expect(rows[0].interest).toBeGreaterThan(rows[11].interest);
    expect(rows[11].remaining).toBeCloseTo(0, 6);
  });

  it("returns no rows for invalid input", () => {
    expect(
      buildSchedule({
        principal: 0,
        interestRate: 12,
        method: LoanMethod.anuitas,
        termMonths: 12,
      }),
    ).toEqual([]);
    expect(
      buildSchedule({
        principal: 1_000_000,
        interestRate: 12,
        method: LoanMethod.anuitas,
        termMonths: 0,
      }),
    ).toEqual([]);
  });
});

describe("AmortizationTable", () => {
  it("renders the schedule rows", () => {
    render(
      <AmortizationTable
        principal={1_200_000}
        interestRate={12}
        method={LoanMethod.anuitas}
        termMonths={12}
      />,
    );
    expect(screen.getByTestId("loans.amortization_table")).toBeInTheDocument();
    expect(screen.getByTestId("loans.amortization_row.1")).toBeInTheDocument();
    expect(screen.getByTestId("loans.amortization_row.12")).toBeInTheDocument();
  });

  it("shows the empty state for invalid input", () => {
    render(
      <AmortizationTable
        principal={0}
        interestRate={12}
        method={LoanMethod.anuitas}
        termMonths={12}
      />,
    );
    expect(
      screen.getByTestId("loans.amortization_empty_state"),
    ).toBeInTheDocument();
  });
});
