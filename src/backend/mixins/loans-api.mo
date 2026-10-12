import Map "mo:core/Map";
import Common "../types/common";
import LoanTypes "../types/loans";
import AccountingTypes "../types/accounting";
import LoansLib "../lib/loans";

mixin (
  loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
  installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
  loanState : LoanTypes.LoanState,
  journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  accountingState : AccountingTypes.AccountingState,
  memberEmails : Map.Map<Common.MemberId, Text>,
) {
  public shared ({ caller }) func createLoan(memberId : Common.MemberId, principal : Float, interestRate : Float, method : LoanTypes.LoanMethod, termMonths : Nat, penaltyMonths : Nat, penaltyRate : Float) : async Common.Result<LoanTypes.Loan> {
    ignore caller;
    LoansLib.createLoan(loans, loanState, memberId, principal, interestRate, method, termMonths, penaltyMonths, penaltyRate);
  };

  public shared ({ caller }) func disburseLoan(loanId : Common.LoanId) : async Common.Result<()> {
    ignore caller;
    LoansLib.disburseLoan(loans, journals, accountingState, loanId);
  };

  public shared ({ caller }) func recordInstallment(loanId : Common.LoanId, amount : Float) : async Common.Result<LoanTypes.Installment> {
    ignore caller;
    LoansLib.recordInstallment(loans, installments, journals, accountingState, loanState, loanId, amount);
  };

  public query ({ caller }) func calculatePenalty(loanId : Common.LoanId, unpaidMonths : Nat) : async Common.Result<Float> {
    ignore caller;
    switch (loans.get(loanId)) {
      case (?loan) { #ok(LoansLib.calculatePenalty(loan, unpaidMonths)) };
      case null { #err("Pinjaman tidak ditemukan") };
    };
  };

  public query ({ caller }) func listLoans(memberId : Common.MemberId) : async [LoanTypes.Loan] {
    ignore caller;
    LoansLib.listLoans(loans, memberId);
  };

  public query ({ caller }) func listInstallments(loanId : Common.LoanId) : async [LoanTypes.Installment] {
    ignore caller;
    LoansLib.listInstallments(installments, loanId);
  };

  public shared ({ caller }) func postMonthlyLoanInterest() : async Common.Result<Nat> {
    ignore caller;
    LoansLib.postMonthlyInterest(loans, journals, accountingState);
  };

  public shared ({ caller }) func sendDueReminders() : async Common.Result<Nat> {
    ignore caller;
    await LoansLib.sendDueReminders(loans, installments, memberEmails);
  };
};
