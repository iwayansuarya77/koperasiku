import Map "mo:core/Map";
import Common "../types/common";
import AuthTypes "../types/auth";
import DashboardTypes "../types/dashboard";
import MemberTypes "../types/members";
import SavingsTypes "../types/savings";
import LoanTypes "../types/loans";
import AccountingTypes "../types/accounting";
import CoaTypes "../types/coa";
import DashboardLib "../lib/dashboard";

mixin (
  dashboardState : DashboardTypes.DashboardState,
  authState : AuthTypes.AuthState,
  users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
  members : Map.Map<Common.MemberId, MemberTypes.Member>,
  savingsBalances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
  loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
  journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  savingsTransactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
  installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
) {
  // The current session is the only source of the caller's cooperative role.
  func isAdminSessionDashboard() : Bool {
    switch (authState.currentSession) {
      case null { false };
      case (?userId) {
        switch (users.get(userId)) {
          case null { false };
          case (?user) { user.role == #admin };
        };
      };
    };
  };

  public query ({ caller }) func getDashboardStats() : async DashboardTypes.DashboardStats {
    ignore caller;
    DashboardLib.stats(members, savingsBalances, loans);
  };

  public query ({ caller }) func getCashFlow30Days() : async [DashboardTypes.CashFlowPoint] {
    ignore caller;
    DashboardLib.cashFlow30Days(journals, "100");
  };

  public shared ({ caller }) func uploadLogo(logoUrl : Text) : async Common.Result<()> {
    ignore caller;
    DashboardLib.setLogo(dashboardState, logoUrl);
    #ok(());
  };

  public query ({ caller }) func getLogo() : async Text {
    ignore caller;
    DashboardLib.getLogo(dashboardState);
  };

  public shared ({ caller }) func closeMonth(period : Text) : async Common.Result<()> {
    ignore caller;
    if (not isAdminSessionDashboard()) {
      return #err("Hanya admin yang dapat menutup bulan");
    };
    DashboardLib.closeMonth(dashboardState, period, 0);
  };

  public shared ({ caller }) func closeYear(period : Text) : async Common.Result<()> {
    ignore caller;
    if (not isAdminSessionDashboard()) {
      return #err("Hanya admin yang dapat menutup tahun");
    };
    DashboardLib.closeYear(dashboardState, period, 0);
  };

  public query ({ caller }) func backupDatabase() : async Text {
    ignore caller;
    DashboardLib.backup(members, accounts, journals);
  };

  public shared ({ caller }) func clearTransactionData(confirmation : Text) : async Common.Result<()> {
    ignore caller;
    if (not isAdminSessionDashboard()) {
      return #err("Hanya admin yang dapat membersihkan data");
    };
    if (confirmation != "HAPUS") {
      return #err("Konfirmasi salah. Ketik HAPUS untuk melanjutkan.");
    };
    DashboardLib.clearTransactions(journals, savingsTransactions, installments);
    #ok(());
  };
};
